import { NextResponse } from "next/server";
import { isAdmin } from "@/src/lib/auth-helper";
import { repairPaidPurchases } from "@/src/lib/razorpay";

// Walks every Razorpay order, so allow more than the default time
export const maxDuration = 60;

// Finds purchases paid on Razorpay but not marked completed.
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

    const { paidOrders, items } = await repairPaidPurchases(apply);

    return NextResponse.json({
      success: true,
      mode: apply ? "applied" : "dry_run",
      paidOrders,
      toFix: items.filter((i) => i.action === "fix").length,
      items,
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
