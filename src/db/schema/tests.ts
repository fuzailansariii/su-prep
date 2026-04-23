import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const testStatusEnum = pgEnum("test_status", [
  "draft",
  "published",
  "archived",
]);

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

export const tests = pgTable(
  "tests",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    thumbnail: text("thumbnail"),
    duration: integer("duration").notNull(), // in minutes (e.g. 180)
    totalQuestions: integer("total_questions").notNull(),
    totalMarks: integer("total_marks").notNull(),
    negativeMarking: boolean("negative_marking").default(false).notNull(),
    negativeMarkFraction: integer("negative_mark_fraction").default(25), // e.g. 1 for -0.25 (marks -= negativeMarkFraction / 100; - "// means 0.25")
    price: integer("price").notNull(), // in paise (e.g. 49900 = ₹499)
    originalPrice: integer("original_price"), // in paise, optional
    difficulty: difficultyEnum("difficulty").default("medium").notNull(),
    status: testStatusEnum("status").default("draft").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("idx_tests_status").on(table.status),
    index("idx_tests_isFeatured").on(table.isFeatured),
  ],
);

export type Test = typeof tests.$inferSelect;
export type NewTest = typeof tests.$inferInsert;
