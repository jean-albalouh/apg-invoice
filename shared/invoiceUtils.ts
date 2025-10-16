import { format } from "date-fns";

export interface InvoiceNumber {
  year: number;
  month: number;
  sequence: number;
  formatted: string;
}

/**
 * Generate a new invoice number in format YYYY-MM-NNN
 * @param existingInvoices Array of existing invoice numbers for the month
 * @param date Date for the invoice (defaults to today)
 */
export function generateInvoiceNumber(
  existingInvoices: string[],
  date: Date = new Date()
): InvoiceNumber {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const monthStr = String(month).padStart(2, "0");
  const prefix = `${year}-${monthStr}`;

  // Filter invoices for the current month and extract sequence numbers
  const monthlyInvoices = existingInvoices
    .filter((inv) => inv.startsWith(prefix))
    .map((inv) => {
      const parts = inv.split("-");
      return parts.length === 3 ? parseInt(parts[2], 10) : 0;
    })
    .filter((num) => !isNaN(num));

  // Find the highest sequence number
  const maxSequence = monthlyInvoices.length > 0 ? Math.max(...monthlyInvoices) : 0;
  const nextSequence = maxSequence + 1;
  const sequenceStr = String(nextSequence).padStart(3, "0");

  return {
    year,
    month,
    sequence: nextSequence,
    formatted: `${prefix}-${sequenceStr}`,
  };
}

/**
 * Parse an invoice number string into its components
 */
export function parseInvoiceNumber(invoiceNumber: string): InvoiceNumber | null {
  const parts = invoiceNumber.split("-");
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const sequence = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(sequence)) return null;

  return {
    year,
    month,
    sequence,
    formatted: invoiceNumber,
  };
}
