import { db } from "@/src/db";
import { attemptAnswers, attempts } from "@/src/db/schema";
import { requireAuth } from "@/src/lib/auth-helper";
import { and, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

type PauseBody = {
  answers: { questionId: string; selectedOptionIds: string[] }[];
  timeTaken: number;
  currentQuestionIndex: number;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  try {
    // auth check
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // validate attempt
    const { attemptId } = await params;
    const attempt = await db.query.attempts.findFirst({
      where: and(
        eq(attempts.id, attemptId),
        eq(attempts.clerkUserId, userId),
        eq(attempts.status, "in_progress"),
      ),
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Attempt not found or not in progress" },
        { status: 404 },
      );
    }

    const body: PauseBody = await req.json();

    const { answers = [], timeTaken = 0, currentQuestionIndex = 0 } = body;

    // Flush all answers + update attempt atomically
    await db.transaction(async (tx) => {
      // clear existing answers for this attempt
      const existingAnswersIds = await tx
        .select({ id: attemptAnswers.id })
        .from(attemptAnswers)
        .where(eq(attemptAnswers.attemptId, attemptId));

      if (existingAnswersIds.length > 0) {
        await tx.delete(attemptAnswers).where(
          inArray(
            attemptAnswers.id,
            existingAnswersIds.map((r) => r.id),
          ),
        );
      }

      // Insert fresh answers
      if (answers.length > 0) {
        await tx.insert(attemptAnswers).values(
          answers.map((a) => ({
            id: nanoid(),
            attemptId,
            questionId: a.questionId,
            selectedOptionIds: a.selectedOptionIds,
            isCorrect: false,
            marksAwarded: 0,
            createdAt: new Date(),
          })),
        );
      }
      // Update attempt: save progress
      await tx
        .update(attempts)
        .set({
          status: "in_progress",
          timeTaken,
          currentQuestionIndex,
          pausedAt: new Date(),
        })
        .where(eq(attempts.id, attemptId));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[attempt/pause]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
