import { db } from "@/src/db";
import { questions, sets, tests } from "@/src/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Recalculates the total questions and total marks for a given set
 * by summing up all questions associated with it.
 */
export async function syncSetStats(setId: string) {
  try {
    const stats = await db
      .select({
        totalQuestions: sql<number>`count(${questions.id})`.mapWith(Number),
        totalMarks: sql<number>`sum(${questions.marks})`.mapWith(Number),
      })
      .from(questions)
      .where(eq(questions.setId, setId));

    const result = stats[0] || { totalQuestions: 0, totalMarks: 0 };

    const updatedSet = await db
      .update(sets)
      .set({
        totalQuestions: result.totalQuestions || 0,
        totalMarks: result.totalMarks || 0,
      })
      .where(eq(sets.id, setId))
      .returning({ testId: sets.testId });
    
    // Also sync the parent test stats
    if (updatedSet[0]?.testId) {
      await syncTestStats(updatedSet[0].testId);
    }
    
    return result;
  } catch (err) {
    console.error(`Failed to sync stats for set ${setId}:`, err);
    throw err;
  }
}

/**
 * Recalculates the total questions for a given test
 * by summing up totalQuestions from all its sets.
 */
export async function syncTestStats(testId: string) {
  try {
    const stats = await db
      .select({
        totalQuestions: sql<number>`sum(${sets.totalQuestions})`.mapWith(Number),
      })
      .from(sets)
      .where(eq(sets.testId, testId));

    const result = stats[0] || { totalQuestions: 0 };

    await db
      .update(tests)
      .set({
        totalQuestions: result.totalQuestions || 0,
      })
      .where(eq(tests.id, testId));
    
    return result;
  } catch (err) {
    console.error(`Failed to sync stats for test ${testId}:`, err);
    throw err;
  }
}

