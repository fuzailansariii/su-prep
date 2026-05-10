import { db } from "@/src/db";
import { questions } from "@/src/db/schema";
import { isAdmin } from "@/src/lib/auth-helper";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

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

    const deletedQuestion = await db
      .delete(questions)
      .where(eq(questions.id, id))
      .returning();

    if (deletedQuestion.length === 0) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete question" },
      { status: 500 },
    );
  }
}
