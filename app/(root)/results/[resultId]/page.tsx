import Container from "@/components/container";
import { db } from "@/src/db";
import { attemptAnswers, results } from "@/src/db/schema";
import { requireAuth } from "@/src/lib/auth-helper";
import { recalculateLeaderboard } from "@/src/lib/leaderboard";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import {
  CheckCircle,
  Clock,
  Target,
  Trophy,
  XCircle,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import QuestionBreakdownAccordion from "@/components/results/question-breakdown-accordion";

type ResultPageProps = {
  params: Promise<{ resultId: string }>;
};

export default async function ResultPage({ params }: ResultPageProps) {
  const { resultId } = await params;

  const userId = await requireAuth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=/results/${resultId}`);
  }

  // Fetch the result
  const result = await db.query.results.findFirst({
    where: and(eq(results.id, resultId), eq(results.clerkUserId, userId)),
    with: {
      test: true,
      attempt: true,
    },
  });

  if (!result) {
    notFound();
  }

  // Fetch detailed attempt answers with questions, options, and sections
  const attemptAnswersData = await db.query.attemptAnswers.findMany({
    where: eq(attemptAnswers.attemptId, result.attemptId),
    with: {
      question: {
        with: {
          options: true,
          section: true,
        },
      },
    },
  });

  const rank = await recalculateLeaderboard(result.setId, userId);

  return (
    <Container className="max-w-4xl bg-[#F2F3FF] flex flex-col gap-6 py-8 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-4xl tracking-tight font-bold text-brand-primary">
            Test Results
          </h1>
          <p className="text-brand-muted font-sans font-medium">
            {result.test.title}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            asChild
            size={"lg"}
            variant="outline"
            className="font-heading text-[13px] font-bold rounded-xl"
          >
            <Link href={`/mock-tests`}>Mock Tests</Link>
          </Button>
          <Button
            asChild
            size={"lg"}
            className="bg-brand-primary text-[13px] hover:bg-brand-primary/90 font-heading font-bold rounded-xl"
          >
            <Link href={`/leaderboard/${result.testId}?setId=${result.setId}`}>
              View Leaderboard
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rank Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3 relative overflow-hidden">
          {rank <= 3 && (
            <div
              className={`absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full pointer-events-none ${
                rank === 1
                  ? "bg-yellow-500"
                  : rank === 2
                    ? "bg-slate-500"
                    : "bg-amber-600"
              }`}
            />
          )}
          <div className="h-16 w-16 bg-brand-label rounded-full flex items-center justify-center">
            <Trophy className="h-8 w-8 text-brand-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-sans text-brand-muted font-medium mb-1">
              Global Rank
            </p>
            <p className="text-3xl font-heading font-bold text-slate-800">
              #{rank}
            </p>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="h-16 w-16 bg-brand-label rounded-full flex items-center justify-center">
            <Target className="h-8 w-8 text-brand-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-sans text-brand-muted font-medium mb-1">
              Score
            </p>
            <p className="text-3xl font-heading font-bold text-slate-800">
              {result.scoredMarks}{" "}
              <span className="text-lg text-slate-400 font-normal">
                out of {result.totalMarks}
              </span>
            </p>
          </div>
        </div>

        {/* Percentage Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="h-16 w-16 bg-brand-label rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-brand-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-sans text-brand-muted font-medium mb-1">
              Accuracy
            </p>
            <p className="text-3xl font-heading font-bold text-slate-800">
              {result.percentage}%
            </p>
          </div>
        </div>

        {/* Time Taken Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="h-16 w-16 bg-brand-label rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-brand-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-sans text-brand-muted font-medium mb-1">
              Time Taken
            </p>
            <p className="text-3xl font-heading font-bold text-slate-800">
              {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
        <h2 className="font-heading font-bold text-xl text-slate-800">
          Performance Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-emerald-100 bg-emerald-50">
            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-sans text-emerald-800 font-medium">
                Correct
              </p>
              <p className="text-2xl font-heading font-bold text-emerald-900">
                {result.correctAnswers}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl border border-red-100 bg-red-50">
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-sans text-red-800 font-medium">
                Incorrect
              </p>
              <p className="text-2xl font-heading font-bold text-red-900">
                {result.wrongAnswers}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl border border-brand-label bg-brand-card">
            <div className="h-10 w-10 bg-brand-label rounded-full flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-sm font-sans text-brand-muted font-medium">
                Skipped
              </p>
              <p className="text-2xl font-heading font-bold text-slate-800">
                {result.skippedAnswers}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl border border-orange-100 bg-orange-50">
            <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-sans text-orange-800 font-medium">
                Marks Lost
              </p>
              <p className="text-2xl font-heading font-bold text-orange-900">
                -{result.marksLost}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Solutions & Answer Key Accordion */}
      <QuestionBreakdownAccordion answers={attemptAnswersData} />
    </Container>
  );
}
