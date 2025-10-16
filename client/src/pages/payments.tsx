import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPaymentSchema, type InsertPayment, type Payment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, Plus, Trash2, FileDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CLIENTS = [
  "A TA PORTE",
  "BEST DEAL",
  "LE PHÉNICIEN",
  "LE GRAND MARCHÉ DE FRANCE",
] as const;

export default function Payments() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: InsertPayment) => {
      return await apiRequest("POST", "/api/payments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Payment recorded and applied to expenses",
      });
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Payment deleted and removed from expenses",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertPayment>({
    resolver: zodResolver(insertPaymentSchema),
    defaultValues: {
      date: new Date(),
      client: "",
      amount: undefined as any,
      notes: "",
    },
  });

  const handleSubmit = async (data: InsertPayment) => {
    await createPaymentMutation.mutateAsync(data);
    form.reset({
      date: new Date(),
      client: "",
      amount: undefined as any,
      notes: "",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this payment? This will reverse the payment application to expenses.")) {
      deletePaymentMutation.mutate(id);
    }
  };

  const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

  const handleExportPaymentsPDF = () => {
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
    doc.text("Payment History Report", 14, 40);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${format(new Date(), "MMMM dd, yyyy")}`, 14, 48);
    
    // Summary
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text("Summary", 14, 58);
    
    doc.setFont(undefined, 'normal');
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.rect(14, 63, 70, 10, 'FD');
    
    doc.setFontSize(9);
    doc.text(`Total Payments:`, 18, 70);
    doc.setTextColor(0, 150, 0);
    doc.setFont(undefined, 'bold');
    doc.text(`€${totalPayments.toFixed(2)}`, 75, 70, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');

    // Sort payments by date (newest first)
    const sortedPayments = [...payments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const tableData = sortedPayments.map((payment) => [
      format(new Date(payment.date), "MMM dd, yyyy"),
      payment.client,
      `€${Number(payment.amount).toFixed(2)}`,
      payment.notes || "-",
    ]);

    autoTable(doc, {
      head: [["Date", "Client", "Amount", "Notes"]],
      body: tableData,
      startY: 80,
      theme: "striped",
      headStyles: { fillColor: [33, 150, 243] },
    });

    const fileName = `payment-history-${format(new Date(), "yyyy-MM-dd")}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1">
            Record client payments and auto-distribute to unpaid expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleExportPaymentsPDF} 
            variant="outline"
            data-testid="button-export-payments-pdf"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={() => setDialogOpen(true)} data-testid="button-add-payment">
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Payments Received</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="text-total-payments">
            €{totalPayments.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No payments recorded yet
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                    <TableCell>{format(new Date(payment.date), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{payment.client}</TableCell>
                    <TableCell className="font-medium text-green-600 dark:text-green-400">
                      €{Number(payment.amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.notes || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(payment.id)}
                        data-testid={`button-delete-${payment.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="button-select-date"
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-client">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CLIENTS.map((client) => (
                          <SelectItem key={client} value={client}>
                            {client}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          className="pl-7 tabular-nums"
                          data-testid="input-amount"
                          value={field.value || ""}
                          onChange={(e) => {
                            const val = e.target.valueAsNumber;
                            field.onChange(isNaN(val) ? undefined : val);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Payment reference, invoice number, etc."
                        className="resize-none"
                        rows={3}
                        data-testid="input-notes"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPaymentMutation.isPending}
                  data-testid="button-save-payment"
                >
                  {createPaymentMutation.isPending ? "Saving..." : "Save Payment"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
