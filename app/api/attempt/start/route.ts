import { db } from "@/src/db";
import {
  attempts,
  options,
  purchases,
  questions,
  sets,
  tests,
} from "@/src/db/schema";
import { requireAuth } from "@/src/lib/auth-helper";
import { and, asc, eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // check if the user is authenticaed
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // check for the testId and setId
    const { testId, setId } = await req.json();
    if (!testId || !setId) {
      return NextResponse.json(
        { error: "testId and setId are required" },
        { status: 400 },
      );
    }

    // check if the test exist in db and published
    const test = await db.query.tests.findFirst({
      where: and(
        eq(tests.id, testId),
        eq(tests.status, "published"),
        isNull(tests.deletedAt),
      ),
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // check if the set exists
    const set = await db.query.sets.findFirst({
      where: and(eq(sets.id, setId), eq(sets.status, "published")),
    });

    if (!set) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

    // check if user has purchases the test
    const purchase = await db.query.purchases.findFirst({
      where: and(
        eq(purchases.clerkUserId, userId),
        eq(purchases.testId, testId),
        eq(purchases.status, "completed"),
      ),
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Test not Purchased" },
        { status: 403 },
      );
    }

    // check no completed attempt for this set
    const completedAttempt = await db.query.attempts.findFirst({
      where: and(
        eq(attempts.clerkUserId, userId),
        eq(attempts.testId, testId),
        eq(attempts.setId, setId),
        eq(attempts.status, "completed"),
      ),
    });

    if (completedAttempt) {
      return NextResponse.json({ error: "Already completed" }, { status: 409 });
    }

    // check for in progress for this set
    const inProgressAttempt = await db.query.attempts.findFirst({
      where: and(
        eq(attempts.clerkUserId, userId),
        eq(attempts.testId, testId),
        eq(attempts.setId, setId),
        eq(attempts.status, "in_progress"),
      ),
    });

    // fetch questions for this set
    const testQuestions = await db.query.questions.findMany({
      where: eq(questions.setId, setId),
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
        sectionId: true,
      },
    });

    // create a reuse attempt
    let attemptId: string;
    let isResuming = false;

    if (inProgressAttempt) {
      attemptId = inProgressAttempt.id;
      isResuming = true;
    } else {
      attemptId = nanoid();
      await db.insert(attempts).values({
        id: attemptId,
        clerkUserId: userId,
        testId,
        setId,
        status: "in_progress",
        startedAt: new Date(),
        createdAt: new Date(),
      });
    }

    // calculate remaning time
    const timeLimitSeconds = set.duration * 60;
    const startedAt = inProgressAttempt?.startedAt ?? new Date();
    const elapsedSecond = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    const remainingSeconds = Math.max(0, timeLimitSeconds - elapsedSecond);

    return NextResponse.json({
      attemptId,
      isResuming,
      remainingSeconds,
      timeLimitSeconds,
      questions: testQuestions,
    });
  } catch (error) {
    console.error("[attempt/start]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
