import { db } from "@/src/db";
import { sets, tests } from "@/src/db/schema";
import { isAdmin } from "@/src/lib/auth-helper";
import { adminUpdateTestSchema } from "@/src/lib/validations/test.validations";
import { toPaise } from "@/utils/format-price";
import { and, asc, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const validation = adminUpdateTestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: z.treeifyError(validation.error),
        },
        { status: 400 },
      );
    }
    const updateData = {
      ...validation.data,
      updatedAt: new Date(),
      ...(validation.data.price !== undefined && {
        price: toPaise(validation.data.price),
      }),
      ...(validation.data.originalPrice !== undefined && {
        originalPrice: validation.data.originalPrice
          ? toPaise(validation.data.originalPrice)
          : null,
      }),
    };

    const updatedTest = await db
      .update(tests)
      .set(updateData)
      .where(and(eq(tests.id, id), isNull(tests.deletedAt)))
      .returning();

    if (updatedTest.length === 0) {
      return NextResponse.json(
        { success: false, error: "Test not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test updated successfully",
      data: updatedTest[0],
    });
  } catch (error) {
    console.error("Failed to update test:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update test" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const test = await db.query.tests.findFirst({
      where: and(eq(tests.id, id), isNull(tests.deletedAt)),
      with: {
        sets: {
          with: {
            sections: true,
          },
          orderBy: (s, { asc }) => [asc(s.order)],
        },
      },
    });

    if (!test) {
      return NextResponse.json(
        { success: false, error: "Test not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: test });
  } catch (error) {
    console.error("Failed to fetch test:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch test" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;

    // Soft delete the test
    const deletedTest = await db
      .update(tests)
      .set({ deletedAt: new Date() })
      .where(eq(tests.id, id))
      .returning();

    if (deletedTest.length === 0) {
      return NextResponse.json(
        { success: false, error: "Test not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete test:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete test" },
      { status: 500 },
    );
  }
}
