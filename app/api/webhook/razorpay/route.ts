import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { purchases } from "@/src/db/schema/purchases";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error("Missing webhook secret");
    }
    // Get raw body — must be raw for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "hex");
    const receivedBuf = Buffer.from(signature, "hex");

    const isValid =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Parse event
    const event = JSON.parse(rawBody);
    const eventType = event.event;

    // Handle events
    switch (eventType) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;
        const paymentId = payment.id;

        // find purchase
        const purchase = await db.query.purchases.findFirst({
          where: eq(purchases.razorpayOrderId, orderId),
        });

        if (!purchase) {
          // log but return 200 — don't let Razorpay retry endlessly
          console.error("[webhook] Purchase not found for order:", orderId);
          return NextResponse.json({ received: true });
        }

        // skip if already completed (verify route got here first)
        if (purchase.status === "completed") {
          return NextResponse.json({ received: true });
        }

        // mark completed
        await db
          .update(purchases)
          .set({
            status: "completed",
            razorpayPaymentId: paymentId,
            updatedAt: new Date(),
          })
          .where(eq(purchases.id, purchase.id));

        console.log("[webhook] Payment captured:", paymentId);
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;

        const purchase = await db.query.purchases.findFirst({
          where: eq(purchases.razorpayOrderId, orderId),
        });

        if (purchase && purchase.status !== "completed") {
          await db
            .update(purchases)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(purchases.id, purchase.id));
        }

        console.log("[webhook] Payment failed for order:", orderId);
        break;
      }

      case "order.paid": {
        // backup event — fires when order is fully paid
        const order = event.payload.order.entity;
        const payment = event.payload.payment.entity;

        const purchase = await db.query.purchases.findFirst({
          where: eq(purchases.razorpayOrderId, order.id),
        });

        if (purchase && purchase.status !== "completed") {
          await db
            .update(purchases)
            .set({
              status: "completed",
              razorpayPaymentId: payment.id,
              updatedAt: new Date(),
            })
            .where(eq(purchases.id, purchase.id));

          console.log("[webhook] Order paid:", order.id);
        }
        break;
      }

      default:
        // ignore other events
        console.log("[webhook] Unhandled event:", eventType);
    }

    // always return 200 to Razorpay
    // if you return anything else, Razorpay retries for 24 hours
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook]", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
