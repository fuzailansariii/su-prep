import Container from "@/components/container";
import { db } from "@/src/db";
import { results } from "@/src/db/schema";
import { isAuthenticated } from "@/src/lib/auth-helper";
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

type ResultPageProps = {
  params: Promise<{ testId: string; resultId: string }>;
};

export default async function ResultPage({ params }: ResultPageProps) {
  const { testId, resultId } = await params;

  const userId = await isAuthenticated();
  if (!userId) {
    redirect(`/sign-in?redirect_url=/test/${testId}/result/${resultId}`);
  }

  // Fetch the result
  const result = await db.query.results.findFirst({
    where: and(
      eq(results.id, resultId),
      eq(results.testId, testId),
      eq(results.clerkUserId, userId),
    ),
    with: {
      test: true,
      attempt: true,
    },
  });

  if (!result) {
    notFound();
  }

  return (
    <Container className="max-w-4xl bg-[#F2F3FF] flex flex-col gap-6 py-8 min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-4xl tracking-tight font-bold text-brand-primary">
          Test Results
        </h1>
        <p className="text-brand-muted font-sans font-medium">
          {result.test.title}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score Card */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="h-16 w-16 bg-brand-label rounded-full flex items-center justify-center">
            <Trophy className="h-8 w-8 text-brand-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-sans text-brand-muted font-medium mb-1">
              Score
            </p>
            <p className="text-3xl font-heading font-bold text-foreground">
              {result.scoredMarks}{" "}
              <span className="text-lg text-brand-muted font-normal">
                / {result.totalMarks}
              </span>
            </p>
          </div>
        </div>

        {/* Percentage Card */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="h-16 w-16 bg-brand-label rounded-full flex items-center justify-center">
            <Target className="h-8 w-8 text-brand-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-sans text-brand-muted font-medium mb-1">
              Accuracy
            </p>
            <p className="text-3xl font-heading font-bold text-foreground">
              {result.percentage}%
            </p>
          </div>
        </div>

        {/* Time Taken Card */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="h-16 w-16 bg-brand-label rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-brand-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-sans text-brand-muted font-medium mb-1">
              Time Taken
            </p>
            <p className="text-3xl font-heading font-bold text-foreground">
              {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
            </p>
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center gap-4">
          <Button
            asChild
            className="w-full bg-brand-primary hover:bg-brand-primary-hover font-heading font-bold h-11"
          >
            <Link href={`/dashboard`}>Back to Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-6">
        <h2 className="font-heading font-bold text-xl text-foreground">
          Performance Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <p className="text-2xl font-heading font-bold text-foreground">
                {result.skippedAnswers}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
