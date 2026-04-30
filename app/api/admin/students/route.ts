import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { attempts, purchases, results } from "@/src/db/schema";
import { isAdmin } from "@/src/lib/auth-helper";
import { sql, count } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Get unique users who have made a purchase
    const purchaseRows = await db
      .select({
        userId: purchases.clerkUserId,
        purchaseCount: count(purchases.id),
      })
      .from(purchases)
      .where(sql`${purchases.status} = 'completed'`)
      .groupBy(purchases.clerkUserId);

    const uniqueUserIds = purchaseRows.map((r) => r.userId).filter(Boolean);
    if (uniqueUserIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Get attempt stats per user
    const attemptRows = await db
      .select({
        userId: attempts.clerkUserId,
        totalAttempts: count(attempts.id),
      })
      .from(attempts)
      .groupBy(attempts.clerkUserId);

    const attemptMap = new Map(
      attemptRows.map((r) => [r.userId, r.totalAttempts]),
    );

    // Get average score per user
    const resultRows = await db
      .select({
        userId: results.clerkUserId,
        avgScore: sql<number>`round(avg(${results.percentage}))`,
        completedTests: count(results.id),
      })
      .from(results)
      .groupBy(results.clerkUserId);

    const resultMap = new Map(resultRows.map((r) => [r.userId, r]));

    // Fetch user details from Clerk
    let userMap: Record<
      string,
      { email: string; name: string; joinedAt: string }
    > = {};
    try {
      const client = await clerkClient();
      const users = await client.users.getUserList({
        userId: uniqueUserIds,
        limit: 100,
      });
      users.data.forEach((u) => {
        userMap[u.id] = {
          email: u.emailAddresses[0]?.emailAddress || "Unknown",
          name:
            [u.firstName, u.lastName].filter(Boolean).join(" ") || "Unknown",
          joinedAt: new Date(u.createdAt).toISOString().split("T")[0],
        };
      });
    } catch {
      // fallback
    }

    const data = purchaseRows.map((row) => {
      const user = userMap[row.userId];
      const resultInfo = resultMap.get(row.userId);
      return {
        userId: row.userId,
        email: user?.email ?? row.userId,
        name: user?.name ?? "Unknown",
        joinedAt: user?.joinedAt ?? "—",
        purchasedTests: Number(row.purchaseCount),
        totalAttempts: Number(attemptMap.get(row.userId) ?? 0),
        completedTests: Number(resultInfo?.completedTests ?? 0),
        avgScore: Number(resultInfo?.avgScore ?? 0),
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[admin/students]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch students" },
      { status: 500 },
    );
  }
}
