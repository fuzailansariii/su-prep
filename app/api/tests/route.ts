import { db } from "@/src/db";
import { tests } from "@/src/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const data = await db
      .select({
        id: tests.id,
        title: tests.title,
        thumbnail: tests.thumbnail,
        description: tests.description,
        duration: tests.duration,
        totalQuestions: tests.totalQuestions,
        totalMarks: tests.totalMarks,
        price: tests.price,
        difficulty: tests.difficulty,
        isFeatured: tests.isFeatured,
        negativeMarking: tests.negativeMarking,
        negativeMarkFraction: tests.negativeMarkFraction,
        status: tests.status,
        createdAt: tests.createdAt,
        updatedAt: tests.updatedAt,
      })
      .from(tests)
      .where(and(eq(tests.status, "published"), isNull(tests.deletedAt)));
    return NextResponse.json({ success: true, data: data }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch tests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tests" },
      { status: 500 },
    );
  }
}
