import { db } from "@/src/db";
import {
  attempts,
  options,
  questions,
  tests,
} from "@/src/db/schema";
import { isAuthenticated } from "@/src/lib/auth-helper";
import { and, asc, eq, isNull } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const userId = await isAuthenticated();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { attemptId } = await params;

    // Verify the attempt belongs to this user and is in_progress
    const attempt = await db.query.attempts.findFirst({
      where: and(
        eq(attempts.id, attemptId),
        eq(attempts.clerkUserId, userId),
        eq(attempts.status, "in_progress")
      ),
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Fetch the test for duration
    const test = await db.query.tests.findFirst({
      where: and(eq(tests.id, attempt.testId), isNull(tests.deletedAt)),
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Fetch questions — strip isCorrect & explanation
    const testQuestions = await db.query.questions.findMany({
      where: eq(questions.testId, attempt.testId),
      orderBy: asc(questions.order),
      with: {
        options: {
          orderBy: asc(options.order),
          columns: {
            id: true,
            optionText: true,
            order: true,
          },
        },
      },
      columns: {
        id: true,
        questionText: true,
        type: true,
        marks: true,
        order: true,
        section: true,
      },
    });

    // Calculate remaining seconds
    const timeLimitSeconds = test.duration * 60;
    const elapsedSeconds = Math.floor(
      (Date.now() - attempt.startedAt.getTime()) / 1000
    );
    const remainingSeconds = Math.max(0, timeLimitSeconds - elapsedSeconds);

    return NextResponse.json({
      remainingSeconds,
      timeLimitSeconds,
      questions: testQuestions,
      testTitle: test.title,
    });
  } catch (error) {
    console.error("[attempt/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
