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
  const enteredPrice = Number(expense.productCost);
  const tvaPercentage = Number(expense.tvaPercentage || 5.5);
  const markupPercentage = Number(expense.markupPercentage || 0);
  const markupAppliesTo = expense.markupAppliesTo || "TTC";
  const shippingCost = Number(expense.shippingCost);
  const paymentReceived = Number(expense.paymentReceived || 0);

  let productCostHT: number;
  let productCostTTC: number;
  let tvaAmount: number;
  let productWithMarkup: number;
  let markupAmount: number;

  if (markupAppliesTo === "HT") {
    // OPTION A: Treat entered price as HT, apply markup, then add TVA
    const htWithMarkup = enteredPrice * (1 + markupPercentage / 100);
    const tvaOnMarkup = htWithMarkup * (tvaPercentage / 100);
    productWithMarkup = htWithMarkup + tvaOnMarkup;
    
    // For display: calculate what the original HT and TTC would be
    productCostHT = enteredPrice;
    productCostTTC = enteredPrice * (1 + tvaPercentage / 100);
    tvaAmount = productCostTTC - productCostHT;
    markupAmount = productWithMarkup - productCostTTC;
  } else {
    // Treat entered price as TTC, apply markup to TTC
    productCostTTC = enteredPrice;
    productCostHT = productCostTTC / (1 + tvaPercentage / 100);
    tvaAmount = productCostTTC - productCostHT;
    
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
