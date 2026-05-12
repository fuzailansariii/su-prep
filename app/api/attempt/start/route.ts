import { db } from "@/src/db";
import {
  attemptAnswers,
  attempts,
  options,
  purchases,
  questions,
  sections,
  sets,
  tests,
} from "@/src/db/schema";
import { requireAuth } from "@/src/lib/auth-helper";
import { startAttemptSchema } from "@/src/lib/validations/attempts";
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

    const body = await req.json();
    const parsed = startAttemptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { setId } = parsed.data;

    const set = await db.query.sets.findFirst({
      where: and(eq(sets.id, setId), eq(sets.status, "published")),
    });

    if (!set) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

    const testId = set.testId;

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

    // check if user has purchased the test (only if it's not free)
    if (test.price > 0) {
      const purchase = await db.query.purchases.findFirst({
        where: and(
          eq(purchases.clerkUserId, userId),
          eq(purchases.testId, testId),
          eq(purchases.status, "completed"),
        ),
      });

      if (!purchase) {
        return NextResponse.json(
          { error: "Test not purchased" },
          { status: 403 },
        );
      }
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

    // fetch sections
    const testSections = await db.query.sections.findMany({
      where: eq(sections.setId, setId),
      orderBy: asc(sections.order),
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

    let savedAnswers: Record<string, string[]> = {};
    let savedIndex = 0;

    if (inProgressAttempt) {
      const saved = await db.query.attemptAnswers.findMany({
        where: eq(attemptAnswers.attemptId, inProgressAttempt.id),
      });

      // reconstruct the map the store expects
      savedAnswers = Object.fromEntries(
        saved.map((a) => [a.questionId, a.selectedOptionIds ?? []]),
      );

      savedIndex = inProgressAttempt.currentQuestionIndex ?? 0;
    }

    // calculate remaning time
    const timeLimitSeconds = set.duration * 60;
    const alreadyTaken = inProgressAttempt?.timeTaken ?? 0;
    const remainingSeconds = Math.max(0, timeLimitSeconds - alreadyTaken);

    return NextResponse.json({
      attemptId,
      setId,
      testId,
      setTitle: set.title,
      testTitle: test.title,
      isResuming,
      remainingSeconds,
      questions: testQuestions,
      sections: testSections,
      ...(isResuming && { savedAnswers, savedIndex }),
    });
  } catch (error) {
    console.error("[attempt/start]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
