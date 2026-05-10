import { db } from "@/src/db";
import { results, leaderboard } from "@/src/db/schema";
import { eq, asc, and, or, gt, lt, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function recalculateLeaderboard(
  setId: string,
  clerkUserId: string,
) {
  // 1. Fetch all results for this set
  const allResults = await db
    .select()
    .from(results)
    .where(eq(results.setId, setId));

  // 2. Sort in JS using dense ranking logic
  const sorted = allResults.sort((a, b) => {
    if (b.scoredMarks !== a.scoredMarks) return b.scoredMarks - a.scoredMarks;
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    return a.timeTaken - b.timeTaken;
  });

  // 3. Assign dense ranks
  const rankEntries: {
    setId: string;
    clerkUserId: string;
    resultId: string;
    rank: number;
  }[] = [];

  let currentRank = 1;
  let targetUserRank = 1;

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0) {
      const prev = sorted[i - 1];
      const curr = sorted[i];

      const isTied =
        curr.scoredMarks === prev.scoredMarks &&
        curr.percentage === prev.percentage &&
        curr.timeTaken === prev.timeTaken;

      if (!isTied) currentRank = i + 1; // dense ranking
    }

    rankEntries.push({
      setId,
      clerkUserId: sorted[i].clerkUserId,
      resultId: sorted[i].id,
      rank: currentRank,
    });

    if (sorted[i].clerkUserId === clerkUserId) {
      targetUserRank = currentRank;
    }
  }

  // 4. Upsert ALL ranks into leaderboard to ensure previously ranked users are properly shifted down
  for (const entry of rankEntries) {
    await db
      .insert(leaderboard)
      .values({
        id: nanoid(),
        setId: entry.setId,
        clerkUserId: entry.clerkUserId,
        resultId: entry.resultId,
        rank: entry.rank,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [leaderboard.setId, leaderboard.clerkUserId],
        set: {
          rank: entry.rank,
          resultId: entry.resultId,
        },
      });
  }

  // Return the specific user's new rank so it can be displayed on the result page
  return targetUserRank;
}

export async function getLeaderboard(setId: string) {
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
    .where(eq(leaderboard.setId, setId))
    .orderBy(asc(leaderboard.rank));
}
