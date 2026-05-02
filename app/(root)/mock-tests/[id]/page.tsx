import Container from "@/components/container";
import TestDetails from "@/components/client-tests/test-details";
import { notFound } from "next/navigation";
import { db } from "@/src/db";
import { purchases, tests, attempts, results } from "@/src/db/schema";
import { and, eq, isNull, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

interface TestDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TestDetailsPage({
  params,
}: TestDetailsPageProps) {
  const { id } = await params;

  // Fetch the test from the database
  const test = await db.query.tests.findFirst({
    where: and(
      eq(tests.id, id),
      eq(tests.status, "published"),
      isNull(tests.deletedAt),
    ),
  });

  // If no test is found, show 404
  if (!test) {
    notFound();
  }

  // Check if already purchased and get attempt status
  let hasPurchased = false;
  let attemptStatus: "not_started" | "in_progress" | "completed" = "not_started";
  let attemptId: string | undefined;
  let resultId: string | undefined;

  const { userId } = await auth();

  if (userId) {
    const purchase = await db.query.purchases.findFirst({
      where: and(
        eq(purchases.clerkUserId, userId),
        eq(purchases.testId, id),
        eq(purchases.status, "completed")
      ),
    });
    
    if (purchase) {
      hasPurchased = true;
      
      const attempt = await db.query.attempts.findFirst({
        where: and(
          eq(attempts.clerkUserId, userId),
          eq(attempts.testId, id)
        ),
        orderBy: [desc(attempts.startedAt)],
      });

      if (attempt) {
        attemptStatus = attempt.status as "in_progress" | "completed";
        attemptId = attempt.id;

        if (attemptStatus === "completed") {
          const result = await db.query.results.findFirst({
            where: eq(results.attemptId, attempt.id),
          });
          if (result) {
            resultId = result.id;
          }
        }
      }
    }
  }

  return (
    <Container>
      <TestDetails 
        test={test} 
        hasPurchased={hasPurchased} 
        attemptStatus={attemptStatus}
        attemptId={attemptId}
        resultId={resultId}
      />
    </Container>
  );
}
