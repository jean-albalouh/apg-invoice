import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  client: text("client").notNull(),
  productDescription: text("product_description").notNull(),
  quantity: text("quantity").notNull().default("1"),
  productCost: decimal("product_cost", { precision: 10, scale: 2 }).notNull(),
  markupPercentage: decimal("markup_percentage", { precision: 5, scale: 2 }).notNull().default("5.00"),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).notNull(),
  shippingCarrier: text("shipping_carrier").notNull().default("Colissimo"),
  status: text("status").notNull().default("shipped"),
  paymentReceived: decimal("payment_received", { precision: 10, scale: 2 }).notNull().default("0.00"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.string().or(z.date()).transform((val) => new Date(val)),
  client: z.string().min(1, "Please select client"),
  productDescription: z.string().min(1, "Product description is required"),
  quantity: z.string().min(1, "Quantity is required"),
  productCost: z.number().min(0.01, "Product cost must be greater than 0"),
  markupPercentage: z.number().min(0).max(100),
  shippingCost: z.number().min(0),
  shippingCarrier: z.string().min(1, "Shipping carrier is required"),
  status: z.string().min(1, "Status is required"),
  paymentReceived: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
