import { format } from "date-fns";

export interface InvoiceNumber {
  year: number;
  month: number;
  sequence: number;
  formatted: string;
}

/**
 * Generate a new invoice number as simple sequential: 1, 2, 3...
 * @param existingInvoices Array of all existing invoice numbers
 * @param date Date for the invoice (defaults to today)
 */
export function generateInvoiceNumber(
  existingInvoices: string[],
  date: Date = new Date()
): InvoiceNumber {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  // Extract all numeric invoice numbers
  const allNumbers = existingInvoices
    .map((inv) => parseInt(inv, 10))
    .filter((num) => !isNaN(num));

  // Find the highest invoice number
  const maxNumber = allNumbers.length > 0 ? Math.max(...allNumbers) : 0;
  const nextNumber = maxNumber + 1;

  return {
    year,
    month,
    sequence: nextNumber,
    formatted: String(nextNumber),
  };
}

/**
 * Parse an invoice number string into its components
 */
export function parseInvoiceNumber(invoiceNumber: string): InvoiceNumber | null {
  const num = parseInt(invoiceNumber, 10);
  if (isNaN(num)) return null;

  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    sequence: num,
    formatted: invoiceNumber,
  };
}
