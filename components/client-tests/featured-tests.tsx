import { db } from "@/src/db";
import { tests } from "@/src/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import TestCard from "../user-tests-card";
import type { Test } from "@/src/db/schema";

async function getFeaturedTests() {
  return await db.query.tests.findMany({
    where: and(eq(tests.isFeatured, true), isNull(tests.deletedAt)),
    orderBy: desc(tests.createdAt),
    limit: 2,
  });
}

export default async function FeaturedTests() {
  let featuredTests: Test[] = [];

  try {
    featuredTests = await getFeaturedTests();
  } catch (error) {
    console.error("Failed to fetch featured tests:", error);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
      {featuredTests.map((test) => (
        <TestCard test={test} key={test.id} />
      ))}
    </div>
  );
}
