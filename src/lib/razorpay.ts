import Razorpay from "razorpay";
import { and, eq, gte, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/src/db";
import { purchases, type Purchase } from "@/src/db/schema/purchases";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay keys are missing in environment variables");
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Mark a purchase completed (idempotent)
export async function markPurchaseCompleted(
  purchaseId: string,
  paymentId: string | null,
  orderId?: string,
) {
  await db
    .update(purchases)
    .set({
      status: "completed",
      ...(paymentId ? { razorpayPaymentId: paymentId } : {}),
      ...(orderId ? { razorpayOrderId: orderId } : {}),
      updatedAt: new Date(),
    })
    .where(eq(purchases.id, purchaseId));
}

// Returns the captured payment id for an order, or null if nothing was captured
export async function getCapturedPaymentId(
  orderId: string,
): Promise<string | null> {
  const { items } = await razorpay.orders.fetchPayments(orderId);
  const captured = items.find((p) => p.status === "captured");
  return captured ? captured.id : null;
}

// Asks Razorpay whether this purchase's order was actually paid, and fixes the
// row if so. Covers the case where the client never called /verify (mobile UPI,
// closed tab) and the webhook never matched. Returns true if the purchase is completed.
export async function reconcilePurchase(purchase: Purchase): Promise<boolean> {
  if (purchase.status === "completed") return true;
  if (!purchase.razorpayOrderId) return false;

  try {
    const order = await razorpay.orders.fetch(purchase.razorpayOrderId);
    if (order.status !== "paid") {
      // "attempted" orders can still be captured later (slow UPI)
      if (order.status !== "attempted") return false;
      const paymentId = await getCapturedPaymentId(order.id);
      if (!paymentId) return false;
      await markPurchaseCompleted(purchase.id, paymentId);
      return true;
    }

    const paymentId = await getCapturedPaymentId(order.id);
    await markPurchaseCompleted(purchase.id, paymentId);
    console.log("[razorpay] reconciled purchase", purchase.id, order.id);
    return true;
  } catch (error) {
    console.error("[razorpay] reconcile failed", purchase.id, error);
    return false;
  }
}

// Only recent rows are checked on page load — abandoned checkouts would
// otherwise cost a Razorpay call on every visit. Older rows are handled by
// scripts/reconcile-purchases.ts.
const RECONCILE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

// Reconcile a user's recent non-completed purchases (optionally for one test)
export async function reconcileUserPurchases(
  clerkUserId: string,
  testId?: string,
) {
  const rows = await db.query.purchases.findMany({
    where: and(
      eq(purchases.clerkUserId, clerkUserId),
      inArray(purchases.status, ["pending", "failed"]),
      isNotNull(purchases.razorpayOrderId),
      gte(purchases.updatedAt, new Date(Date.now() - RECONCILE_WINDOW_MS)),
      ...(testId ? [eq(purchases.testId, testId)] : []),
    ),
  });

  await Promise.all(rows.map(reconcilePurchase));
}
