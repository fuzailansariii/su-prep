import { db } from "@/src/db";
import { tests } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { isAdmin } from "@/src/lib/auth-helper";
import { redirect } from "next/navigation";
import EditTestClient from "@/components/admin/tests/edit-test-client";

export default async function EditTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await isAdmin();
  if (!admin) {
    redirect("/");
  }

  const { id } = await params;

  const test = await db.query.tests.findFirst({
    where: eq(tests.id, id),
  });

  if (!test) {
    notFound();
  }

  return <EditTestClient test={test} />;
}
