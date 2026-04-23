import QuestionsClient from "@/components/admin/tests/questions-client";
import { db } from "@/src/db";
import { questions, tests } from "@/src/db/schema";
import { eq } from "drizzle-orm";

interface QuestionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestionsPage({ params }: QuestionsPageProps) {
  const { id: testId } = await params;
  const allQuestions = await db.query.questions.findMany({
    where: eq(questions.testId, testId),
    with: { options: true },
    orderBy: (questions, { asc }) => [asc(questions.order)],
  });
  return <QuestionsClient questions={allQuestions} testId={testId} />;
}
