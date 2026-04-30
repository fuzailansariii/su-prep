import { db } from "@/src/db";
import { attempts, purchases, tests } from "@/src/db/schema";
import { isAuthenticated } from "@/src/lib/auth-helper";
import { and, eq, isNull } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import AttemptClient from "./attempt-client";

type AttemptPageProps = {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ attemptId?: string }>;
};

export default async function AttemptPage({
  params,
  searchParams,
}: AttemptPageProps) {
  const { testId } = await params;
  const { attemptId } = await searchParams;

  const userId = await isAuthenticated();
  if (!userId) {
    redirect(`/sign-in?redirect_url=/test/${testId}/attempt`);
  }

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

  if (!attemptId) {
    redirect(`/test/${testId}`);
  }

  const attempt = await db.query.attempts.findFirst({
    where: and(
      eq(attempts.id, attemptId),
      eq(attempts.testId, testId),
      eq(attempts.clerkUserId, userId),
    ),
  });

  if (!attempt) {
    redirect(`/test/${testId}`);
  }

  if (attempt.status === "completed") {
    redirect(`/test/${testId}/result/${attempt.id}`);
  }

  return <AttemptClient testId={testId} attemptId={attempt.id} />;
}
