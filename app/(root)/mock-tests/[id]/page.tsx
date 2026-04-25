import Container from "@/components/container";
import TestDetails from "@/components/client-tests/test-details";
import { notFound } from "next/navigation";
import { db } from "@/src/db";
import { purchases, tests } from "@/src/db/schema";
import { and, eq, isNull } from "drizzle-orm";
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

  // Check if already purchased
  let hasPurchased = false;
  const { userId } = await auth();

  if (userId) {
    const purchase = await db.query.purchases.findFirst({
      where: and(
        eq(purchases.clerkUserId, userId),
        eq(purchases.testId, id),
        eq(purchases.status, "completed"),
      ),
    });
    hasPurchased = !!purchase;
  }

  return (
    <Container>
      <TestDetails test={test} hasPurchased={hasPurchased} />
    </Container>
  );
}
