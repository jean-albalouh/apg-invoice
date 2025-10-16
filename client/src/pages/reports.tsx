import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Expense } from "@shared/schema";
import { ExpenseTable } from "@/components/expense-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CLIENTS = [
  "A TA PORTE",
  "BEST DEAL",
  "LE PHÉNICIEN",
  "LE GRAND MARCHÉ DE FRANCE",
] as const;

export default function Reports() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`
  );
  const [reportType, setReportType] = useState<"full" | "company">("full");
  const [selectedCompany, setSelectedCompany] = useState<string>(CLIENTS[0]);

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const [year, month] = selectedMonth.split("-").map(Number);
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));

  const monthFilteredExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate >= monthStart && expDate <= monthEnd;
  });

  const filteredExpenses = reportType === "company" 
    ? monthFilteredExpenses.filter(exp => exp.client === selectedCompany)
    : monthFilteredExpenses;

  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const totalProductCost = filteredExpenses.reduce(
    (sum, exp) => sum + Number(exp.productCost) * (1 + Number(exp.markupPercentage) / 100),
    0
  );
  const totalShippingCost = filteredExpenses.reduce(
    (sum, exp) => sum + Number(exp.shippingCost),
    0
  );
  const totalPaymentReceived = filteredExpenses.reduce(
    (sum, exp) => sum + Number(exp.paymentReceived),
    0
  );
  const grandTotal = totalProductCost + totalShippingCost;
  const balanceOwed = grandTotal - totalPaymentReceived;

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = format(date, "MMMM yyyy");
      options.push({ value, label });
    }
    return options;
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // A TA PORTE Header
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text("A TA PORTE", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text("Shipping & Fulfillment Services", 14, 27);
    
    // Report Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("Monthly Expense Report", 14, 40);
    
    // Date and Recipient
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Period: ${format(monthStart, "MMMM yyyy")}`, 14, 48);
    
    if (reportType === "company") {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`To: ${selectedCompany}`, 14, 56);
    }

    const summaryStartY = reportType === "company" ? 65 : 57;
    
    // Summary Box
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text("Summary", 14, summaryStartY);
    
    doc.setFont(undefined, 'normal');
    const summaryBoxY = summaryStartY + 5;
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.rect(14, summaryBoxY, 90, 25, 'FD');
    
    doc.setFontSize(9);
    doc.text(`Total Billed:`, 18, summaryBoxY + 7);
    doc.text(`€${grandTotal.toFixed(2)}`, 75, summaryBoxY + 7, { align: 'right' });
    
    doc.text(`Total Paid:`, 18, summaryBoxY + 14);
    doc.setTextColor(0, 150, 0);
    doc.text(`€${totalPaymentReceived.toFixed(2)}`, 75, summaryBoxY + 14, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(`Balance Remaining:`, 18, summaryBoxY + 21);
    if (balanceOwed > 0) {
      doc.setTextColor(200, 0, 0);
    } else {
      doc.setTextColor(0, 150, 0);
    }
    doc.text(`€${balanceOwed.toFixed(2)}`, 75, summaryBoxY + 21, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');

    const tableData = sortedExpenses.map((exp) => {
      const productWithMarkup = Number(exp.productCost) * (1 + Number(exp.markupPercentage) / 100);
      const total = productWithMarkup + Number(exp.shippingCost);
      return [
        format(new Date(exp.date), "MMM dd, yyyy"),
        exp.client,
        exp.productDescription,
        exp.quantity,
        `€${productWithMarkup.toFixed(2)}`,
        `€${Number(exp.shippingCost).toFixed(2)}`,
        `€${total.toFixed(2)}`,
        exp.status,
      ];
    });

    const tableStartY = summaryBoxY + 35;

    autoTable(doc, {
      head: [["Date", "Client", "Product", "Qty", "Product+Markup", "Shipping", "Total", "Status"]],
      body: tableData,
      foot: [
        [
          "Totals",
          "",
          "",
          "",
          `€${totalProductCost.toFixed(2)}`,
          `€${totalShippingCost.toFixed(2)}`,
          `€${grandTotal.toFixed(2)}`,
          "",
        ],
      ],
      startY: tableStartY,
      theme: "striped",
      headStyles: { fillColor: [33, 150, 243] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
    });

    const fileName = reportType === "company"
      ? `expense-report-${selectedCompany.toLowerCase().replace(/\s+/g, '-')}-${format(monthStart, "yyyy-MM")}.pdf`
      : `expense-report-${format(monthStart, "yyyy-MM")}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Monthly Reports</h2>
          <p className="text-muted-foreground mt-1">
            Generate and export expense reports for client billing
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={reportType} onValueChange={(value: "full" | "company") => setReportType(value)}>
            <SelectTrigger className="w-[180px]" data-testid="select-report-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Report (All)</SelectItem>
              <SelectItem value="company">Per Company</SelectItem>
            </SelectContent>
          </Select>
          
          {reportType === "company" && (
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-[200px]" data-testid="select-company">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLIENTS.map((client) => (
                  <SelectItem key={client} value={client}>
                    {client}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]" data-testid="select-month">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {generateMonthOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Product Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums" data-testid="report-product-cost">
              €{totalProductCost.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Shipping Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums" data-testid="report-shipping-cost">
              €{totalShippingCost.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums text-primary" data-testid="report-total-due">
              €{grandTotal.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {reportType === "company" ? `${selectedCompany} - Expense Details` : "Expense Details"}
          </h3>
          <Button
            onClick={handleExportPDF}
            disabled={filteredExpenses.length === 0}
            data-testid="button-export-pdf"
          >
            <Download className="mr-2 h-4 w-4" />
            {reportType === "company" ? `Export for ${selectedCompany}` : "Export Full Report"}
          </Button>
        </div>
        <ExpenseTable expenses={sortedExpenses} showActions={false} />
      </div>
    </div>
  );
}
