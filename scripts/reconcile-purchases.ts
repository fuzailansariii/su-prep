// One-off repair: find purchases that were paid on Razorpay but never marked
// completed in the DB.
//
//   npx tsx scripts/reconcile-purchases.ts           # dry run, prints only
//   npx tsx scripts/reconcile-purchases.ts --apply   # writes fixes
import "dotenv/config";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/src/db";
import { purchases } from "@/src/db/schema/purchases";
import {
  getCapturedPaymentId,
  markPurchaseCompleted,
  razorpay,
} from "@/src/lib/razorpay";

const apply = process.argv.includes("--apply");

async function main() {
  console.log(apply ? "APPLY mode — writing fixes" : "DRY RUN — no writes");

  // Walk every order in Razorpay and keep the paid ones
  const paidOrders: { id: string; notes: Record<string, unknown> }[] = [];
  for (let skip = 0; ; skip += 100) {
    const { items } = await razorpay.orders.all({ count: 100, skip });
    for (const o of items) {
      if (o.status === "paid") {
        paidOrders.push({ id: o.id, notes: (o.notes ?? {}) as Record<string, unknown> });
      }
    }
    if (items.length < 100) break;
  }
  console.log(`Found ${paidOrders.length} paid orders in Razorpay`);

  let fixed = 0;
  for (const order of paidOrders) {
    const userId = order.notes.userId as string | undefined;
    const testId = order.notes.testId as string | undefined;

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

    if (!purchase) {
      console.warn(`! paid order ${order.id} has no purchase row (user=${userId}, test=${testId})`);
      continue;
    }
    if (purchase.status === "completed") continue;

    const paymentId = await getCapturedPaymentId(order.id);
    console.log(
      `→ purchase ${purchase.id} user=${purchase.clerkUserId} test=${purchase.testId} ` +
        `status=${purchase.status} order=${order.id} payment=${paymentId}`,
    );

    if (apply) await markPurchaseCompleted(purchase.id, paymentId, order.id);
    fixed++;
  }

  console.log(`${apply ? "Fixed" : "Would fix"} ${fixed} purchase(s)`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
