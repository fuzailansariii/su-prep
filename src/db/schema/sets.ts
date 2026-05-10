import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tests, testStatusEnum } from "./tests";

export const sets = pgTable(
  "sets",
  {
    id: text("id").primaryKey(),
    testId: text("test_id")
      .notNull()
      .references(() => tests.id, { onDelete: "cascade" }),
    title: text("title").notNull(), // e.g. 'Set 1' or 'IMU CET Prev Year 2025'
    description: text("description"),
    duration: integer("duration").notNull(), // in minutes
    totalQuestions: integer("total_questions").notNull(),
    totalMarks: integer("total_marks").notNull(),
    negativeMarking: boolean("negative_marking").default(false).notNull(),
    negativeMarkFraction: integer("negative_mark_fraction").default(25),
    order: integer("order").notNull(), // display order within a test
    status: testStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_sets_test").on(table.testId),
    uniqueIndex("unique_set_order").on(table.testId, table.order),
  ],
);

export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;
