import { eq } from "drizzle-orm";
import { db } from "../index";
import { questions, options } from "../schema";
import type { NewOption, NewQuestion } from "../schema";

export async function getQuestionsForAttempt(testId: string) {
  return db.query.questions.findMany({
    where: eq(questions.testId, testId),
    orderBy: questions.order,
    columns: {
      id: true,
      questionText: true,
      type: true,
      marks: true,
      order: true,
      explanation: true,
    },
    with: {
      options: {
        columns: {
          id: true,
          optionText: true,
          order: true,
          isCorrect: false,
        },
        orderBy: options.order,
      },
    },
  });
}

// For admin — isCorrect is INCLUDED, no columns filter

export async function getQuestionsForAdmin(testId: string) {
  return db.query.questions.findMany({
    where: eq(questions.testId, testId),
    orderBy: questions.order,
    with: {
      options: {
        orderBy: options.order,
      },
    },
  });
}

// For scoring during submit — needs isCorrect to calculate marks
export async function getQuestionsWithOptionsForScoring(testId: string) {
  return db.query.questions.findMany({
    where: eq(questions.testId, testId),
    with: {
      options: true,
    },
  });
}

// Single question with options — used in admin edit page
export async function getQuestionById(questionId: string) {
  return db.query.questions.findFirst({
    where: eq(questions.id, questionId),
    with: {
      options: {
        orderBy: options.order,
      },
    },
  });
}

// Create question
export async function createQuestion(data: NewQuestion) {
  const result = await db.insert(questions).values(data).returning();
  return result[0];
}

// create options
export async function createOptions(data: NewOption) {
  return db.insert(options).values(data).returning();
}

// update question
export async function updateQuestion(id: string, data: Partial<NewQuestion>) {
  const result = await db
    .update(questions)
    .set(data)
    .where(eq(questions.id, id))
    .returning();

  return result[0];
}

// delete question
export async function deleteQuestion(id: string) {
  return db.delete(questions).where(eq(questions.id, id));
}
