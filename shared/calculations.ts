import { type Expense } from "./schema";

export interface ExpenseCalculation {
  productCostHT: number;
  tvaAmount: number;
  productCostTTC: number;
  markupAmount: number;
  productWithMarkup: number;
  shippingCost: number;
  total: number;
  balance: number;
}

export function calculateExpense(expense: Expense): ExpenseCalculation {
  const productCostTTC = Number(expense.productCost);
  const tvaPercentage = Number(expense.tvaPercentage || 5.5);
  const markupPercentage = Number(expense.markupPercentage || 0);
  const markupAppliesTo = expense.markupAppliesTo || "TTC";
  const shippingCost = Number(expense.shippingCost);
  const paymentReceived = Number(expense.paymentReceived || 0);

  // Calculate HT from TTC: HT = TTC / (1 + TVA%)
  const productCostHT = productCostTTC / (1 + tvaPercentage / 100);
  const tvaAmount = productCostTTC - productCostHT;

  let productWithMarkup: number;
  let markupAmount: number;

  if (markupAppliesTo === "HT") {
    // Apply markup to HT, then add TVA
    const htWithMarkup = productCostHT * (1 + markupPercentage / 100);
    const tvaOnMarkup = htWithMarkup * (tvaPercentage / 100);
    productWithMarkup = htWithMarkup + tvaOnMarkup;
    markupAmount = productWithMarkup - productCostTTC;
  } else {
    // Apply markup to TTC (default behavior)
    productWithMarkup = productCostTTC * (1 + markupPercentage / 100);
    markupAmount = productWithMarkup - productCostTTC;
  }

  const total = productWithMarkup + shippingCost;
  const balance = total - paymentReceived;

  return {
    productCostHT,
    tvaAmount,
    productCostTTC,
    markupAmount,
    productWithMarkup,
    shippingCost,
    total,
    balance,
  };
}
