import { db } from "@/src/db";
import { sections, sets } from "@/src/db/schema";
import { isAdmin } from "@/src/lib/auth-helper";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createSectionSchema = z.object({
  setId: z.string().min(1, "setId is required"),
  name: z.string().min(1, "Section name is required").max(200),
  order: z.coerce.number().int().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const result = createSectionSchema.safeParse(body);

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

    const { setId, name, order } = result.data;

    // Verify set exists
    const set = await db.query.sets.findFirst({ where: eq(sets.id, setId) });
    if (!set)
      return NextResponse.json({ success: false, message: "Set not found" }, { status: 404 });

    const id = nanoid(12);
    const newSection = await db
      .insert(sections)
      .values({ id, setId, name, order })
      .returning();

    return NextResponse.json(
      { success: true, message: "Section created", data: newSection[0] },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to create section" }, { status: 500 });
  }
}
