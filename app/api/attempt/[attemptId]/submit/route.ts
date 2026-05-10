import { db } from "@/src/db";
import {
  attemptAnswers,
  attempts,
  options,
  questions,
  results,
  tests,
  sets,
} from "@/src/db/schema";
import { requireAuth } from "@/src/lib/auth-helper";
import { recalculateLeaderboard } from "@/src/lib/leaderboard";
import { and, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubmitBody = {
  answers: { questionId: string; selectedOptionIds: string[] }[];
};

// ─── POST /api/attempt/[attemptId]/submit ─────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { attemptId } = await params;

    // 1. Verify attempt belongs to user and is in_progress
    const attempt = await db.query.attempts.findFirst({
      where: and(
        eq(attempts.id, attemptId),
        eq(attempts.clerkUserId, userId),
        eq(attempts.status, "in_progress"),
      ),
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Attempt not found or already completed" },
        { status: 404 },
      );
    }

    // 2. Parse submitted answers
    const body: SubmitBody = await req.json();
    const submittedAnswers = body.answers ?? [];

    // 3. Fetch set (for marks config)
    const set = await db.query.sets.findFirst({
      where: eq(sets.id, attempt.setId),
    });

    if (!set) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

    // 4. Fetch all questions for this set (with full options including isCorrect)
    const testQuestions = await db.query.questions.findMany({
      where: eq(questions.setId, attempt.setId),
      with: {
        options: {
          columns: { id: true, isCorrect: true },
        },
      },
      columns: { id: true, marks: true },
    });

    // Build a quick lookup map
    const questionMap = new Map(testQuestions.map((q) => [q.id, q]));

    // 5. Evaluate each answer
    let totalScoredMarks = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const answerRows: {
      id: string;
      attemptId: string;
      questionId: string;
      selectedOptionIds: string[];
      isCorrect: boolean;
      marksAwarded: number;
      createdAt: Date;
    }[] = [];

    for (const submitted of submittedAnswers) {
      const question = questionMap.get(submitted.questionId);
      if (!question) continue;

      const correctIds = question.options
        .filter((o) => o.isCorrect)
        .map((o) => o.id)
        .sort();

      const selectedIds = (submitted.selectedOptionIds ?? []).sort();
      const isSkipped = selectedIds.length === 0;

      let isCorrect = false;
      let marksAwarded = 0;

      if (isSkipped) {
        skippedCount++;
        marksAwarded = 0;
      } else {
        // Correct only if the sorted arrays match exactly
        isCorrect =
          correctIds.length === selectedIds.length &&
          correctIds.every((id, i) => id === selectedIds[i]);

        if (isCorrect) {
          correctCount++;
          marksAwarded = question.marks;
        } else {
          wrongCount++;
          if (set.negativeMarking) {
            marksAwarded = -Math.round(
              question.marks * ((set.negativeMarkFraction ?? 25) / 100),
            );
          } else {
            marksAwarded = 0;
          }
        }
      }

      totalScoredMarks += marksAwarded;

      answerRows.push({
        id: nanoid(),
        attemptId,
        questionId: submitted.questionId,
        selectedOptionIds: selectedIds,
        isCorrect,
        marksAwarded,
        createdAt: new Date(),
      });
    }

    // Clamp scored marks to 0 minimum
    const finalScoredMarks = Math.max(0, totalScoredMarks);
    const timeTaken = Math.floor(
      (Date.now() - attempt.startedAt.getTime()) / 1000,
    );
    const percentage = Math.round((finalScoredMarks / set.totalMarks) * 100);

    // 6. Write everything atomically inside a transaction
    const resultId = nanoid();
    await db.transaction(async (tx) => {
      // Upsert answers: clear old ones first if resuming
      const existingAnswerIds = await tx
        .select({ id: attemptAnswers.id })
        .from(attemptAnswers)
        .where(eq(attemptAnswers.attemptId, attemptId));

      if (existingAnswerIds.length > 0) {
        await tx.delete(attemptAnswers).where(
          inArray(
            attemptAnswers.id,
            existingAnswerIds.map((r) => r.id),
          ),
        );
      }

      if (answerRows.length > 0) {
        await tx.insert(attemptAnswers).values(answerRows);
      }

      // Mark attempt completed
      await tx
        .update(attempts)
        .set({
          status: "completed",
          submittedAt: new Date(),
          timeTaken,
        })
        .where(eq(attempts.id, attemptId));

      // Insert result record
      await tx.insert(results).values({
        id: resultId,
        clerkUserId: userId,
        testId: attempt.testId,
        setId: attempt.setId,
        attemptId: attemptId,
        totalMarks: set.totalMarks,
        scoredMarks: finalScoredMarks,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        skippedAnswers: skippedCount,
        percentage,
        timeTaken,
        createdAt: new Date(),
      });
    });

    // Recalculate all ranks and get the current user's rank
    const rank = await recalculateLeaderboard(attempt.setId, userId);

    return NextResponse.json({ resultId, rank });
  } catch (error) {
    console.error("[attempt/submit]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
