import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { purchases } from "@/src/db/schema/purchases";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse body
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 },
      );
    }

    // Verify signature
    // Razorpay signs with: order_id + "|" + payment_id
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    // Find the purchase row FIRST — and require it belongs to this user
    const purchase = await db.query.purchases.findFirst({
      where: (p, { and, eq }) =>
        and(
          eq(p.razorpayOrderId, razorpay_order_id),
          eq(p.clerkUserId, userId),
        ),
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 },
      );
    }

    // Now verify signature
    const expectedBuf = Buffer.from(expectedSignature, "hex");
    const receivedBuf = Buffer.from(String(razorpay_signature), "hex");
    const isValidSignature =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isValidSignature) {
      // Safe to update — we've already confirmed this purchase belongs to userId
      if (purchase.status !== "completed") {
        await db
          .update(purchases)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(purchases.id, purchase.id));
      }

      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    // Prevent double processing
    if (purchase.status === "completed") {
      return NextResponse.json({
        success: true,
        testId: purchase.testId,
        alreadyProcessed: true,
      });
    }

    // Mark as completed
    await db
      .update(purchases)
      .set({
        status: "completed",
        razorpayPaymentId: razorpay_payment_id,
        updatedAt: new Date(),
      })
      .where(eq(purchases.id, purchase.id));

    // Return success
    return NextResponse.json({
      success: true,
      testId: purchase.testId,
    });
  } catch (error) {
    console.error("[razorpay/verify]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
