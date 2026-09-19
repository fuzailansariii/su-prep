import Container from "@/components/container";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import ListCard from "@/components/ui/list-card";
import { StatCard } from "@/components/ui/stat-card";
import { db } from "@/src/db";
import { attempts, purchases, sets, tests } from "@/src/db/schema";
import { requireAuth } from "@/src/lib/auth-helper";
import { reconcileUserPurchases } from "@/src/lib/razorpay";
import { and, eq, isNull } from "drizzle-orm";
import {
  ArrowLeft,
  BookCheck,
  NotepadText,
  RepeatIcon,
  Timer,
  Layers,
  ChevronRight,
  BarChart,
  Check,
  Hourglass,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import StartSetButton from "@/components/client-tests/start-set-button";

type TestInstructionProps = {
  params: Promise<{ testId: string }>;
};

export default async function TestInstruction({
  params,
}: TestInstructionProps) {
  const { testId } = await params;

  // auth check
  const userId = await requireAuth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=/test/${testId}`);
  }

  // repair purchases paid on Razorpay but never marked completed
  await reconcileUserPurchases(userId, testId);

  // purchase check
  const purchase = await db.query.purchases.findFirst({
    where: and(
      eq(purchases.testId, testId),
      eq(purchases.clerkUserId, userId),
      eq(purchases.status, "completed"),
    ),
  });

  if (!purchase) {
    redirect(`/mock-tests/${testId}`);
  }

  // test exists check
  const test = await db.query.tests.findFirst({
    where: and(
      eq(tests.id, testId),
      eq(tests.status, "published"),
      isNull(tests.deletedAt),
    ),
    with: {
      sets: {
        where: eq(sets.status, "published"),
        orderBy: (s, { asc }) => [asc(s.order)],
      },
    },
  });

  if (!test) {
    notFound();
  }

  // get sets in a test
  const testSets = test.sets;

  const userAttempts = await db.query.attempts.findMany({
    where: and(eq(attempts.clerkUserId, userId), eq(attempts.testId, testId)),
    with: {
      result: true,
    },
  });

  const getAttemptForSet = (setId: string) => {
    // If a user has multiple attempts for the same set (future-proofing), grab the most relevant one
    return (
      userAttempts.find(
        (a) => a.setId === setId && a.status === "in_progress",
      ) ||
      userAttempts.find((a) => a.setId === setId && a.status === "completed") ||
      userAttempts.find((a) => a.setId === setId)
    );
  };

  return (
    <Container className="max-w-3xl bg-[#F2F3FF] flex flex-col gap-10 pb-20">
      <h2 className="font-heading text-4xl tracking-tight font-bold text-brand-primary">
        {test.title}
      </h2>

      <div className="flex flex-col gap-5 rounded-xl bg-white pb-10">
        <div className="w-full flex justify-between items-center rounded-xl py-4 px-3 mt-5 bg-brand-label">
          <h2 className="flex items-center gap-2 font-bold font-sans">
            <span className="h-8 w-8 p-2 bg-brand-button rounded-full text-brand-primary flex items-center">
              <NotepadText />
            </span>
            <span className="md:text-xl">Pre-Test Instruction</span>
          </h2>
          <DifficultyBadge difficulty={test.difficulty} className="h-7" />
        </div>

        <div className="bg-white flex flex-col md:flex-row justify-evenly rounded-xl px-3">
          <StatCard
            icon={Layers}
            label="Total Sets"
            value={testSets.length}
            className="bg-brand-label md:rounded-l-lg md:rounded-t-none rounded-t-lg"
          />
          <StatCard
            icon={Check}
            label="Attempted"
            value={
              testSets.filter(
                (set) => getAttemptForSet(set.id)?.status === "completed",
              ).length
            }
            className="bg-brand-label"
          />
          <StatCard
            icon={Hourglass}
            label="Pending"
            value={
              testSets.length -
              testSets.filter(
                (set) => getAttemptForSet(set.id)?.status === "completed",
              ).length
            }
            className="bg-brand-label md:rounded-r-lg md:rounded-b-none rounded-b-lg"
          />
        </div>

        {/* negative marking warning */}
        {testSets.some((s) => s.negativeMarking) && (
          <div className="mx-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-center font-sans text-red-700 font-medium">
            Negative marking is enabled for some sets.
          </div>
        )}

        <h2 className="font-heading font-bold text-center text-xl mt-5">
          Mandatory Guidelines
        </h2>

        <div className="space-y-3 px-3 pb-5">
          <ListCard
            icon={RepeatIcon}
            title="Do not refresh the page"
            paragraph="Refreshing or navigating away will automatically submit your current progress."
          />
          <ListCard
            icon={Timer}
            title="Ensure a stable connection"
            paragraph="A disconnection lasting longer than 2 minutes may result in session termination."
          />
          <ListCard
            icon={BookCheck}
            title="No external aids allowed"
            paragraph="The browser maintains focus; opening other tabs is strictly prohibited."
          />
          <ListCard
            icon={NotepadText}
            title="Auto-submission"
            paragraph="The test will conclude automatically once the timer reaches zero."
          />
        </div>

        {/* Test Sets List */}
        <div className="px-3">
          <h2 className="font-heading font-bold text-lg mb-4 text-slate-800">
            Available Sets
          </h2>
          {testSets.length === 0 ? (
            <div className="text-center p-6 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 font-sans text-sm">
              No sets available for this test yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {testSets.map((set) => {
                const attempt = getAttemptForSet(set.id);

                return (
                  <div
                    key={set.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-brand-primary/40 transition-colors gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-heading font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                          # {set.order}
                        </span>
                        <h3 className="font-heading font-bold text-slate-900">
                          {set.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-sans text-slate-500">
                        <span className="flex items-center gap-1">
                          <BookCheck size={12} /> {set.totalQuestions} Questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer size={12} /> {set.duration} mins
                        </span>
                        {set.negativeMarking && (
                          <span className="text-red-500 font-medium bg-red-50 px-1.5 py-0.5 rounded">
                            Negative Marking
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full sm:w-auto shrink-0">
                      {!attempt || attempt.status === "abandoned" ? (
                        <StartSetButton testId={testId} setId={set.id} />
                      ) : attempt.status === "in_progress" ? (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full font-heading font-bold text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100 rounded-xl"
                        >
                          <Link
                            href={`/${set.id}`}
                          >
                            Resume Set <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full font-heading font-bold text-brand-primary border-brand-primary/30 bg-brand-primary/5 hover:bg-brand-primary/10 rounded-xl"
                        >
                          <Link href={`/results/${attempt.result?.id || attempt.id}`}>
                            <BarChart className="w-4 h-4 mr-1.5" /> View Results
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* back button */}
        <div className="px-3 mt-4">
          <Button
            asChild
            variant="outline"
            className="w-full h-10 text-xs font-semibold font-heading rounded-xl"
          >
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Go Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
