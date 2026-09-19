import Razorpay from "razorpay";
import { and, eq, gte, inArray, isNotNull, ne, sql, count } from "drizzle-orm";
import { db } from "@/src/db";
import { purchases, type Purchase } from "@/src/db/schema/purchases";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay keys are missing in environment variables");
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Mark a purchase completed (idempotent). Pass the amount Razorpay actually
// received (paise) so revenue reflects real money, not the price at row creation.
export async function markPurchaseCompleted(
  purchaseId: string,
  paymentId: string | null,
  orderId?: string,
  amountPaid?: number,
) {
  await db
    .update(purchases)
    .set({
      status: "completed",
      ...(paymentId ? { razorpayPaymentId: paymentId } : {}),
      ...(orderId ? { razorpayOrderId: orderId } : {}),
      ...(amountPaid ? { amount: amountPaid } : {}),
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
      await markPurchaseCompleted(purchase.id, paymentId, undefined, Number(order.amount));
      return true;
    }

    const paymentId = await getCapturedPaymentId(order.id);
    await markPurchaseCompleted(
      purchase.id,
      paymentId,
      undefined,
      Number(order.amount_paid) || Number(order.amount),
    );
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
  amount: number; // paise actually paid on Razorpay
  recordedAmount: number | null; // paise stored on the purchase row
  // fix: paid but not completed · fix_amount: completed with wrong amount
  // no_purchase_row: paid but no matching row (e.g. duplicate payment)
  action: "fix" | "fix_amount" | "no_purchase_row";
};

const toRupees = (paise: number) => paise / 100;

// Walk every paid Razorpay order of this app and find purchases that are not
// marked completed or have the wrong amount. Also compares real revenue with
// what the admin dashboard shows. With apply=false nothing is written (dry run).
export async function repairPaidPurchases(apply: boolean) {
  const paidOrders: { id: string; amount: number; notes: Record<string, unknown> }[] = [];
  for (let skip = 0; ; skip += 100) {
    const { items } = await razorpay.orders.all({ count: 100, skip });
    for (const o of items) {
      const notes = (o.notes ?? {}) as Record<string, unknown>;
      // Orders from other sites on the same Razorpay account carry no
      // userId/testId notes — not ours, skip them
      if (o.status !== "paid" || !notes.userId || !notes.testId) continue;
      paidOrders.push({
        id: o.id,
        amount: Number(o.amount_paid) || Number(o.amount),
        notes,
      });
    }
    if (items.length < 100) break;
  }

  const items: RepairItem[] = [];
  for (const order of paidOrders) {
    const userId = order.notes.userId as string;
    const testId = order.notes.testId as string;

    // match by order id first, then by the notes set at order creation
    const purchase =
      (await db.query.purchases.findFirst({
        where: eq(purchases.razorpayOrderId, order.id),
      })) ??
      (await db.query.purchases.findFirst({
        where: and(
          eq(purchases.clerkUserId, userId),
          eq(purchases.testId, testId),
          ne(purchases.status, "completed"),
        ),
      }));

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
        recordedAmount: null,
        action: "no_purchase_row",
      });
      continue;
    }

    const isCompleted = purchase.status === "completed";
    if (isCompleted && purchase.amount === order.amount) continue;

    const paymentId = isCompleted
      ? purchase.razorpayPaymentId
      : await getCapturedPaymentId(order.id);

    items.push({
      purchaseId: purchase.id,
      userId: purchase.clerkUserId,
      testId: purchase.testId,
      testTitle: purchase.testTitle,
      status: purchase.status,
      orderId: order.id,
      paymentId,
      amount: order.amount,
      recordedAmount: purchase.amount,
      action: isCompleted ? "fix_amount" : "fix",
    });

    if (apply)
      await markPurchaseCompleted(purchase.id, paymentId, order.id, order.amount);
  }

  // Revenue: real money on Razorpay (this app only) vs admin dashboard
  const [dashboard] = await db
    .select({
      sum: sql<number>`coalesce(sum(${purchases.amount}), 0)`,
      count: count(),
    })
    .from(purchases)
    .where(eq(purchases.status, "completed"));

  const razorpayPaise = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const dashboardPaise = Number(dashboard.sum);

  const revenue = {
    razorpayRupees: toRupees(razorpayPaise),
    razorpayPaidOrders: paidOrders.length,
    dashboardRupees: toRupees(dashboardPaise),
    dashboardCompletedPurchases: Number(dashboard.count),
    // positive = Razorpay received more than the dashboard shows
    differenceRupees: toRupees(razorpayPaise - dashboardPaise),
    note: apply
      ? "dashboard figures read after fixes were applied"
      : "dashboard figures are before fixes; run POST and check again",
  };

  return { paidOrders: paidOrders.length, items, revenue };
}
