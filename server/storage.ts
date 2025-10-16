import { 
  expenses, 
  payments, 
  paymentApplications,
  type Expense, 
  type InsertExpense,
  type Payment,
  type InsertPayment,
  type PaymentApplication
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  getAllExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: InsertExpense): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;
  
  // Payment methods
  getAllPayments(): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  deletePayment(id: string): Promise<boolean>;
  getPaymentApplications(paymentId: string): Promise<PaymentApplication[]>;
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

  async updateExpense(id: string, insertExpense: InsertExpense): Promise<Expense | undefined> {
    const [expense] = await db
      .update(expenses)
      .set({
        ...insertExpense,
        productCost: insertExpense.productCost.toString(),
        markupPercentage: insertExpense.markupPercentage.toString(),
        shippingCost: insertExpense.shippingCost.toString(),
        paymentReceived: insertExpense.paymentReceived.toString(),
      })
      .where(eq(expenses.id, id))
      .returning();
    return expense || undefined;
  }

  async deleteExpense(id: string): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Payment methods
  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.date));
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    // Create the payment record
    const [payment] = await db
      .insert(payments)
      .values({
        ...insertPayment,
        amount: insertPayment.amount.toString(),
      })
      .returning();

    // Auto-distribute to unpaid expenses for this client
    await this.autoDistributePayment(payment.id, insertPayment.client, Number(insertPayment.amount));

    return payment;
  }

  async deletePayment(id: string): Promise<boolean> {
    // Get all payment applications to reverse them
    const applications = await db
      .select()
      .from(paymentApplications)
      .where(eq(paymentApplications.paymentId, id));
    
    // Reverse payment applications: reduce expense.paymentReceived
    for (const app of applications) {
      const expense = await this.getExpense(app.expenseId);
      if (expense) {
        const currentPaymentReceived = Number(expense.paymentReceived);
        const amountToReverse = Number(app.amountApplied);
        const newPaymentReceived = currentPaymentReceived - amountToReverse;
        
        await db
          .update(expenses)
          .set({ paymentReceived: newPaymentReceived.toString() })
          .where(eq(expenses.id, app.expenseId));
      }
    }
    
    // Delete payment applications
    await db.delete(paymentApplications).where(eq(paymentApplications.paymentId, id));
    
    // Delete the payment
    const result = await db.delete(payments).where(eq(payments.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getPaymentApplications(paymentId: string): Promise<PaymentApplication[]> {
    return await db
      .select()
      .from(paymentApplications)
      .where(eq(paymentApplications.paymentId, paymentId));
  }

  // Helper method to auto-distribute payment to unpaid expenses
  private async autoDistributePayment(paymentId: string, client: string, paymentAmount: number): Promise<void> {
    // Get all expenses for this client, oldest first
    const clientExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.client, client))
      .orderBy(asc(expenses.date));

    let remainingPayment = paymentAmount;

    for (const expense of clientExpenses) {
      if (remainingPayment <= 0) break;

      const total = Number(expense.productCost) * (1 + Number(expense.markupPercentage) / 100) + Number(expense.shippingCost);
      const alreadyPaid = Number(expense.paymentReceived);
      const balance = total - alreadyPaid;

      if (balance > 0) {
        const amountToApply = Math.min(balance, remainingPayment);

        // Create payment application record
        await db.insert(paymentApplications).values({
          paymentId,
          expenseId: expense.id,
          amountApplied: amountToApply.toString(),
        });

        // Update expense paymentReceived
        const newPaymentReceived = alreadyPaid + amountToApply;
        await db
          .update(expenses)
          .set({ paymentReceived: newPaymentReceived.toString() })
          .where(eq(expenses.id, expense.id));

        remainingPayment -= amountToApply;
      }
    }
  }
}

export const storage = new DatabaseStorage();
