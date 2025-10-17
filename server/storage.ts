import { 
  expenses, 
  payments, 
  paymentApplications,
  users,
  type Expense, 
  type InsertExpense,
  type Payment,
  type InsertPayment,
  type PaymentApplication,
  type User,
  type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Session store setup (blueprint:javascript_auth_all_persistance)
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getAllExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: InsertExpense): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;
  getAllInvoiceNumbers(): Promise<string[]>;
  
  // Payment methods
  getAllPayments(): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  deletePayment(id: string): Promise<boolean>;
  getPaymentApplications(paymentId: string): Promise<PaymentApplication[]>;
  
  // User methods (blueprint:javascript_auth_all_persistance)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Initialize session store (blueprint:javascript_auth_all_persistance)
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }

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
        tvaPercentage: insertExpense.tvaPercentage.toString(),
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
        tvaPercentage: insertExpense.tvaPercentage.toString(),
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

  async getAllInvoiceNumbers(): Promise<string[]> {
    const result = await db
      .select({ invoiceNumber: expenses.invoiceNumber })
      .from(expenses);
    
    return result
      .map(r => r.invoiceNumber)
      .filter((num): num is string => num !== null && num !== undefined);
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

  // User methods (blueprint:javascript_auth_all_persistance)
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
