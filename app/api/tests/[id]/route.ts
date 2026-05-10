import { db } from "@/src/db";
import { tests } from "@/src/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const data = await db
      .select({
        id: tests.id,
        title: tests.title,
        thumbnail: tests.thumbnail,
        description: tests.description,
        totalQuestions: tests.totalQuestions,
        price: tests.price,
        difficulty: tests.difficulty,
        isFeatured: tests.isFeatured,
        status: tests.status,
        createdAt: tests.createdAt,
        updatedAt: tests.updatedAt,
      })
      .from(tests)
      .where(
        and(
          eq(tests.id, id),
          eq(tests.status, "published"),
          isNull(tests.deletedAt),
        ),
      )
      .limit(1);

    if (!data.length) {
      return NextResponse.json(
        { success: false, error: "Test not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: data[0] }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch test:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch test" },
      { status: 500 },
    );
  }
}
