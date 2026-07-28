import { db } from "@/src/db";
import { purchases, tests } from "@/src/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// Validate env early
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay keys are missing in environment variables");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── helpers ─────────────────────────────────────────────

function err(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getValidTest(testId: string) {
  const test = await db.query.tests.findFirst({
    where: eq(tests.id, testId),
    columns: {
      id: true,
      title: true,
      price: true,
      status: true,
    },
  });

  if (!test) return { error: err("Test not found", 404) };
  if (test.status !== "published")
    return { error: err("Test is not available", 400) };
  if (!test.price || test.price <= 0)
    return { error: err("Test is free or has no price", 400) };

  return { test };
}

// async function upsertPurchase(
//   existing: typeof purchases.$inferSelect | undefined,
//   orderId: string,
//   data: typeof purchases.$inferInsert,
// ) {
//   if (existing?.status === "failed") {
//     await db
//       .update(purchases)
//       .set({
//         razorpayOrderId: orderId,
//         status: "pending",
//         updatedAt: new Date(),
//       })
//       .where(eq(purchases.id, existing.id));
//   } else {
//     await db.insert(purchases).values(data);
//   }
// }

// ── route handler ───────────────────────────────────────

async function upsertPurchase(
  existing: typeof purchases.$inferSelect | undefined,
  orderId: string,
  data: typeof purchases.$inferInsert,
) {
  if (existing?.status === "failed") {
    await db
      .update(purchases)
      .set({
        razorpayOrderId: orderId,
        status: "pending",
        updatedAt: new Date(),
      })
      .where(eq(purchases.id, existing.id));
    return;
  }

  try {
    await db.insert(purchases).values(data);
  } catch (e: any) {
    // Postgres unique_violation — another concurrent request already inserted this row
    if (e.code === "23505") {
      const winner = await db.query.purchases.findFirst({
        where: (p, { and, eq }) =>
          and(eq(p.clerkUserId, data.clerkUserId), eq(p.testId, data.testId)),
      });
      if (!winner) throw e; // truly unexpected, don't swallow
      return; // the other request's insert wins, this one just defers
    }
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Auth
    const { userId } = await auth();
    if (!userId) return err("Unauthorized", 401);

    // Parse + validate input
    const { testId } = await req.json();

    if (!testId || typeof testId !== "string") {
      return err("Invalid testId", 400);
    }

    // Validate test
    const result = await getValidTest(testId);
    if (result.error) return result.error;

    const test = result.test;

    // Check existing purchase
    const existing = await db.query.purchases.findFirst({
      where: (p, { and, eq }) =>
        and(eq(p.clerkUserId, userId), eq(p.testId, testId)),
    });

    if (existing?.status === "completed") {
      return err("Already purchased", 409);
    }

    // Reuse pending order if valid
    if (existing?.status === "pending" && existing.razorpayOrderId) {
      const existingOrder = await razorpay.orders.fetch(
        existing.razorpayOrderId,
      );

      if (existingOrder.status === "created") {
        return NextResponse.json({
          orderId: existingOrder.id,
          amount: existingOrder.amount,
          currency: existingOrder.currency,
          testTitle: test.title,
          keyId: process.env.RAZORPAY_KEY_ID,
        });
      }

      // mark failed, patch status so upsertPurchase takes the update branch
      await db
        .update(purchases)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(purchases.id, existing.id));

      existing.status = "failed";
    }

    // Create Razorpay order (FIXED amount)
    const razorpayOrder = await razorpay.orders.create({
      amount: test.price,
      currency: "INR",
      receipt: `rcpt_${nanoid()}`,
      notes: { testId, userId },
    });

    // Upsert purchase
    await upsertPurchase(existing, razorpayOrder.id, {
      id: nanoid(),
      clerkUserId: userId,
      testId,
      testTitle: test.title,
      amount: test.price,
      status: "pending",
      razorpayOrderId: razorpayOrder.id,
    });

    // Return response
    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      testTitle: test.title,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("[razorpay/order]", error);
    return err("Internal server error", 500);
  }
}
