import { db } from "@/src/db";
import { options, questions, sections } from "@/src/db/schema";
import { isAdmin } from "@/src/lib/auth-helper";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { z } from "zod";

type Context = { params: Promise<{ sectionId: string }> };

const VALID_TYPES = ["mcq", "multi", "truefalse"] as const;
const OPTION_KEYS = ["A", "B", "C", "D"] as const;

const rowSchema = z.object({
  question: z.string().min(1, "question is required"),
  type: z.enum(VALID_TYPES, { error: "type must be mcq, multi, or truefalse" }),
  marks: z.coerce.number().int().min(1).default(1),
  explanation: z.string().optional(),
  option_a: z.string().min(1, "option_a is required"),
  option_b: z.string().min(1, "option_b is required"),
  option_c: z.string().optional(),
  option_d: z.string().optional(),
  correct_options: z.string().min(1, "correct_options is required"),
});

export async function POST(req: NextRequest, { params }: Context) {
  try {
    const admin = await isAdmin();
    if (!admin)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { sectionId } = await params;

    const section = await db.query.sections.findFirst({
      where: eq(sections.id, sectionId),
    });
    if (!section)
      return NextResponse.json({ success: false, message: "Section not found" }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file)
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

    if (rows.length === 0)
      return NextResponse.json({ success: false, message: "Excel file is empty" }, { status: 400 });

    // Get current max order in this set
    const existingQuestions = await db.query.questions.findMany({
      where: eq(questions.setId, section.setId),
      columns: { order: true },
    });
    let orderCounter = existingQuestions.reduce((max, q) => Math.max(max, q.order), 0);

    const errors: { row: number; message: string }[] = [];
    const toInsert: { question: z.infer<typeof rowSchema>; order: number }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const parsed = rowSchema.safeParse(raw);
      if (!parsed.success) {
        errors.push({
          row: i + 2, // 1-indexed + header row
          message: parsed.error.issues.map((e) => e.message).join("; "),
        });
        continue;
      }
      orderCounter++;
      toInsert.push({ question: parsed.data, order: orderCounter });
    }

    if (errors.length > 0)
      return NextResponse.json(
        { success: false, message: "Validation errors in spreadsheet", errors },
        { status: 400 },
      );

    // Insert all questions + options in a transaction
    const inserted = await db.transaction(async (tx) => {
      const created: string[] = [];
      for (const { question: q, order } of toInsert) {
        const questionId = nanoid(12);
        await tx.insert(questions).values({
          id: questionId,
          setId: section.setId,
          sectionId,
          questionText: q.question,
          type: q.type,
          marks: q.marks,
          explanation: q.explanation || null,
          order,
        });

        // Parse correct options e.g. "A,C" → ["A","C"]
        const correctSet = new Set(
          q.correct_options
            .toUpperCase()
            .split(",")
            .map((s) => s.trim()),
        );

        const optionValues = [q.option_a, q.option_b, q.option_c, q.option_d];
        const optionEntries = optionValues
          .map((text, idx) => ({ text, key: OPTION_KEYS[idx] }))
          .filter((o) => o.text && o.text.trim() !== "");

        for (let oi = 0; oi < optionEntries.length; oi++) {
          const { text, key } = optionEntries[oi];
          await tx.insert(options).values({
            id: nanoid(12),
            questionId,
            optionText: text as string,
            isCorrect: correctSet.has(key),
            order: oi + 1,
          });
        }

        created.push(questionId);
      }
      return created;
    });

    return NextResponse.json(
      {
        success: true,
        message: `${inserted.length} question(s) imported successfully`,
        count: inserted.length,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to import questions" },
      { status: 500 },
    );
  }
}
