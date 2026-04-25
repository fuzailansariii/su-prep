import Container from "@/components/container";
import { notFound, redirect } from "next/navigation";
import { db } from "@/src/db";
import { tests, purchases } from "@/src/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import CheckoutClient from "./checkout-client";

interface CheckoutPageProps {
  params: Promise<{
    testId: string;
  }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { testId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/sign-in?redirect_url=/checkout/${testId}`);
  }

  // Fetch the test from the database
  const test = await db.query.tests.findFirst({
    where: and(
      eq(tests.id, testId),
      eq(tests.status, "published"),
      isNull(tests.deletedAt),
    ),
  });

  // If no test is found, show 404
  if (!test) {
    notFound();
  }

  // Check if already purchased
  const existingPurchase = await db.query.purchases.findFirst({
    where: and(
      eq(purchases.clerkUserId, userId),
      eq(purchases.testId, testId),
      eq(purchases.status, "completed"),
    ),
  });

  if (existingPurchase) {
    redirect(`/dashboard`); // Or wherever you want to redirect after successful purchase
  }

  return (
    <Container className="max-w-4xl py-12">
      <div className="flex flex-col items-center">
        <div className="w-full mb-8 text-center">
          <h1 className="text-3xl font-heading font-bold text-black mb-2">
            Secure Checkout
          </h1>
          <p className="text-brand-muted font-body">
            Complete your purchase securely to get instant access.
          </p>
        </div>

        <CheckoutClient test={test} />
      </div>
    </Container>
  );
}
