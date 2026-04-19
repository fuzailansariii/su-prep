import { db } from "@/src/db";
import { tests } from "@/src/db/schema";
import { isAdmin } from "@/src/lib/auth-helper";
import { desc, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { adminCreateTestSchema } from "@/src/lib/validations/test.validations";
import z from "zod";

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
    const data = await db
      .select()
      .from(tests)
      .where(isNull(tests.deletedAt))
      .orderBy(desc(tests.createdAt));

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

    const data = validationResult.data;
    const id = nanoid(12);

    const newTest = await db
      .insert(tests)
      .values({
        id,
        ...data,
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
