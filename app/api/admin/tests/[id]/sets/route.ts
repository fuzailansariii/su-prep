import { db } from "@/src/db";
import { sets } from "@/src/db/schema";
import { isAdmin } from "@/src/lib/auth-helper";
import { adminCreateSetSchema } from "@/src/lib/validations/set.validations";
import { eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { tests } from "@/src/db/schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await isAdmin();
    if (!admin)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id: testId } = await params;

    const data = await db.query.sets.findMany({
      where: eq(sets.testId, testId),
      orderBy: (s, { asc }) => [asc(s.order)],
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to fetch sets" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await isAdmin();
    if (!admin)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id: testId } = await params;

    // Make sure the test exists and is not deleted
    const test = await db.query.tests.findFirst({
      where: (t, { and, eq }) => and(eq(t.id, testId), isNull(t.deletedAt)),
    });
    if (!test)
      return NextResponse.json({ success: false, message: "Test not found" }, { status: 404 });

    const body = await req.json();
    const result = adminCreateSetSchema.safeParse({ ...body, testId });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: z.treeifyError(result.error),
        },
        { status: 400 },
      );
    }

    const id = nanoid(12);
    const newSet = await db.insert(sets).values({ id, ...result.data }).returning();

    return NextResponse.json(
      { success: true, message: "Set created", data: newSet[0] },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to create set" }, { status: 500 });
  }
}
