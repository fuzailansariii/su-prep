import { and, eq } from "drizzle-orm";
import { db } from "..";
import { attemptAnswers, attempts } from "../schema";
import type { NewAttempt, NewAttemptAnswer } from "../schema";

export async function createAttempt(data: NewAttempt) {
  const result = await db.insert(attempts).values(data).returning();
  return result[0];
}

export async function getAttemptById(attemptId: string) {
  return db.query.attempts.findFirst({
    where: eq(attempts.id, attemptId),
  });
}

// Prevents duplicate active attempts for same user + test
export async function getActiveAttempt(clerkUserId: string, testId: string) {
  return db.query.attempts.findFirst({
    where: and(
      eq(attempts.clerkUserId, clerkUserId),
      eq(attempts.testId, testId),
      eq(attempts.status, "in_progress"),
    ),
  });
}

// "My Attempts" page — returns attempts with test info + score embedded
export async function getUserAttempts(clerkUserId: string) {
  return db.query.attempts.findMany({
    where: eq(attempts.clerkUserId, clerkUserId),
    with: {
      test: {
        columns: {
          id: true,
          title: true,
          thumbnail: true,
          totalQuestions: true,
        },
      },
      result: {
        columns: {
          scoredMarks: true,
          totalMarks: true,
          percentage: true,
          timeTaken: true,
        },
      },
    },
  });
}

// Used in submit route — gets attempt + all saved answers in one query
export async function getAttemptWithAnswers(attemptId: string) {
  return db.query.attempts.findFirst({
    where: eq(attempts.id, attemptId),
    with: {
      answers: true,
    },
  });
}

// Upsert — student can change answer before submitting
// onConflictDoUpdate handles the case where answer already exists
export async function upsertAttemptAnswer(data: NewAttemptAnswer) {
  const result = await db
    .insert(attemptAnswers)
    .values(data)
    .onConflictDoUpdate({
      target: [attemptAnswers.attemptId, attemptAnswers.questionId],
      set: {
        selectedOptionIds: data.selectedOptionIds,
        isCorrect: data.isCorrect,
        marksAwarded: data.marksAwarded,
      },
    })
    .returning();
  return result[0];
}

export async function getAttemptAnswers(attemptId: string) {
  return db
    .select()
    .from(attemptAnswers)
    .where(eq(attemptAnswers.attemptId, attemptId));
}

export async function markAttemptComplete(
  attemptId: string,
  timeTaken: number,
) {
  const result = await db
    .update(attempts)
    .set({
      status: "completed",
      submittedAt: new Date(),
      timeTaken,
    })
    .where(eq(attempts.id, attemptId))
    .returning();
  return result[0];
}
