import Container from "@/components/container";
import { db } from "@/src/db";
import { tests } from "@/src/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";

async function getPublishedTests() {
  return await db
    .select()
    .from(tests)
    .where(and(eq(tests.status, "published"), isNull(tests.deletedAt)))
    .orderBy(desc(tests.createdAt));
}

export default async function LeaderboardIndexPage() {
  const allTests = await getPublishedTests();

  return (
    <Container className="py-12 max-w-4xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-2 bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-lg text-sm font-bold tracking-widest uppercase font-heading mb-2">
            <Trophy size={16} />
            <span>Leaderboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">
            Top Performers
          </h1>
          <p className="text-slate-500 font-sans">
            Select a test to view its ranking and see how you stack up against other candidates.
          </p>
        </div>

        {allTests.length === 0 ? (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-10 text-center">
            <p className="text-slate-500">No tests available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTests.map((test) => (
              <Link
                key={test.id}
                href={`/leaderboard/${test.id}`}
                className="group flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-5 hover:border-brand-primary/50 hover:shadow-lg hover:shadow-brand-primary/5 transition-all duration-300"
              >
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-1 mb-1">
                    {test.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-sans line-clamp-2 mb-4">
                    {test.description}
                  </p>
                </div>
                <div className="flex items-center text-sm font-bold text-brand-primary uppercase tracking-wider font-heading">
                  View Leaderboard
                  <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
