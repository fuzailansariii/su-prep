import { db } from "@/src/db";
import { tests } from "@/src/db/schema";
import { isAdmin } from "@/src/lib/auth-helper";
import { desc, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { adminCreateTestSchema } from "@/src/lib/validations/test.validations";
import z from "zod";
import { toPaise } from "@/utils/format-price";

export async function GET(req: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Admin should see all non-deleted tests
    const testsData = await db.query.tests.findMany({
      where: isNull(tests.deletedAt),
      with: {
        sets: {
          columns: {
            id: true,
            totalQuestions: true,
          },
        },
      },
      orderBy: [desc(tests.createdAt)],
    });

    const data = testsData.map((test) => ({
      ...test,
      setsCount: test.sets.length,
      calculatedQuestions: test.sets.reduce((acc, set) => acc + set.totalQuestions, 0),
    }));

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch admin tests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tests" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const validationResult = adminCreateTestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: z.treeifyError(validationResult.error),
        },
        { status: 400 },
      );
    }

    const validated = validationResult.data;
    const id = nanoid(12);

    const newTest = await db
      .insert(tests)
      .values({
        id,
        ...validated,
        price: toPaise(validated.price),
        originalPrice: validated.originalPrice
          ? toPaise(validated.originalPrice)
          : null,
      })
      .returning();

    return NextResponse.json(
      { success: true, message: "Test created successfully", data: newTest[0] },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create test:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create test" },
      { status: 500 },
    );
  }
}
