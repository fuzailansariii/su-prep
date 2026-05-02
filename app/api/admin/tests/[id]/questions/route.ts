import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { questions, options, tests } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { isAdmin } from "@/src/lib/auth-helper";
import Papa from "papaparse";
import { adminCreateQuestionSchema } from "@/src/lib/validations/question.validations";
import { sql } from "drizzle-orm";

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
  const contentType = req.headers.get("content-type") || "";

  // 1. JSON (Single Question Creation)
  if (contentType.includes("application/json")) {
    let attemptedOrder = 1;
    try {
      const body = await req.json();
      attemptedOrder = body.order || 1;
      const validation = adminCreateQuestionSchema.safeParse(body);
      
      if (!validation.success) {
        return NextResponse.json({ error: "Validation failed", details: validation.error.format() }, { status: 400 });
      }

      const { options: optionsData, ...questionData } = validation.data;
      const questionId = nanoid();

      await db.insert(questions).values({
        id: questionId,
        testId,
        ...questionData,
      });

      const newOptions = optionsData.map((opt) => ({
        id: nanoid(),
        questionId,
        optionText: opt.optionText,
        isCorrect: opt.isCorrect,
        order: opt.order,
      }));

      await db.insert(options).values(newOptions);

      // Increment test totals using Drizzle (compatible with neon-serverless Pool)
      await db
        .update(tests)
        .set({
          totalQuestions: sql`${tests.totalQuestions} + 1`,
          totalMarks: sql`${tests.totalMarks} + ${questionData.marks}`,
          updatedAt: new Date(),
        })
        .where(eq(tests.id, testId));

      return NextResponse.json({ success: true, message: "Question created" });
    } catch (err) {
      console.error("[questions/route] JSON Insert failed:", err);
      const isUniqueError = err instanceof Error && err.message.includes("unique_question_order");
      return NextResponse.json(
        {
          error: isUniqueError 
            ? `A question with display order ${attemptedOrder} already exists. Please choose a different order.`
            : "Failed to create question.",
          detail: err instanceof Error ? err.message : String(err),
        },
        { status: 500 },
      );
    }
  }

  // 2. FormData (CSV Bulk Upload)
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  // file size validation
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File size should be less than 5MB" },
      { status: 400 },
    );
  }

  const text = await file.text();

  const { data, errors } = Papa.parse<CSVRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  });

  // Check errors
  if (errors.length > 0) {
    return NextResponse.json(
      { error: "CSV parse error", details: errors },
      { status: 400 },
    );
  }

  // Max questions allowed
  if (data.length > 500) {
    return NextResponse.json(
      { error: "Max 500 questions per upload." },
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

  const questionsWithNoOptions = data.filter(
    (question) =>
      !question.optionA &&
      !question.optionB &&
      !question.optionC &&
      !question.optionD,
  );
  if (questionsWithNoOptions.length > 0) {
    return NextResponse.json(
      {
        error: `${questionsWithNoOptions.length} questions have no options. Check rows: ${questionsWithNoOptions.map((r) => r.order).join(", ")}`,
      },
      { status: 400 },
    );
  }

  // neon-http does not support transactions, so we run operations sequentially.
  // First delete existing questions (cascade removes their options too),
  // then insert the new ones. If insert fails, we re-delete to avoid partial data.
  try {
    // Remove old questions for this test
    await db.delete(questions).where(eq(questions.testId, testId));

    //  Insert each question + its options
    const allQuestions = data.map((row) => ({
      id: nanoid(),
      testId,
      questionText: row.question,
      type: row.type as "mcq" | "multi" | "truefalse",
      explanation: row.explanation || null,
      marks: parseInt(row.marks) || 1,
      order: parseInt(row.order) || 0,
      section: row.section || null,
    }));

    await db.insert(questions).values(allQuestions);

    // Insert Options
    const optionRows = data.flatMap((row, i) => {
      const correctLetters = row.correct.toUpperCase().split("|");
      const texts = [row.optionA, row.optionB, row.optionC, row.optionD];
      return ["A", "B", "C", "D"]
        .map((letter, j) => ({ letter, text: texts[j], order: j + 1 }))
        .filter((o) => o.text)
        .map((o) => ({
          id: nanoid(),
          questionId: allQuestions[i].id,
          optionText: o.text,
          isCorrect: correctLetters.includes(o.letter),
          order: o.order,
        }));
    });

    await db.insert(options).values(optionRows);

    // Calculate total marks and update the test
    const totalMarks = allQuestions.reduce((sum, q) => sum + q.marks, 0);
    
    await db
      .update(tests)
      .set({
        totalQuestions: data.length,
        totalMarks: totalMarks,
        updatedAt: new Date(),
      })
      .where(eq(tests.id, testId));

  } catch (err) {
    // Attempt cleanup so we don't leave partial data
    await db
      .delete(questions)
      .where(eq(questions.testId, testId))
      .catch(() => {});
    console.error("[questions/route] Insert failed:", err);
    return NextResponse.json(
      { error: "Failed to insert questions. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ inserted: data.length });
}

// GET request for questions
export async function GET(
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
  try {
    const testId = (await params).id;
    const allQuestions = await db.query.questions.findMany({
      where: eq(questions.testId, testId),
      with: {
        options: true,
      },
      orderBy: (questions, { asc }) => [asc(questions.order)],
    });

    return NextResponse.json({ allQuestions });
  } catch (error) {
    console.error("[questions/route] Fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}
