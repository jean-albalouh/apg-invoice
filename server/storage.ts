import { expenses, type Expense, type InsertExpense } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getAllExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  deleteExpense(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses);
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense || undefined;
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values({
        ...insertExpense,
        productCost: insertExpense.productCost.toString(),
        markupPercentage: insertExpense.markupPercentage.toString(),
        shippingCost: insertExpense.shippingCost.toString(),
        paymentReceived: insertExpense.paymentReceived.toString(),
      })
      .returning();
    return expense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
