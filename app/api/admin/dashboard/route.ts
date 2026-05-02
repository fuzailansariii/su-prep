import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { tests } from "@/src/db/schema/tests";
import { purchases } from "@/src/db/schema/purchases";
import { attempts } from "@/src/db/schema/attempts";
import { results } from "@/src/db/schema/results";
import { sql, eq, desc } from "drizzle-orm";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isAdmin } from "@/src/lib/auth-helper";

export async function GET() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const totalTestsRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(tests);
    const publishedTestsRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(tests)
      .where(eq(tests.status, "published"));
    const totalAttemptsRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(attempts);

    // Revenue from completed purchases
    const revenueRes = await db
      .select({ sum: sql<number>`sum(${purchases.amount})` })
      .from(purchases)
      .where(eq(purchases.status, "completed"));

    const totalTests = Number(totalTestsRes[0].count) || 0;
    const publishedTests = Number(publishedTestsRes[0].count) || 0;
    const totalAttempts = Number(totalAttemptsRes[0].count) || 0;
    // Note amount is in paise, so divide by 100
    const grossRevenue = (Number(revenueRes[0].sum) || 0) / 100;

    // Recent attempts (Table)
    const recentAttempts = await db
      .select({
        id: attempts.id,
        user_id: attempts.clerkUserId,
        test_name: tests.title,
        score: results.percentage,
        date: attempts.startedAt,
        status: attempts.status,
      })
      .from(attempts)
      .leftJoin(tests, eq(attempts.testId, tests.id))
      .leftJoin(results, eq(attempts.id, results.attemptId))
      .orderBy(desc(attempts.startedAt))
      .limit(10);

    // Fetch user emails from Clerk
    const uniqueUserIds = [
      ...new Set(recentAttempts.map((a) => a.user_id)),
    ].filter(Boolean);

    let userMap: Record<string, string> = {};
    if (uniqueUserIds.length > 0) {
      try {
        const client = await clerkClient();
        const users = await client.users.getUserList({
          userId: uniqueUserIds,
        });

        users.data.forEach((u) => {
          userMap[u.id] = u.emailAddresses[0]?.emailAddress || "No email";
        });
      } catch (err) {
        console.error("Failed to fetch clerk users", err);
      }
    }

    // Format recent attempts
    const formattedAttempts = recentAttempts.map((a) => ({
      id: a.id,
      user_email: userMap[a.user_id] || `${a.user_id.substring(0, 10)}...`,
      test_name: a.test_name || "Unknown Test",
      score: a.score !== null ? `${a.score}%` : "N/A",
      date: new Date(a.date).toISOString().split("T")[0],
      status:
        a.status === "completed"
          ? "Completed"
          : a.status === "in_progress"
            ? "Active"
            : "Abandoned",
    }));

    // Test Popularity
    const testPopularity = await db
      .select({
        label: tests.title,
        value: sql<number>`count(${attempts.id})`,
      })
      .from(tests)
      .leftJoin(attempts, eq(tests.id, attempts.testId))
      .groupBy(tests.id, tests.title)
      .orderBy(desc(sql`count(${attempts.id})`))
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalTests,
          publishedTests,
          totalAttempts,
          grossRevenue,
        },
        recentAttempts: formattedAttempts,
        testPopularity: testPopularity.map((tp) => ({
          label: tp.label,
          value: Number(tp.value),
        })),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
