import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  client: text("client").notNull(),
  productDescription: text("product_description").notNull(),
  quantity: text("quantity").notNull().default("1"),
  productCost: decimal("product_cost", { precision: 10, scale: 2 }).notNull(),
  tvaPercentage: decimal("tva_percentage", { precision: 5, scale: 2 }).notNull().default("5.50"),
  markupAppliesTo: text("markup_applies_to").notNull().default("TTC"),
  markupPercentage: decimal("markup_percentage", { precision: 5, scale: 2 }).notNull().default("5.00"),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).notNull(),
  shippingCarrier: text("shipping_carrier").notNull().default("Colissimo"),
  status: text("status").notNull().default("shipped"),
  paymentReceived: decimal("payment_received", { precision: 10, scale: 2 }).notNull().default("0.00"),
  invoiceNumber: text("invoice_number"),
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
  productCost: z.number().min(0, "Product cost cannot be negative"),
  tvaPercentage: z.number().min(0).max(100).default(5.5),
  markupAppliesTo: z.enum(["HT", "TTC"]).default("TTC"),
  markupPercentage: z.number().min(0).max(100),
  shippingCost: z.number().min(0, "Shipping cost cannot be negative"),
  shippingCarrier: z.string().min(1, "Shipping carrier is required"),
  status: z.string().min(1, "Status is required"),
  paymentReceived: z.number().min(0).default(0),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  client: text("client").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.string().or(z.date()).transform((val) => new Date(val)),
  client: z.string().min(1, "Please select client"),
  amount: z.number().min(0.01, "Payment amount must be greater than 0"),
  notes: z.string().optional(),
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Payment applications - tracks which expenses a payment was applied to
export const paymentApplications = pgTable("payment_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paymentId: varchar("payment_id").notNull().references(() => payments.id),
  expenseId: varchar("expense_id").notNull().references(() => expenses.id),
  amountApplied: decimal("amount_applied", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export type PaymentApplication = typeof paymentApplications.$inferSelect;

// Users table - for authentication (blueprint:javascript_auth_all_persistance)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
