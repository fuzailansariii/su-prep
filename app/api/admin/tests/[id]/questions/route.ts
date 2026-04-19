import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { questions, options } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { isAdmin } from "@/src/lib/auth-helper";
import Papa from "papaparse";

interface CSVRow {
  order: string;
  type: string;
  question: string;
  explanation: string;
  marks: string;
  section: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: string; // "A", "B|C", etc.
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const testId = id;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const text = await file.text();

  const { data, errors } = Papa.parse<CSVRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  });

  if (errors.length > 0) {
    return NextResponse.json(
      { error: "CSV parse error", details: errors },
      { status: 400 },
    );
  }

  // Validate required fields
  const invalid = data.filter(
    (row) => !row.order || !row.type || !row.question || !row.correct,
  );
  if (invalid.length > 0) {
    return NextResponse.json(
      { error: `${invalid.length} rows missing required fields` },
      { status: 400 },
    );
  }

  // neon-http does not support transactions, so we run operations sequentially.
  // First delete existing questions (cascade removes their options too),
  // then insert the new ones. If insert fails, we re-delete to avoid partial data.
  try {
    // 1. Remove old questions for this test
    await db.delete(questions).where(eq(questions.testId, testId));

    // 2. Insert each question + its options
    for (const row of data) {
      const questionId = nanoid();
      const correctLetters = row.correct.toUpperCase().split("|");

      await db.insert(questions).values({
        id: questionId,
        testId,
        questionText: row.question,
        type: row.type as "mcq" | "multi" | "truefalse",
        explanation: row.explanation || null,
        marks: parseInt(row.marks) || 1,
        order: parseInt(row.order),
        section: row.section || null,
      });

      const optionLetters = ["A", "B", "C", "D"] as const;
      const optionTexts = [row.optionA, row.optionB, row.optionC, row.optionD];

      const optionRows = optionLetters
        .map((letter, i) => ({ letter, text: optionTexts[i], order: i + 1 }))
        .filter((o) => o.text);

      if (optionRows.length > 0) {
        await db.insert(options).values(
          optionRows.map((o) => ({
            id: nanoid(),
            questionId,
            optionText: o.text,
            isCorrect: correctLetters.includes(o.letter),
            order: o.order,
          })),
        );
      }
    }
  } catch (err) {
    // Attempt cleanup so we don't leave partial data
    await db.delete(questions).where(eq(questions.testId, testId)).catch(() => {});
    console.error("[questions/route] Insert failed:", err);
    return NextResponse.json(
      { error: "Failed to insert questions. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ inserted: data.length });
}

