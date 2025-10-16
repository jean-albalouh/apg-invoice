import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { Expense } from "@shared/schema";
import { calculateExpense } from "@shared/calculations";
import { COMPANY_INFO, A_TA_PORTE_INFO } from "@shared/companyInfo";

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  clientName: string;
  expenses: Expense[];
  totalPaid: number;
}

export function generateFrenchInvoice(data: InvoiceData): jsPDF {
  const doc = new jsPDF();
  const clientInfo = COMPANY_INFO[data.clientName];

  if (!clientInfo) {
    throw new Error(`Company information not found for ${data.clientName}`);
  }

  // Header - A TA PORTE (Issuer)
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(A_TA_PORTE_INFO.name, 14, 20);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(A_TA_PORTE_INFO.address, 14, 27);
  doc.text(`Tél: ${A_TA_PORTE_INFO.phone}`, 14, 32);
  doc.text(`SIREN: ${A_TA_PORTE_INFO.siren}`, 14, 37);
  doc.text(`TVA: ${A_TA_PORTE_INFO.tvaNumber}`, 14, 42);

  // Client Information (Right side)
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURER À:", 120, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const clientLines = [
    clientInfo.name,
    clientInfo.address,
    `Tél: ${clientInfo.phone}`,
    `SIREN: ${clientInfo.siren}`,
    `TVA: ${clientInfo.tvaNumber}`,
  ];
  clientLines.forEach((line, i) => {
    doc.text(line, 120, 27 + i * 5);
  });

  // Invoice Title and Number
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURE", 14, 60);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`N° ${data.invoiceNumber}`, 14, 68);
  doc.text(
    `Date: ${format(data.invoiceDate, "dd/MM/yyyy")}`,
    14,
    74
  );

  // Calculate totals with TVA breakdown
  const calculations = data.expenses.map((exp) => calculateExpense(exp));
  
  // Group by TVA rate for summary (using marked-up values for consistency)
  const tvaGroups = new Map<number, { ht: number; tva: number; ttc: number }>();
  
  calculations.forEach((calc, idx) => {
    const exp = data.expenses[idx];
    const tvaRate = Number(exp.tvaPercentage);
    const existing = tvaGroups.get(tvaRate) || { ht: 0, tva: 0, ttc: 0 };
    
    // Calculate HT and TVA from the marked-up amount
    // productWithMarkup is TTC with markup, need to extract HT and TVA
    const markedUpTTC = calc.productWithMarkup;
    const markedUpHT = markedUpTTC / (1 + tvaRate / 100);
    const markedUpTVA = markedUpTTC - markedUpHT;
    
    existing.ht += markedUpHT;
    existing.tva += markedUpTVA;
    existing.ttc += markedUpTTC;
    
    tvaGroups.set(tvaRate, existing);
  });

  const totalShipping = calculations.reduce((sum, calc) => sum + calc.shippingCost, 0);
  const totalWithMarkup = calculations.reduce((sum, calc) => sum + calc.productWithMarkup, 0);
  
  // Calculate totals from TVA groups (already includes markup)
  let totalHT = 0;
  let totalTVA = 0;
  let totalTTC = 0;
  
  tvaGroups.forEach((group) => {
    totalHT += group.ht;
    totalTVA += group.tva;
    totalTTC += group.ttc;
  });
  
  const grandTotal = totalWithMarkup + totalShipping;

  // Items Table with TVA breakdown
  const tableData = data.expenses.map((exp, idx) => {
    const calc = calculations[idx];
    return [
      format(new Date(exp.date), "dd/MM/yyyy"),
      exp.productDescription,
      exp.quantity.toString(),
      `€${calc.productCostHT.toFixed(2)}`,
      `${Number(exp.tvaPercentage).toFixed(1)}%`,
      `€${calc.tvaAmount.toFixed(2)}`,
      `€${calc.productCostTTC.toFixed(2)}`,
      `${Number(exp.markupPercentage).toFixed(0)}%`,
      `€${calc.productWithMarkup.toFixed(2)}`,
    ];
  });

  // Add shipping as separate line if exists
  if (totalShipping > 0) {
    data.expenses.forEach((exp, idx) => {
      const calc = calculations[idx];
      if (calc.shippingCost > 0) {
        tableData.push([
          format(new Date(exp.date), "dd/MM/yyyy"),
          `Livraison - ${exp.shippingCarrier || "Standard"}`,
          "1",
          `€${calc.shippingCost.toFixed(2)}`,
          "0%",
          "€0.00",
          `€${calc.shippingCost.toFixed(2)}`,
          "0%",
          `€${calc.shippingCost.toFixed(2)}`,
        ]);
      }
    });
  }

  autoTable(doc, {
    head: [
      [
        "Date",
        "Description",
        "Qté",
        "HT",
        "TVA",
        "Mont. TVA",
        "TTC",
        "Marge",
        "Total",
      ],
    ],
    body: tableData,
    startY: 85,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 50 },
      2: { cellWidth: 12 },
      3: { cellWidth: 20 },
      4: { cellWidth: 15 },
      5: { cellWidth: 22 },
      6: { cellWidth: 20 },
      7: { cellWidth: 15 },
      8: { cellWidth: 20 },
    },
  });

  // Get the Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY || 85;

  // TVA Summary Table
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("RÉCAPITULATIF TVA", 14, finalY + 10);

  const tvaSummaryData = Array.from(tvaGroups.entries()).map(
    ([rate, amounts]) => [
      `${rate.toFixed(1)}%`,
      `€${amounts.ht.toFixed(2)}`,
      `€${amounts.tva.toFixed(2)}`,
      `€${amounts.ttc.toFixed(2)}`,
    ]
  );

  autoTable(doc, {
    head: [["Taux TVA", "Base HT", "Montant TVA", "Total TTC"]],
    body: tvaSummaryData,
    foot: [
      [
        "TOTAL",
        `€${totalHT.toFixed(2)}`,
        `€${totalTVA.toFixed(2)}`,
        `€${totalTTC.toFixed(2)}`,
      ],
    ],
    startY: finalY + 15,
    theme: "grid",
    headStyles: { fillColor: [52, 73, 94], fontSize: 9 },
    footStyles: {
      fillColor: [236, 240, 241],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 },
    },
  });

  const tvaSummaryEndY = (doc as any).lastAutoTable.finalY || finalY + 15;

  // Totals Box (dynamic height based on payment status)
  const totalsY = tvaSummaryEndY + 15;
  const boxHeight = data.totalPaid > 0 ? 55 : 40; // Taller box if payment info exists
  
  doc.setDrawColor(52, 73, 94);
  doc.setLineWidth(0.5);
  doc.rect(120, totalsY, 75, boxHeight);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Sous-total produits TTC:", 125, totalsY + 8);
  doc.text(`€${totalWithMarkup.toFixed(2)}`, 188, totalsY + 8, {
    align: "right",
  });

  doc.text("Livraison:", 125, totalsY + 16);
  doc.text(`€${totalShipping.toFixed(2)}`, 188, totalsY + 16, {
    align: "right",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL TTC À PAYER:", 125, totalsY + 28);
  doc.text(`€${grandTotal.toFixed(2)}`, 188, totalsY + 28, { align: "right" });

  // Payment Status
  if (data.totalPaid > 0) {
    const balance = grandTotal - data.totalPaid;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Montant payé: €${data.totalPaid.toFixed(2)}`, 125, totalsY + 38);
    
    if (balance > 0) {
      doc.setTextColor(200, 0, 0);
      doc.text(`Solde dû: €${balance.toFixed(2)}`, 125, totalsY + 46);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.setTextColor(0, 150, 0);
      doc.text("PAYÉ", 125, totalsY + 46);
      doc.setTextColor(0, 0, 0);
    }
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  const footerY = 280;
  doc.text(
    "Conditions de paiement: Net à 30 jours - Pénalités de retard: 3 fois le taux d'intérêt légal",
    105,
    footerY,
    { align: "center" }
  );
  doc.text(
    "En cas de retard de paiement, une indemnité forfaitaire de 40€ sera exigible",
    105,
    footerY + 4,
    { align: "center" }
  );

  return doc;
}
