import { db } from "@/src/db";
import { tests } from "@/src/db/schema";
import { eq, isNull, desc, and } from "drizzle-orm";
import TestCard from "@/components/user-tests-card";
import { Box } from "lucide-react";

async function getAllTests() {
  return await db
    .select()
    .from(tests)
    .where(and(eq(tests.status, "draft"), isNull(tests.deletedAt)))
    .orderBy(desc(tests.createdAt));
}

export default async function AllTests() {
  const allTests = await getAllTests();

  if (allTests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 h-full px-6 max-w-md mx-auto border-2 border-dashed border-slate-200 rounded-3xl text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <Box size={40} />
        </div>
        <h3 className="text-xl font-heading font-bold text-slate-900 mb-2">
          No tests available yet
        </h3>
        <p className="text-brand-muted max-w-sm mx-auto font-sans">
          Our team is currently crafting high-quality maritime mock exams for
          you. Please check back later or subscribe for updates!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
      {allTests.map((test) => (
        <TestCard test={test} key={test.id} />
      ))}
    </div>
  );
}
