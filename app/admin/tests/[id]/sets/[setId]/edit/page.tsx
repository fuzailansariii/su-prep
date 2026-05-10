import { db } from "@/src/db";
import { sets, tests } from "@/src/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import EditSetClient from "@/components/admin/sets/edit-set-client";

export default async function EditSetPage({
  params,
}: {
  params: Promise<{ id: string; setId: string }>;
}) {
  const { id: testId, setId } = await params;

  // Verify test exists
  const test = await db.query.tests.findFirst({
    where: and(eq(tests.id, testId), isNull(tests.deletedAt)),
  });
  if (!test) notFound();

  // Fetch the set
  const set = await db.query.sets.findFirst({
    where: and(eq(sets.id, setId), eq(sets.testId, testId)),
  });
  if (!set) notFound();

  return <EditSetClient testId={testId} set={set} />;
}
