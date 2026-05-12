import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { attempts, purchases, results } from "@/src/db/schema";
import { desc, eq, and } from "drizzle-orm";
import Container from "@/components/container";
import { StatCard } from "@/components/ui/stat-card";
import {
  BookOpen,
  Target,
  Award,
  ArrowRight,
  Activity,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PurchasedTestCard from "@/components/purchased-test-card";
import { Image } from "@imagekit/next";
import type { Test } from "@/src/db/schema/tests";

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const firstName = (sessionClaims?.firstName as string) ?? "Student";

  const userAttempts = await db.query.attempts.findMany({
    where: eq(attempts.clerkUserId, userId),
    with: { test: true, set: true },
    orderBy: [desc(attempts.startedAt)],
  });

  // recent attempts
  const recentAttempts = userAttempts.slice(0, 3);

  // map testId → attempt
  const attemptMap = new Map(userAttempts.map((a) => [a.testId, a]));

  // Fetch results to calculate total attempts and average score
  const userResults = await db.query.results.findMany({
    where: eq(results.clerkUserId, userId),
  });

  const resultMap = new Map(userResults.map((r) => [r.attemptId, r]));

  const totalCompleted = userResults.length;
  const averageScore =
    totalCompleted > 0
      ? Math.round(
          userResults.reduce((acc, curr) => acc + curr.percentage, 0) /
            totalCompleted,
        )
      : 0;

  // Fetch user's purchases with the associated test
  const userPurchases = await db.query.purchases.findMany({
    where: and(
      eq(purchases.clerkUserId, userId),
      eq(purchases.status, "completed"),
    ),
    with: {
      test: true,
    },
    orderBy: [desc(purchases.createdAt)],
  });

  // These links go to pages that require tests to be published.
  // Filter here to avoid dashboard showing items that later 404.
  const purchasedTests = userPurchases
    .map((p) => p.test)
    .filter(
      (t): t is Test => !!t && t.status === "published" && t.deletedAt === null,
    );

  return (
    <div className="bg-[#FAF8FF] min-h-screen pb-20">
      {/* Header section with solid color/pattern background */}
      <div className="bg-white border-b border-slate-200 pt-8">
        <Container>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-2">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-slate-500 font-sans mb-10">
            Here's a quick overview of your test preparation progress.
          </p>

          <div className="grid grid-cols-2 border rounded-2xl sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            <StatCard
              icon={Target}
              label="Completed Tests"
              value={totalCompleted}
            />
            <StatCard
              icon={Award}
              label="Average Score"
              value={`${averageScore}%`}
            />
            <StatCard
              icon={BookOpen}
              label="Purchased Tests"
              value={purchasedTests.length}
            />
          </div>
        </Container>
      </div>

      <Container className="-mt-6 space-y-8">
        {/* Recent Activity Section */}
        {recentAttempts.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                <Activity className="text-brand-primary w-5 h-5" /> Recent
                Activity
              </h2>
            </div>

            <div className="space-y-4">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                      {attempt.test?.thumbnail ? (
                        <Image
                          urlEndpoint={
                            process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
                          }
                          src={attempt.test.thumbnail}
                          alt={attempt.test.title}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-slate-900 text-sm md:text-base leading-tight">
                        {attempt.test?.title || "Unknown Test"}
                      </h3>
                      <p className="text-[10px] font-heading font-black uppercase tracking-widest text-brand-primary mt-0.5">
                        {attempt.set?.title || "Unknown Set"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-sans mt-1">
                        Started on{" "}
                        {new Date(attempt.startedAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                        attempt.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : attempt.status === "in_progress"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {attempt.status === "in_progress"
                        ? "In Progress"
                        : attempt.status === "completed"
                          ? "Completed"
                          : "Abandoned"}
                    </span>

                    {attempt.status === "in_progress" && (
                      <Button
                        asChild
                        size="sm"
                        className="font-heading font-bold text-xs h-8 rounded-lg"
                      >
                        <Link href={`/test/${attempt.testId}`}>
                          Resume
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* My Tests Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
              <Zap className="text-brand-primary w-6 h-6" /> My Tests
            </h2>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="font-bold font-heading h-8"
            >
              <Link href="/mock-tests">
                Browse More <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          {purchasedTests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {purchasedTests.map((test) => {
                const attempt = attemptMap.get(test.id);
                const result = attempt ? resultMap.get(attempt.id) : undefined;

                return (
                  <PurchasedTestCard
                    key={test.id}
                    test={test}
                    attemptStatus={
                      !attempt
                        ? "not_started"
                        : attempt.status === "completed"
                          ? "completed"
                          : "in_progress"
                    }
                    attemptId={attempt?.id}
                    resultId={result?.id}
                    score={result?.percentage}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-heading font-bold text-slate-900 mb-2">
                No tests unlocked yet
              </h3>
              <p className="text-slate-500 font-sans max-w-sm mb-6">
                You haven't purchased or unlocked any tests. Browse our
                collection to start your preparation!
              </p>
              <Button
                asChild
                className="font-bold font-heading rounded-xl h-11 px-6"
              >
                <Link href="/mock-tests">Explore Mock Tests</Link>
              </Button>
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}
