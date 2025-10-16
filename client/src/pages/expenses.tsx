import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Expense, type InsertExpense } from "@shared/schema";
import { AddExpenseDialog } from "@/components/add-expense-dialog";
import { ExpenseTable } from "@/components/expense-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const CLIENTS = [
  { value: "all", label: "All Clients" },
  { value: "A TA PORTE", label: "A TA PORTE" },
  { value: "BEST DEAL", label: "BEST DEAL" },
  { value: "LE PHÉNICIEN", label: "LE PHÉNICIEN" },
  { value: "LE GRAND MARCHÉ DE FRANCE", label: "GRAND MARCHÉ" },
] as const;

export default function Expenses() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState("all");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { toast } = useToast();

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertExpense) => {
      return await apiRequest("POST", "/api/expenses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertExpense }) => {
      return await apiRequest("PATCH", `/api/expenses/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredExpenses = selectedClient === "all" 
    ? sortedExpenses 
    : sortedExpenses.filter(exp => exp.client === selectedClient);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-muted/50 rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted/50 rounded animate-pulse" />
        </div>
        <div className="h-96 bg-muted/50 rounded-md animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">All Expenses</h2>
          <p className="text-muted-foreground mt-1">
            Manage your product and shipping expenses
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-add-expense">
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <Tabs value={selectedClient} onValueChange={setSelectedClient} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          {CLIENTS.map((client) => (
            <TabsTrigger 
              key={client.value} 
              value={client.value}
              data-testid={`tab-${client.value.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {client.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CLIENTS.map((client) => {
          const clientExpenses = client.value === "all" 
            ? sortedExpenses 
            : sortedExpenses.filter(exp => exp.client === client.value);
          
          const totalBilled = clientExpenses.reduce(
            (sum, exp) => sum + Number(exp.productCost) * (1 + Number(exp.markupPercentage) / 100) + Number(exp.shippingCost),
            0
          );
          const totalPaid = clientExpenses.reduce((sum, exp) => sum + Number(exp.paymentReceived), 0);
          const balance = totalBilled - totalPaid;
          const orderCount = clientExpenses.length;

          return (
            <TabsContent key={client.value} value={client.value} className="space-y-4">
              {client.value !== "all" && orderCount > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-card rounded-md border p-4">
                    <p className="text-sm text-muted-foreground">Orders</p>
                    <p className="text-2xl font-semibold mt-1">{orderCount}</p>
                  </div>
                  <div className="bg-card rounded-md border p-4">
                    <p className="text-sm text-muted-foreground">Total Billed</p>
                    <p className="text-2xl font-semibold mt-1">€{totalBilled.toFixed(2)}</p>
                  </div>
                  <div className="bg-card rounded-md border p-4">
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="text-2xl font-semibold mt-1 text-green-600 dark:text-green-400">€{totalPaid.toFixed(2)}</p>
                  </div>
                  <div className="bg-card rounded-md border p-4">
                    <p className="text-sm text-muted-foreground">Balance Owed</p>
                    <p className="text-2xl font-semibold mt-1 text-red-600 dark:text-red-400">€{balance.toFixed(2)}</p>
                  </div>
                </div>
              )}
              <ExpenseTable
                expenses={clientExpenses}
                onEdit={(expense) => {
                  setEditingExpense(expense);
                  setDialogOpen(true);
                }}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            </TabsContent>
          );
        })}
      </Tabs>

      <AddExpenseDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingExpense(null);
          }
        }}
        editExpense={editingExpense}
        onSubmit={async (data, id) => {
          if (id) {
            await updateMutation.mutateAsync({ id, data });
          } else {
            await createMutation.mutateAsync(data);
          }
          setEditingExpense(null);
        }}
      />
    </div>
  );
}
