import {
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { tests } from "./tests";
import { attempts } from "./attempts";
import { sets } from "./sets";

export const results = pgTable(
  "results",
  {
    id: text("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    testId: text("test_id")
      .notNull()
      .references(() => tests.id, { onDelete: "restrict" }),
    setId: text("set_id")
      .notNull()
      .references(() => sets.id, { onDelete: "restrict" }),
    marksLost: real("marks_lost").notNull().default(0),
    attemptId: text("attempt_id")
      .unique()
      .notNull()
      .references(() => attempts.id, { onDelete: "cascade" }),
    totalMarks: integer("total_marks").notNull(),
    scoredMarks: real("scored_marks").notNull(),
    correctAnswers: integer("correct_answers").notNull(),
    wrongAnswers: integer("wrong_answers").notNull(),
    skippedAnswers: integer("skipped_answers").notNull(),
    percentage: real("percentage").notNull(), // e.g. 75.5
    timeTaken: integer("time_taken").notNull(), // in seconds
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_results_test").on(table.testId)],
);

export type Result = typeof results.$inferSelect;
export type NewResult = typeof results.$inferInsert;
