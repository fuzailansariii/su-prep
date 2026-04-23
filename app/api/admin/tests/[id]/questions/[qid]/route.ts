import { db } from "@/src/db";
import { options, questions } from "@/src/db/schema";
import { isAdmin } from "@/src/lib/auth-helper";
import { adminUpdateQuestionSchema } from "@/src/lib/validations/question.validations";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; qid: string }> },
) {
  // Admin check
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { id: testId, qid } = await params;
    const body = await req.json();

    // Verify ownership/existence first
    const existingQuestion = await db.query.questions.findFirst({
      where: and(eq(questions.id, qid), eq(questions.testId, testId)),
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { success: false, error: "Question not found in this test" },
        { status: 404 },
      );
    }

    // Validate body
    const validation = adminUpdateQuestionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: z.treeifyError(validation.error),
        },
        { status: 400 },
      );
    }

    const { options: optionsData, ...questionData } = validation.data;

    // Update question fields if any provided
    if (Object.keys(questionData).length > 0) {
      await db
        .update(questions)
        .set({
          ...questionData,
          updatedAt: new Date(),
        })
        .where(eq(questions.id, qid));
    }

    // Handle options if provided
    if (optionsData && optionsData.length > 0) {
      // Delete old options first
      await db.delete(options).where(eq(options.questionId, qid));

      // Insert new ones
      const newOptions = optionsData.map((opt) => ({
        id: nanoid(),
        questionId: qid,
        optionText: opt.optionText,
        isCorrect: opt.isCorrect,
        order: opt.order,
      }));

      await db.insert(options).values(newOptions);
    }

    return NextResponse.json({
      success: true,
      message: "Question updated successfully",
    });
  } catch (error) {
    console.error("[question/qid/patch] Update failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; qid: string }> },
) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { qid, id: testId } = await params;

    // Delete question and return the deleted rows
    const deletedRows = await db
      .delete(questions)
      .where(and(eq(questions.id, qid), eq(questions.testId, testId)))
      .returning();

    if (deletedRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Question not found in this test" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("[question/qid/delete] Delete failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
