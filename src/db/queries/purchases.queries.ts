import { and, eq } from "drizzle-orm";
import { db } from "..";
import { purchases } from "../schema";
import type { NewPurchase } from "../schema";

// Access gate — only "completed" purchases grant access
export async function hasUserPurchasedTest(
  clerkUserId: string,
  testId: string,
): Promise<boolean> {
  const result = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(
      and(
        eq(purchases.clerkUserId, clerkUserId),
        eq(purchases.testId, testId),
        eq(purchases.status, "completed"),
      ),
    )
    .limit(1);
  return result.length > 0;
}

// Used in payment verify route
// Now returns test details too — so you don't need a second getTestById call
export async function getPurchaseByRazorpayOrderId(orderId: string) {
  return db.query.purchases.findFirst({
    where: eq(purchases.razorpayOrderId, orderId),
    with: {
      test: {
        columns: {
          id: true,
          title: true,
          price: true,
        },
      },
    },
  });
}

// Used in "My Purchases" page
// Returns purchases with test card details embedded
export async function getUserPurchases(clerkUserId: string) {
  return db.query.purchases.findMany({
    where: eq(purchases.clerkUserId, clerkUserId),
    with: {
      test: {
        columns: {
          id: true,
          title: true,
          thumbnail: true,
          totalQuestions: true,
        },
      },
    },
  });
}

export async function createPurchase(data: NewPurchase) {
  const result = await db.insert(purchases).values(data).returning();
  return result[0];
}

export async function updatePurchasesStatus(
  id: string,
  status: "completed" | "failed" | "refunded",
  razorpayPaymentId?: string,
) {
  const result = await db
    .update(purchases)
    .set({
      status,
      ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
    })
    .where(eq(purchases.id, id))
    .returning();
  return result[0];
}
