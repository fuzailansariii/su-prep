import { db } from "@/src/db";
import { sections } from "@/src/db/schema";
import { isAdmin } from "@/src/lib/auth-helper";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type Context = { params: Promise<{ sectionId: string }> };

export async function DELETE(_req: NextRequest, { params }: Context) {
  try {
    const admin = await isAdmin();
    if (!admin)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { sectionId } = await params;

    const existing = await db.query.sections.findFirst({
      where: eq(sections.id, sectionId),
    });
    if (!existing)
      return NextResponse.json({ success: false, message: "Section not found" }, { status: 404 });

    await db.delete(sections).where(eq(sections.id, sectionId));

    return NextResponse.json({ success: true, message: "Section deleted" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to delete section" }, { status: 500 });
  }
}
