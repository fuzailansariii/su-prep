import { NextResponse } from "next/server";
import { isAdmin } from "@/src/lib/auth-helper";
import { repairPaidPurchases } from "@/src/lib/razorpay";

// Walks every Razorpay order, so allow more than the default time
export const maxDuration = 60;

// Finds purchases paid on Razorpay but not marked completed or recorded
// with the wrong amount, and compares real revenue with the dashboard.
// Runs on the server so it uses the deployment's live Razorpay keys.
//   GET  → dry run, lists what would be fixed
//   POST → applies the fixes
async function handle(apply: boolean) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { paidOrders, items, unbacked, revenue } = await repairPaidPurchases(apply);

    return NextResponse.json({
      success: true,
      mode: apply ? "applied" : "dry_run",
      paidOrders,
      toFix: items.filter((i) => i.action === "fix").length,
      toFixAmount: items.filter((i) => i.action === "fix_amount").length,
      noPurchaseRow: items.filter((i) => i.action === "no_purchase_row").length,
      unbackedCompleted: unbacked.length,
      revenue,
      items,
      unbacked,
    });
  } catch (error) {
    console.error("[admin/reconcile-purchases]", error);
    return NextResponse.json(
      { success: false, message: "Reconcile failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return handle(false);
}

export async function POST() {
  return handle(true);
}
