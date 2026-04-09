import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tests } from "./tests";

export const purchaseStatusEnum = pgEnum("purchase_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const purchases = pgTable(
  "purchases",
  {
    id: text("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    testId: text("test_id")
      .notNull()
      .references(() => tests.id, { onDelete: "restrict" }),
    testTitle: text("test_title").notNull(), // store at purchase time
    amount: integer("amount").notNull(), // in paise
    status: purchaseStatusEnum("status").default("pending").notNull(),
    razorpayOrderId: text("razorpay_order_id"),
    razorpayPaymentId: text("razorpay_payment_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("unique_purchase").on(table.clerkUserId, table.testId),
    index("idx_purchases_user").on(table.clerkUserId),
    index("idx_purchases_test").on(table.testId),
  ],
);

export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
