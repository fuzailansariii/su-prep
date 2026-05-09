import { db } from "@/src/db";
import { sets } from "@/src/db/schema";
import { isAdmin } from "@/src/lib/auth-helper";
import { adminUpdateSetSchema } from "@/src/lib/validations/set.validations";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

type Context = { params: Promise<{ id: string; setId: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    const admin = await isAdmin();
    if (!admin)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id: testId, setId } = await params;

    const set = await db.query.sets.findFirst({
      where: and(eq(sets.id, setId), eq(sets.testId, testId)),
      with: {
        sections: {
          orderBy: (s, { asc }) => [asc(s.order)],
          with: {
            questions: {
              columns: { id: true }, // only need count — fetch minimal data
            },
          },
        },
      },
    });

    if (!set)
      return NextResponse.json({ success: false, message: "Set not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: set }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to fetch set" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const admin = await isAdmin();
    if (!admin)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id: testId, setId } = await params;

    const existing = await db.query.sets.findFirst({
      where: and(eq(sets.id, setId), eq(sets.testId, testId)),
    });
    if (!existing)
      return NextResponse.json({ success: false, message: "Set not found" }, { status: 404 });

    const body = await req.json();
    const result = adminUpdateSetSchema.safeParse(body);

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

    const updated = await db
      .update(sets)
      .set(result.data)
      .where(and(eq(sets.id, setId), eq(sets.testId, testId)))
      .returning();

    return NextResponse.json(
      { success: true, message: "Set updated", data: updated[0] },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to update set" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  try {
    const admin = await isAdmin();
    if (!admin)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id: testId, setId } = await params;

    const existing = await db.query.sets.findFirst({
      where: and(eq(sets.id, setId), eq(sets.testId, testId)),
    });
    if (!existing)
      return NextResponse.json({ success: false, message: "Set not found" }, { status: 404 });

    await db.delete(sets).where(and(eq(sets.id, setId), eq(sets.testId, testId)));

    return NextResponse.json({ success: true, message: "Set deleted" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to delete set" }, { status: 500 });
  }
}
