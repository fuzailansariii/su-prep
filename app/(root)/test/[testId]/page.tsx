import Container from "@/components/container";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import ListCard from "@/components/ui/list-card";
import { StatCard } from "@/components/ui/stat-card";
import { db } from "@/src/db";
import { attempts, purchases, tests } from "@/src/db/schema";
import { isAuthenticated } from "@/src/lib/auth-helper";
import { and, eq, isNull } from "drizzle-orm";
import {
  ArrowLeft,
  BookCheck,
  NotepadText,
  RepeatIcon,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import StartTestButton from "@/components/client-tests/start-test-button";

type TestInstructionProps = {
  params: Promise<{ testId: string }>;
};

export default async function TestInstruction({
  params,
}: TestInstructionProps) {
  const { testId } = await params;

  // 1. auth check
  const userId = await isAuthenticated();
  if (!userId) {
    redirect(`/sign-in?redirect_url=/test/${testId}`);
  }

  // 2. purchase check
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

  // 3. test exists check
  const test = await db.query.tests.findFirst({
    where: and(
      eq(tests.id, testId),
      eq(tests.status, "published"),
      isNull(tests.deletedAt),
    ),
  });

  if (!test) {
    notFound();
  }

  // 4. completed attempt check → redirect to result
  const completedAttempt = await db.query.attempts.findFirst({
    where: and(
      eq(attempts.clerkUserId, userId),
      eq(attempts.testId, testId),
      eq(attempts.status, "completed"),
    ),
  });

  if (completedAttempt) {
    redirect(`/test/${testId}/result/${completedAttempt.id}`);
  }

  // 5. in_progress attempt check → resume
  const inProgressAttempt = await db.query.attempts.findFirst({
    where: and(
      eq(attempts.clerkUserId, userId),
      eq(attempts.testId, testId),
      eq(attempts.status, "in_progress"),
    ),
  });

  return (
    <Container className="max-w-3xl bg-[#F2F3FF] flex flex-col gap-10">
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
            icon={Timer}
            label="Duration"
            value={`${test.duration} min`}
            className="bg-brand-label md:rounded-l-lg md:rounded-t-none rounded-t-lg"
          />
          <StatCard
            icon={BookCheck}
            label="Questions"
            value={test.totalQuestions}
            className="bg-brand-label"
          />
          <StatCard
            icon={RepeatIcon}
            label="Attempt"
            value="1 only"
            className="bg-brand-label md:rounded-r-lg md:rounded-b-none rounded-b-lg"
          />
        </div>

        {/* negative marking warning */}
        {test.negativeMarking && (
          <div className="mx-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-center font-sans text-red-700 font-medium">
            Negative marking is enabled — each wrong answer deducts{" "}
            <strong>
              {((test.negativeMarkFraction ?? 25) / 100).toFixed(2)}x
            </strong>{" "}
            marks.
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

        {/* buttons */}
        <div className="px-3 flex flex-col gap-5">
          <StartTestButton testId={test.id} isResuming={!!inProgressAttempt} />
          <Button
            asChild
            variant="outline"
            className="w-full h-10 text-xs font-semibold font-heading"
          >
            <Link href="/dashboard">
              <ArrowLeft />
              <span>Go Back to Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
