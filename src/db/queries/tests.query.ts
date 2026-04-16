import { and, eq, isNull } from "drizzle-orm";
import { db } from "..";
import { tests } from "../schema";
import type { NewTest } from "../schema";

// GET all published tests
export async function getPublishedTests() {
  return db
    .select()
    .from(tests)
    .where(and(eq(tests.status, "published"), isNull(tests.deletedAt)));
}

// GET tests by its id
export async function getTestById(id: string) {
  const result = await db
    .select()
    .from(tests)
    .where(and(eq(tests.id, id), isNull(tests.deletedAt)))
    .limit(1);

  return result[0]; // Undefined if not found
}

// GET all Featured tests only
export async function getFeaturedTests() {
  return db
    .select()
    .from(tests)
    .where(
      and(
        eq(tests.status, "published"),
        eq(tests.isFeatured, true),
        isNull(tests.deletedAt),
      ),
    );
}

// Create a new tests (Admin Only)
export async function createTest(data: NewTest) {
  const result = await db.insert(tests).values(data).returning();
  return result[0];
}

// Update a test
export async function updateTest(id: string, data: Partial<NewTest>) {
  const result = await db
    .update(tests)
    .set(data)
    .where(eq(tests.id, id))
    .returning();

  return result[0]; // undefined if not found
}

// Soft delete test
export async function softDeleteTest(id: string) {
  const result = await db
    .update(tests)
    .set({ deletedAt: new Date() })
    .where(eq(tests.id, id))
    .returning();

  return result[0];
}
