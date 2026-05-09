import { db } from "@/src/db";
import { sets, tests } from "@/src/db/schema";
import { eq, asc } from "drizzle-orm";
import Link from "next/link";
import { ChevronLeft, Plus, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function SetsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: testId } = await params;

  // Fetch test details
  const test = await db.query.tests.findFirst({
    where: eq(tests.id, testId),
  });

  if (!test) {
    return (
      <Container className="py-8 text-center">
        <h2 className="text-xl font-bold font-heading">Test not found</h2>
      </Container>
    );
  }

  // Fetch sets for this test
  const testSets = await db.query.sets.findMany({
    where: eq(sets.testId, testId),
    orderBy: [asc(sets.order)],
  });

  return (
    <Container className="py-8 md:py-10 px-0 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Top Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button
            asChild
            variant="ghost"
            className="mb-2 -ml-3 text-slate-500 font-heading font-bold"
          >
            <Link href={`/admin/tests/${testId}`}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Test
            </Link>
          </Button>
          <h1 className="text-3xl font-heading font-bold text-slate-900">
            Sets
          </h1>
          <p className="text-sm font-sans text-slate-500 mt-1">
            Manage question sets for {test.title}
          </p>
        </div>

        <Button asChild className="font-heading font-bold bg-brand-primary">
          <Link href={`/admin/tests/${testId}/sets/create`}>
            <Plus className="w-4 h-4 mr-1.5" /> Create New Set
          </Link>
        </Button>
      </div>

      {/* Sets List */}
      {testSets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-center px-4">
          <Settings2 className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-heading font-bold text-slate-900">
            No sets yet
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Create your first set to start adding questions. A test can have
            multiple sets (e.g., Set A, Set B, or Previous Year Papers).
          </p>
          <Button asChild className="font-heading font-bold bg-brand-primary">
            <Link href={`/admin/tests/${testId}/sets/create`}>
              <Plus className="w-4 h-4 mr-1.5" /> Create Set
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testSets.map((set) => (
            <div
              key={set.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-brand-primary/50 transition-colors flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <StatusBadge status={set.status} />
                <span className="text-xs font-heading font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                  Order: {set.order}
                </span>
              </div>

              <h3 className="text-lg font-heading font-bold text-slate-900 line-clamp-1 mb-1">
                {set.title}
              </h3>
              {set.description && (
                <p className="text-sm font-sans text-slate-500 line-clamp-2 mb-4 flex-1">
                  {set.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 mt-auto mb-4 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs text-slate-400 font-sans">Questions</p>
                  <p className="text-sm font-heading font-bold text-slate-700">
                    {set.totalQuestions}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-sans">Duration</p>
                  <p className="text-sm font-heading font-bold text-slate-700">
                    {set.duration} mins
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-sans">Marks</p>
                  <p className="text-sm font-heading font-bold text-slate-700">
                    {set.totalMarks}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-sans">
                    -ve Marking
                  </p>
                  <p className="text-sm font-heading font-bold text-slate-700">
                    {set.negativeMarking
                      ? `-${set.negativeMarkFraction! / 100}`
                      : "No"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-auto">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 font-heading font-bold"
                >
                  <Link href={`/admin/tests/${testId}/sets/${set.id}/edit`}>
                    Edit Set
                  </Link>
                </Button>
                <Button
                  asChild
                  className="flex-1 font-heading font-bold bg-brand-primary"
                >
                  <Link
                    href={`/admin/tests/${testId}/sets/${set.id}/questions`}
                  >
                    Questions
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
