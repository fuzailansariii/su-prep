import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { attempts, tests, results } from "@/src/db/schema";
import { isAdmin } from "@/src/lib/auth-helper";
import { desc, eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select({
        id: attempts.id,
        userId: attempts.clerkUserId,
        testId: attempts.testId,
        testTitle: tests.title,
        status: attempts.status,
        startedAt: attempts.startedAt,
        submittedAt: attempts.submittedAt,
        timeTaken: attempts.timeTaken,
        score: results.percentage,
        scoredMarks: results.scoredMarks,
        totalMarks: results.totalMarks,
      })
      .from(attempts)
      .leftJoin(tests, eq(attempts.testId, tests.id))
      .leftJoin(results, eq(attempts.id, results.attemptId))
      .orderBy(desc(attempts.startedAt))
      .limit(100);

    // Fetch emails for unique user IDs
    const uniqueUserIds = [...new Set(rows.map((r) => r.userId))].filter(Boolean);
    let userMap: Record<string, string> = {};
    if (uniqueUserIds.length > 0) {
      try {
        const client = await clerkClient();
        const users = await client.users.getUserList({ userId: uniqueUserIds });
        users.data.forEach((u) => {
          userMap[u.id] = u.emailAddresses[0]?.emailAddress || u.id;
        });
      } catch {
        // fallback to userId if Clerk call fails
      }
    }

    const data = rows.map((r) => ({
      ...r,
      userEmail: userMap[r.userId] || r.userId,
      startedAt: r.startedAt.toISOString(),
      submittedAt: r.submittedAt?.toISOString() ?? null,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[admin/attempts]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch attempts" }, { status: 500 });
  }
}
