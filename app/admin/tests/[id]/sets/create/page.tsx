import { db } from "@/src/db";
import { sets, tests } from "@/src/db/schema";
import { and, count, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import CreateSetClient from "@/components/admin/sets/create-set-client";

export default async function CreateSetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: testId } = await params;

  // Verify test exists
  const test = await db.query.tests.findFirst({
    where: and(eq(tests.id, testId), isNull(tests.deletedAt)),
  });
  if (!test) notFound();

  // Calculate next order number
  const [{ value: existing }] = await db
    .select({ value: count() })
    .from(sets)
    .where(eq(sets.testId, testId));

  const nextOrder = (existing ?? 0) + 1;

  return <CreateSetClient testId={testId} nextOrder={nextOrder} />;
}
