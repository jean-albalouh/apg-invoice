import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  productDescription: text("product_description").notNull(),
  productCost: decimal("product_cost", { precision: 10, scale: 2 }).notNull(),
  parcelCost: decimal("parcel_cost", { precision: 10, scale: 2 }).notNull(),
  paidBy: text("paid_by").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.string().or(z.date()).transform((val) => new Date(val)),
  productDescription: z.string().min(1, "Product description is required"),
  productCost: z.number().min(0.01, "Product cost must be greater than 0"),
  parcelCost: z.number().min(0.01, "Parcel cost must be greater than 0"),
  paidBy: z.string().min(1, "Please select who paid"),
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
