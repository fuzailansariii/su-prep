import { db } from "@/src/db";
import { results, leaderboard } from "@/src/db/schema";
import { eq, asc, and, or, gt, lt, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function updateUserRank(
  testId: string,
  clerkUserId: string,
  resultId: string,
) {
  // Fetch the user's result to compare against others
  const userResult = await db.query.results.findFirst({
    where: eq(results.id, resultId),
  });

  if (!userResult) return 1;

  // Calculate dense rank: count distinct combinations of (scoredMarks, percentage, timeTaken) that are strictly better
  const betterCountResult = await db
    .select({
      count: sql<number>`count(distinct (${results.scoredMarks}, ${results.percentage}, ${results.timeTaken}))`,
    })
    .from(results)
    .where(
      and(
        eq(results.testId, testId),
        or(
          gt(results.scoredMarks, userResult.scoredMarks),
          and(
            eq(results.scoredMarks, userResult.scoredMarks),
            gt(results.percentage, userResult.percentage),
          ),
          and(
            eq(results.scoredMarks, userResult.scoredMarks),
            eq(results.percentage, userResult.percentage),
            lt(results.timeTaken, userResult.timeTaken),
          ),
        ),
      ),
    );

  const rank = Number(betterCountResult[0].count) + 1;

  // Upsert ONLY this user's rank into the leaderboard
  await db
    .insert(leaderboard)
    .values({
      id: nanoid(),
      testId,
      clerkUserId,
      resultId,
      rank,
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [leaderboard.testId, leaderboard.clerkUserId],
      set: {
        rank,
        resultId,
      },
    });

  return rank;
}

export async function getLeaderboard(testId: string) {
  return await db
    .select({
      rank: leaderboard.rank,
      clerkUserId: leaderboard.clerkUserId,
      scoredMarks: results.scoredMarks,
      totalMarks: results.totalMarks,
      percentage: results.percentage,
      timeTaken: results.timeTaken,
      correctAnswers: results.correctAnswers,
      wrongAnswers: results.wrongAnswers,
    })
    .from(leaderboard)
    .innerJoin(results, eq(leaderboard.resultId, results.id))
    .where(eq(leaderboard.testId, testId))
    .orderBy(asc(leaderboard.rank));
}
