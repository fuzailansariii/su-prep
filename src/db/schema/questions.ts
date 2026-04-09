import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tests } from "./tests";

export const questionTypeEnum = pgEnum("question_type", [
  "mcq", // single correct
  "multi", // multiple correct
  "truefalse", // true or false
]);

export const questions = pgTable(
  "questions",
  {
    id: text("id").primaryKey(),
    testId: text("test_id")
      .notNull()
      .references(() => tests.id, { onDelete: "cascade" }),
    questionText: text("question_text").notNull(),
    type: questionTypeEnum("type").default("mcq").notNull(),
    explanation: text("explanation"), // shown after attempt
    marks: integer("marks").notNull().default(1),
    order: integer("order").notNull(), // question number in test
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("unique_question_order").on(table.testId, table.order),
    index("idx_question_test").on(table.testId),
  ],
);

export const options = pgTable(
  "options",
  {
    id: text("id").primaryKey(),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    optionText: text("option_text").notNull(),
    isCorrect: boolean("is_correct").default(false).notNull(),
    order: integer("order").notNull(), // A, B, C, D order
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_option_order").on(table.questionId, table.order),

    index("idx_options_question").on(table.questionId),
  ],
);

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Option = typeof options.$inferSelect;
export type NewOption = typeof options.$inferInsert;
