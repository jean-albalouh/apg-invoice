import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseSchema, type InsertExpense } from "@shared/schema";
import { Button } from "@/components/ui/button";
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertExpense) => Promise<void>;
}

export function AddExpenseDialog({ open, onOpenChange, onSubmit }: AddExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCustomPaidBy, setShowCustomPaidBy] = useState(false);

  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      date: new Date(),
      productDescription: "",
      productCost: undefined as any,
      parcelCost: undefined as any,
      paidBy: "",
    },
  });

  const handleSubmit = async (data: InsertExpense) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      form.reset({
        date: new Date(),
        productDescription: "",
        productCost: undefined as any,
        parcelCost: undefined as any,
        paidBy: "",
      });
      setShowCustomPaidBy(false);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const productCost = form.watch("productCost") || 0;
  const parcelCost = form.watch("parcelCost") || 0;
  const total = Number(productCost) + Number(parcelCost);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Expense</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm font-medium">Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          data-testid="button-date-picker"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date);
                          }
                        }}
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
              name="productDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Product Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the product(s) purchased..."
                      className="resize-none min-h-[80px]"
                      data-testid="input-product-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Product Cost</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          className="pl-7 tabular-nums"
                          data-testid="input-product-cost"
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
                name="parcelCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Parcel/Shipping Cost</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          className="pl-7 tabular-nums"
                          data-testid="input-parcel-cost"
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
            </div>

            <FormField
              control={form.control}
              name="paidBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Paid By</FormLabel>
                  <FormControl>
                    {showCustomPaidBy ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter company name..."
                          data-testid="input-custom-paid-by"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowCustomPaidBy(false);
                            field.onChange("");
                          }}
                          data-testid="button-cancel-custom"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            setShowCustomPaidBy(true);
                            field.onChange("");
                          } else {
                            field.onChange(value);
                          }
                        }}
                      >
                        <SelectTrigger data-testid="select-paid-by">
                          <SelectValue placeholder="Select who paid" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A TA PORTE" data-testid="option-a-ta-porte">A TA PORTE</SelectItem>
                          <SelectItem value="BEST DEAT" data-testid="option-best-deat">BEST DEAT</SelectItem>
                          <SelectItem value="custom" data-testid="option-custom">Other (Custom)...</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 rounded-md p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                <span className="text-2xl font-semibold tabular-nums" data-testid="text-total-amount">
                  €{total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="button-save-expense">
                {isSubmitting ? "Saving..." : "Save Expense"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
