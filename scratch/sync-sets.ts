import { db } from "../src/db";
import { sets, questions, tests } from "../src/db/schema";
import { eq, sql } from "drizzle-orm";

async function syncAll() {
  console.log("Starting full sync...");
  
  const allSets = await db.select({ id: sets.id, testId: sets.testId }).from(sets);
  
  for (const set of allSets) {
    const stats = await db
      .select({
        totalQuestions: sql<number>`count(${questions.id})`.mapWith(Number),
        totalMarks: sql<number>`sum(${questions.marks})`.mapWith(Number),
      })
      .from(questions)
      .where(eq(questions.setId, set.id));

    const result = stats[0] || { totalQuestions: 0, totalMarks: 0 };

    await db
      .update(sets)
      .set({
        totalQuestions: result.totalQuestions || 0,
        totalMarks: result.totalMarks || 0,
      })
      .where(eq(sets.id, set.id));
    
    console.log(`Updated set ${set.id}: ${result.totalQuestions} questions`);
  }

  const allTests = await db.select({ id: tests.id }).from(tests);
  for (const test of allTests) {
    const stats = await db
      .select({
        totalQuestions: sql<number>`sum(${sets.totalQuestions})`.mapWith(Number),
      })
      .from(sets)
      .where(eq(sets.testId, test.id));

    const result = stats[0] || { totalQuestions: 0 };

    await db
      .update(tests)
      .set({
        totalQuestions: result.totalQuestions || 0,
      })
      .where(eq(tests.id, test.id));
    
    console.log(`Updated test ${test.id}: ${result.totalQuestions} questions total`);
  }
  
  console.log("Sync complete!");
  process.exit(0);
}

syncAll().catch(err => {
  console.error(err);
  process.exit(1);
});
