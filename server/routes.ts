import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpenseSchema, insertPaymentSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/expenses", async (_req, res) => {
    try {
      const expenses = await storage.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.get("/api/invoice-numbers", async (_req, res) => {
    try {
      const invoiceNumbers = await storage.getAllInvoiceNumbers();
      res.json(invoiceNumbers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoice numbers" });
    }
  });

  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const expense = await storage.getExpense(req.params.id);
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const result = insertExpenseSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }

      const expense = await storage.createExpense(result.data);
      res.status(201).json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to create expense" });
    }
  });

  app.patch("/api/expenses/:id", async (req, res) => {
    try {
      const result = insertExpenseSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }

      const expense = await storage.updateExpense(req.params.id, result.data);
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteExpense(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (_req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.get("/api/payments/:id", async (req, res) => {
    try {
      const payment = await storage.getPayment(req.params.id);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      
      // Include payment applications
      const applications = await storage.getPaymentApplications(req.params.id);
      res.json({ ...payment, applications });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const result = insertPaymentSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }

      const payment = await storage.createPayment(result.data);
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  app.delete("/api/payments/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePayment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete payment" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
