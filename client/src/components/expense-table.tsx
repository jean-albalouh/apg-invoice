import { useState } from "react";
import { format } from "date-fns";
import { type Expense } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete?: (id: string) => void;
  onEdit?: (expense: Expense) => void;
  showActions?: boolean;
}

export function ExpenseTable({ expenses, onDelete, onEdit, showActions = true }: ExpenseTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalProductCost = expenses.reduce(
    (sum, exp) => sum + Number(exp.productCost) * (1 + Number(exp.markupPercentage) / 100),
    0
  );
  const totalShippingCost = expenses.reduce(
    (sum, exp) => sum + Number(exp.shippingCost),
    0
  );
  const totalPaymentReceived = expenses.reduce(
    (sum, exp) => sum + Number(exp.paymentReceived),
    0
  );
  const grandTotal = totalProductCost + totalShippingCost;
  const balanceOwed = grandTotal - totalPaymentReceived;

  const handleDelete = () => {
    if (deleteId && onDelete) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">No expenses yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Start tracking your shipping fulfillment expenses by adding your first entry
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">Qty</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Product+Markup</TableHead>
                <TableHead className="font-semibold text-right">Shipping</TableHead>
                <TableHead className="font-semibold text-right">Total</TableHead>
                <TableHead className="font-semibold text-right">Paid</TableHead>
                <TableHead className="font-semibold text-right">Balance</TableHead>
                {showActions && <TableHead className="font-semibold text-right w-[80px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow 
                  key={expense.id} 
                  className="hover-elevate"
                  data-testid={`row-expense-${expense.id}`}
                >
                  <TableCell className="font-medium">
                    {format(new Date(expense.date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="font-medium" data-testid={`text-client-${expense.id}`}>
                    {expense.client}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="line-clamp-2">{expense.productDescription}</div>
                  </TableCell>
                  <TableCell className="font-medium">{expense.quantity}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      expense.status === "Shipped" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100",
                      expense.status === "Cancelled" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100",
                      expense.status === "Refund" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100",
                      expense.status === "Pending" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100",
                      expense.status === "Processing" && "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100",
                    )}>
                      {expense.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    €{(Number(expense.productCost) * (1 + Number(expense.markupPercentage) / 100)).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    €{Number(expense.shippingCost).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    €{(Number(expense.productCost) * (1 + Number(expense.markupPercentage) / 100) + Number(expense.shippingCost)).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-green-600 dark:text-green-400">
                    €{Number(expense.paymentReceived).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-red-600 dark:text-red-400">
                    €{((Number(expense.productCost) * (1 + Number(expense.markupPercentage) / 100) + Number(expense.shippingCost)) - Number(expense.paymentReceived)).toFixed(2)}
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            data-testid={`button-edit-${expense.id}`}
                            onClick={() => onEdit(expense)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          data-testid={`button-delete-${expense.id}`}
                          onClick={() => setDeleteId(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-muted/50">
                <TableCell colSpan={5} className="font-semibold">Totals</TableCell>
                <TableCell className="text-right tabular-nums font-semibold" data-testid="text-total-product-cost">
                  €{totalProductCost.toFixed(2)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-semibold" data-testid="text-total-shipping-cost">
                  €{totalShippingCost.toFixed(2)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-semibold text-lg" data-testid="text-grand-total">
                  €{grandTotal.toFixed(2)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-semibold text-green-600 dark:text-green-400">
                  €{totalPaymentReceived.toFixed(2)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-semibold text-lg text-red-600 dark:text-red-400" data-testid="text-balance-owed">
                  €{balanceOwed.toFixed(2)}
                </TableCell>
                {showActions && <TableCell />}
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} data-testid="button-confirm-delete">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
