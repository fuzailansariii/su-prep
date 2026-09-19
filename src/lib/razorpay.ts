import Razorpay from "razorpay";
import { and, eq, gte, inArray, isNotNull, ne } from "drizzle-orm";
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

export type RepairItem = {
  purchaseId: string | null;
  userId: string | null;
  testId: string | null;
  testTitle: string | null;
  status: string | null;
  orderId: string;
  paymentId: string | null;
  amount: number;
  action: "fix" | "no_purchase_row";
};

// Walk every paid Razorpay order and find purchases that are not marked
// completed. With apply=false nothing is written (dry run).
export async function repairPaidPurchases(apply: boolean) {
  const paidOrders: { id: string; amount: number; notes: Record<string, unknown> }[] = [];
  for (let skip = 0; ; skip += 100) {
    const { items } = await razorpay.orders.all({ count: 100, skip });
    for (const o of items) {
      if (o.status === "paid") {
        paidOrders.push({
          id: o.id,
          amount: Number(o.amount),
          notes: (o.notes ?? {}) as Record<string, unknown>,
        });
      }
    }
    if (items.length < 100) break;
  }

  const items: RepairItem[] = [];
  for (const order of paidOrders) {
    const userId = (order.notes.userId as string | undefined) ?? null;
    const testId = (order.notes.testId as string | undefined) ?? null;

    // match by order id first, then by the notes set at order creation
    const purchase =
      (await db.query.purchases.findFirst({
        where: eq(purchases.razorpayOrderId, order.id),
      })) ??
      (userId && testId
        ? await db.query.purchases.findFirst({
            where: and(
              eq(purchases.clerkUserId, userId),
              eq(purchases.testId, testId),
              ne(purchases.status, "completed"),
            ),
          })
        : undefined);

    if (purchase?.status === "completed") continue;

    // Orders from other sites on the same Razorpay account carry no
    // userId/testId notes and have no row here — not ours, skip them
    if (!purchase && (!userId || !testId)) continue;

    if (!purchase) {
      items.push({
        purchaseId: null,
        userId,
        testId,
        testTitle: null,
        status: null,
        orderId: order.id,
        paymentId: null,
        amount: order.amount,
        action: "no_purchase_row",
      });
      continue;
    }

    const paymentId = await getCapturedPaymentId(order.id);
    items.push({
      purchaseId: purchase.id,
      userId: purchase.clerkUserId,
      testId: purchase.testId,
      testTitle: purchase.testTitle,
      status: purchase.status,
      orderId: order.id,
      paymentId,
      amount: order.amount,
      action: "fix",
    });

    if (apply) await markPurchaseCompleted(purchase.id, paymentId, order.id);
  }

  return { paidOrders: paidOrders.length, items };
}
