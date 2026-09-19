import { db } from "@/src/db";
import {
  options,
  questions,
  sections,
  type NewOption,
  type NewQuestion,
} from "@/src/db/schema";
import { isAdmin } from "@/src/lib/auth-helper";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { z } from "zod";
import { syncSetStats } from "@/src/lib/set-utils";

type Context = { params: Promise<{ sectionId: string }> };

const VALID_TYPES = ["mcq", "multi", "truefalse"] as const;
const OPTION_KEYS = ["A", "B", "C", "D"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = [".xlsx", ".xls"];
// Stay well under Postgres' 65535 bind-parameter limit per insert
const INSERT_CHUNK_SIZE = 500;

const rowSchema = z
  .object({
    question: z.coerce.string().trim().min(1, "question is required"),
    type: z.enum(VALID_TYPES, { error: "type must be mcq, multi, or truefalse" }),
    marks: z.coerce.number().int().min(1).default(1),
    explanation: z.coerce.string().optional(),
    option_a: z.coerce.string().trim().min(1, "option_a is required"),
    option_b: z.coerce.string().trim().min(1, "option_b is required"),
    option_c: z.coerce.string().trim().optional(),
    option_d: z.coerce.string().trim().optional(),
    correct_options: z.coerce.string().trim().min(1, "correct_options is required"),
  })
  .superRefine((row, ctx) => {
    // "A,C" / "a | c" → ["A","C"]
    const correct = parseCorrectOptions(row.correct_options);
    const filled: Record<string, boolean> = {
      A: !!row.option_a,
      B: !!row.option_b,
      C: !!row.option_c,
      D: !!row.option_d,
    };

    const invalid = correct.filter((k) => !(k in filled));
    if (invalid.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: `correct_options has invalid value(s): ${invalid.join(", ")} — use A, B, C or D`,
      });
      return;
    }

    const empty = correct.filter((k) => !filled[k]);
    if (empty.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: `correct_options points to empty option(s): ${empty.join(", ")}`,
      });
    }

    if (row.type !== "multi" && correct.length !== 1) {
      ctx.addIssue({
        code: "custom",
        message: `${row.type} questions need exactly one correct option (got ${correct.length})`,
      });
    }
  });

function parseCorrectOptions(value: string): string[] {
  return [
    ...new Set(
      value
        .toUpperCase()
        .split(/[,|]/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
}

// "Option A" / "OPTION_A" / " question " → "option_a" / "question"
function normalizeHeaders(row: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.trim().toLowerCase().replace(/\s+/g, "_"),
      value,
    ]),
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(req: NextRequest, { params }: Context) {
  try {
    const admin = await isAdmin();
    if (!admin) return fail("Unauthorized", 401);

    const { sectionId } = await params;

    const section = await db.query.sections.findFirst({
      where: eq(sections.id, sectionId),
    });
    if (!section) return fail("Section not found", 404);

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return fail("No file uploaded", 400);

    const fileName = file.name.toLowerCase();
    if (!ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext)))
      return fail("Only Excel files (.xlsx, .xls) are accepted", 400);
    if (file.size > MAX_FILE_SIZE)
      return fail("Excel file must be under 5MB", 400);

    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils
      .sheet_to_json<Record<string, unknown>>(ws, { defval: "" })
      .map(normalizeHeaders);

    if (rows.length === 0) return fail("Excel file is empty", 400);

    // Get current max order in this set
    const existingQuestions = await db.query.questions.findMany({
      where: eq(questions.setId, section.setId),
      columns: { order: true },
    });
    let orderCounter = existingQuestions.reduce((max, q) => Math.max(max, q.order), 0);

    const errors: { row: number; message: string }[] = [];
    const questionRows: NewQuestion[] = [];
    const optionRows: NewOption[] = [];

    for (let i = 0; i < rows.length; i++) {
      const parsed = rowSchema.safeParse(rows[i]);
      if (!parsed.success) {
        errors.push({
          row: i + 2, // 1-indexed + header row
          message: parsed.error.issues.map((e) => e.message).join("; "),
        });
        continue;
      }

      const q = parsed.data;
      const questionId = nanoid(12);
      orderCounter++;

      questionRows.push({
        id: questionId,
        setId: section.setId,
        sectionId,
        questionText: q.question,
        type: q.type,
        marks: q.marks,
        explanation: q.explanation?.trim() || null,
        order: orderCounter,
      });

      const correctSet = new Set(parseCorrectOptions(q.correct_options));
      [q.option_a, q.option_b, q.option_c, q.option_d]
        .map((text, idx) => ({ text, key: OPTION_KEYS[idx] }))
        .filter((o): o is { text: string; key: (typeof OPTION_KEYS)[number] } => !!o.text)
        .forEach(({ text, key }, oi) => {
          optionRows.push({
            id: nanoid(12),
            questionId,
            optionText: text,
            isCorrect: correctSet.has(key),
            order: oi + 1,
          });
        });
    }

    if (errors.length > 0)
      return NextResponse.json(
        { success: false, message: "Validation errors in spreadsheet", errors },
        { status: 400 },
      );

    // Insert all questions + options in a transaction, batched
    await db.transaction(async (tx) => {
      for (const batch of chunk(questionRows, INSERT_CHUNK_SIZE))
        await tx.insert(questions).values(batch);
      for (const batch of chunk(optionRows, INSERT_CHUNK_SIZE))
        await tx.insert(options).values(batch);
    });

    // Sync set stats
    await syncSetStats(section.setId);

    return NextResponse.json(
      {
        success: true,
        message: `${questionRows.length} question(s) imported successfully`,
        count: questionRows.length,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[sections/import]", err);
    return fail("Failed to import questions", 500);
  }
}
