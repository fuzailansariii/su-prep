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
    <Container className="max-w-5xl py-12 md:py-20">
      <div className="flex flex-col items-center">
        <div className="w-full mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-black mb-4">
            Secure Checkout
          </h1>
          <p className="text-lg text-brand-muted font-body max-w-2xl mx-auto">
            Get instant access to your mock test and start practicing immediately.
          </p>
        </div>

        <CheckoutClient test={test} />
      </div>
    </Container>
  );
}
