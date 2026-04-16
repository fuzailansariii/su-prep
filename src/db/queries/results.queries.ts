import { eq } from "drizzle-orm";
import { db } from "..";
import { leaderboard, results } from "../schema";
import type { NewLeaderboard, NewResult } from "../schema";

export async function createResult(data: NewResult) {
  const result = await db.insert(results).values(data).returning();
  return result[0];
}

// Used in result page — returns result + test info + attempt timing
export async function getResultByAttemptId(attemptId: string) {
  return db.query.results.findFirst({
    where: eq(results.attemptId, attemptId),
    with: {
      test: {
        columns: {
          id: true,
          title: true,
          totalQuestions: true,
          totalMarks: true,
          negativeMarking: true,
        },
      },
      attempt: {
        columns: {
          startedAt: true,
          submittedAt: true,
          timeTaken: true,
        },
      },
    },
  });
}

// "My Results" page — with test card info embedded
export async function getUserResults(clerkUserId: string) {
  return db.query.results.findMany({
    where: eq(results.clerkUserId, clerkUserId),
    with: {
      test: {
        columns: {
          id: true,
          title: true,
          thumbnail: true,
        },
      },
    },
  });
}

// Leaderboard with score details embedded
export async function getLeaderboardForTest(testId: string) {
  return db.query.leaderboard.findMany({
    where: eq(leaderboard.testId, testId),
    orderBy: leaderboard.rank,
    with: {
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

export async function upsertLeaderboardEntry(data: NewLeaderboard) {
  const result = await db
    .insert(leaderboard)
    .values(data)
    .onConflictDoUpdate({
      target: [leaderboard.testId, leaderboard.clerkUserId],
      set: {
        rank: data.rank,
        resultId: data.resultId,
      },
    })
    .returning();
  return result[0];
}
