import { db } from "@/src/db";
import { questions, sections } from "@/src/db/schema";
import { isAdmin } from "@/src/lib/auth-helper";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type Context = { params: Promise<{ sectionId: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    const admin = await isAdmin();
    if (!admin)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { sectionId } = await params;

    const section = await db.query.sections.findFirst({
      where: eq(sections.id, sectionId),
    });
    if (!section)
      return NextResponse.json({ success: false, message: "Section not found" }, { status: 404 });

    const data = await db.query.questions.findMany({
      where: eq(questions.sectionId, sectionId),
      orderBy: (q, { asc }) => [asc(q.order)],
      with: {
        options: {
          orderBy: (o, { asc }) => [asc(o.order)],
        },
      },
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}
