// One-off repair: find purchases that were paid on Razorpay but never marked
// completed in the DB. Same logic as /api/admin/reconcile-purchases.
//
//   npx tsx scripts/reconcile-purchases.ts           # dry run, prints only
//   npx tsx scripts/reconcile-purchases.ts --apply   # writes fixes
import "dotenv/config";
import { repairPaidPurchases } from "@/src/lib/razorpay";

const apply = process.argv.includes("--apply");

async function main() {
  console.log(apply ? "APPLY mode — writing fixes" : "DRY RUN — no writes");

  const { paidOrders, items } = await repairPaidPurchases(apply);
  console.log(`Found ${paidOrders} paid orders in Razorpay`);

  for (const i of items) {
    if (i.action === "no_purchase_row") {
      console.warn(`! paid order ${i.orderId} has no purchase row (user=${i.userId}, test=${i.testId})`);
    } else {
      console.log(
        `→ purchase ${i.purchaseId} user=${i.userId} test=${i.testId} ` +
          `status=${i.status} order=${i.orderId} payment=${i.paymentId}`,
      );
    }
  }

  const fixed = items.filter((i) => i.action === "fix").length;
  console.log(`${apply ? "Fixed" : "Would fix"} ${fixed} purchase(s)`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
