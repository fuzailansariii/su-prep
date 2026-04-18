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
  { params }: { params: { id: string } },
) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const testId = params.id;
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

  await db.transaction(async (tx) => {
    // Delete existing questions for this test (cascade deletes options too)
    await tx.delete(questions).where(eq(questions.testId, testId));

    for (const row of data) {
      const questionId = nanoid();
      const correctLetters = row.correct.toUpperCase().split("|");

      // Insert question
      await tx.insert(questions).values({
        id: questionId,
        testId,
        questionText: row.question,
        type: row.type as "mcq" | "multi" | "truefalse",
        explanation: row.explanation || null,
        marks: parseInt(row.marks) || 1,
        order: parseInt(row.order),
        section: row.section || null,
      });

      // Build options (only non-empty)
      const optionLetters = ["A", "B", "C", "D"] as const;
      const optionTexts = [row.optionA, row.optionB, row.optionC, row.optionD];

      const optionRows = optionLetters
        .map((letter, i) => ({ letter, text: optionTexts[i], order: i + 1 }))
        .filter((o) => o.text); // skip empty options (e.g. truefalse only has A, B)

      if (optionRows.length > 0) {
        await tx.insert(options).values(
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
  });

  return NextResponse.json({ inserted: data.length });
}
