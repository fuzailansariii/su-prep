import { db } from "@/src/db";
import { results } from "@/src/db/schema";
import { eq, asc, sql } from "drizzle-orm";

export async function recalculateLeaderboard(
  setId: string,
  clerkUserId: string,
) {
  // Production Style: 
  // We no longer write to a separate leaderboard table which causes 
  // excessive DB writes. Instead, we compute the rank dynamically.
  // This function just returns the rank of the current user.
  
  const rankSubquery = db
    .select({
      userId: results.clerkUserId,
      rank: sql<number>`dense_rank() OVER (ORDER BY ${results.scoredMarks} DESC, ${results.percentage} DESC, ${results.timeTaken} ASC)`.as("rank"),
    })
    .from(results)
    .where(eq(results.setId, setId))
    .as("rankSubquery");

  const userRank = await db
    .select({ rank: rankSubquery.rank })
    .from(rankSubquery)
    .where(eq(rankSubquery.userId, clerkUserId))
    .limit(1);

  return userRank[0]?.rank ?? 1;
}

export async function getLeaderboard(setId: string) {
  // Use SQL window function to dynamically rank all results on the fly
  const rankedResults = await db
    .select({
      rank: sql<number>`dense_rank() OVER (ORDER BY ${results.scoredMarks} DESC, ${results.percentage} DESC, ${results.timeTaken} ASC)`.mapWith(Number),
      clerkUserId: results.clerkUserId,
      scoredMarks: results.scoredMarks,
      totalMarks: results.totalMarks,
      percentage: results.percentage,
      timeTaken: results.timeTaken,
      correctAnswers: results.correctAnswers,
      wrongAnswers: results.wrongAnswers,
    })
    .from(results)
    .where(eq(results.setId, setId))
    .orderBy(
      sql`${results.scoredMarks} DESC`,
      sql`${results.percentage} DESC`,
      sql`${results.timeTaken} ASC`,
    );

  return rankedResults;
}
