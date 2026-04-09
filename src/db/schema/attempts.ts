import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tests } from "./tests";
import { options, questions } from "./questions";

export const attemptStatusEnum = pgEnum("attempt_status", [
  "in_progress",
  "completed",
  "abandoned",
]);

export const attempts = pgTable(
  "attempts",
  {
    id: text("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    testId: text("test_id")
      .notNull()
      .references(() => tests.id, { onDelete: "restrict" }),
    status: attemptStatusEnum("status").default("in_progress").notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    submittedAt: timestamp("submitted_at"),
    timeTaken: integer("time_taken"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_attempts_user").on(table.clerkUserId),
    index("idx_attempts_test").on(table.testId),
  ],
);

export const attemptAnswers = pgTable(
  "attempt_answers",
  {
    id: text("id").primaryKey(),
    attemptId: text("attempt_id")
      .notNull()
      .references(() => attempts.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "restrict" }),
    selectedOptionIds: text("selected_option_ids").array(),
    isCorrect: boolean("is_correct").default(false).notNull(),
    marksAwarded: integer("marks_awarded").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_attempt_answers_attempt").on(table.attemptId),
    index("idx_attempt_answers_question").on(table.questionId),
    uniqueIndex("unique_attempt_question").on(
      table.attemptId,
      table.questionId,
    ),
  ],
);

export type Attempt = typeof attempts.$inferSelect;
export type NewAttempt = typeof attempts.$inferInsert;
export type AttemptAnswer = typeof attemptAnswers.$inferSelect;
export type NewAttemptAnswer = typeof attemptAnswers.$inferInsert;
