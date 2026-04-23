import Container from "@/components/container";
import TestDetails from "@/components/client-tests/test-details";
import { notFound } from "next/navigation";
import { db } from "@/src/db";
import { tests } from "@/src/db/schema";
import { and, eq, isNull } from "drizzle-orm";

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
      eq(tests.status, "draft"),
      isNull(tests.deletedAt),
    ),
  });

  // If no test is found, show 404
  if (!test) {
    notFound();
  }

  return (
    <Container>
      <TestDetails test={test} />
    </Container>
  );
}
