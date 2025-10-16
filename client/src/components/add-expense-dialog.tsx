import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseSchema, type InsertExpense, type Expense } from "@shared/schema";
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
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertExpense, id?: string) => Promise<void>;
  editExpense?: Expense | null;
}

const CLIENTS = [
  "A TA PORTE",
  "BEST DEAL",
  "LE PHÉNICIEN",
  "LE GRAND MARCHÉ DE FRANCE",
] as const;

const STATUS_OPTIONS = [
  "Shipped",
  "Cancelled",
  "Refund",
  "Pending",
  "Processing",
] as const;

export function AddExpenseDialog({ open, onOpenChange, onSubmit, editExpense }: AddExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomCarrier, setShowCustomCarrier] = useState(false);
  const [showCustomStatus, setShowCustomStatus] = useState(false);

  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      date: new Date(),
      client: "",
      productDescription: "",
      quantity: "1",
      productCost: undefined as any,
      markupPercentage: 5,
      shippingCost: undefined as any,
      shippingCarrier: "Colissimo",
      status: "Shipped",
      paymentReceived: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (editExpense && open) {
      const isCustomCarrier = !["Colissimo"].includes(editExpense.shippingCarrier);
      const isCustomStatus = !STATUS_OPTIONS.includes(editExpense.status as any);
      
      setShowCustomCarrier(isCustomCarrier);
      setShowCustomStatus(isCustomStatus);
      
      form.reset({
        date: new Date(editExpense.date),
        client: editExpense.client,
        productDescription: editExpense.productDescription,
        quantity: editExpense.quantity,
        productCost: Number(editExpense.productCost),
        markupPercentage: Number(editExpense.markupPercentage),
        shippingCost: Number(editExpense.shippingCost),
        shippingCarrier: editExpense.shippingCarrier,
        status: editExpense.status,
        paymentReceived: Number(editExpense.paymentReceived),
        notes: editExpense.notes || "",
      });
    } else if (!editExpense && open) {
      setShowCustomCarrier(false);
      setShowCustomStatus(false);
      form.reset({
        date: new Date(),
        client: "",
        productDescription: "",
        quantity: "1",
        productCost: undefined as any,
        markupPercentage: 5,
        shippingCost: undefined as any,
        shippingCarrier: "Colissimo",
        status: "Shipped",
        paymentReceived: 0,
        notes: "",
      });
    }
  }, [editExpense, open, form]);

  const selectedClient = form.watch("client");
  const productCost = form.watch("productCost") || 0;
  const markupPercentage = form.watch("markupPercentage") || 0;
  const shippingCost = form.watch("shippingCost") || 0;

  // Auto-set shipping cost based on client (only for new expenses, not edits)
  useEffect(() => {
    if (selectedClient === "BEST DEAL" && !editExpense) {
      const currentShippingCost = form.getValues("shippingCost");
      // Only set if field is empty/undefined (new expense)
      if (currentShippingCost === undefined || currentShippingCost === null || currentShippingCost === 0 || Number.isNaN(currentShippingCost)) {
        form.setValue("shippingCost", 3.15);
      }
    }
  }, [selectedClient, form, editExpense]);

  const productCostWithMarkup = Number(productCost) * (1 + Number(markupPercentage) / 100);
  const total = productCostWithMarkup + Number(shippingCost);

  const handleSubmit = async (data: InsertExpense) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data, editExpense?.id);
      form.reset({
        date: new Date(),
        client: "",
        productDescription: "",
        quantity: "1",
        productCost: undefined as any,
        markupPercentage: 5,
        shippingCost: undefined as any,
        shippingCarrier: "Colissimo",
        status: "Shipped",
        paymentReceived: 0,
        notes: "",
      });
      setShowCustomCarrier(false);
      setShowCustomStatus(false);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editExpense ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Client</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-client">
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CLIENTS.map((client) => (
                            <SelectItem key={client} value={client} data-testid={`option-client-${client.toLowerCase().replace(/\s+/g, '-')}`}>
                              {client}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="productDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Product Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the product(s)..."
                        className="resize-none min-h-[60px]"
                        data-testid="input-product-description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Quantity</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1"
                          data-testid="input-quantity"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            min="0"
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
                  name="markupPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Markup %</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="5"
                            className="pr-7 tabular-nums"
                            data-testid="input-markup"
                            value={field.value || ""}
                            onChange={(e) => {
                              const val = e.target.valueAsNumber;
                              field.onChange(isNaN(val) ? 0 : val);
                            }}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shippingCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Shipping Cost</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="pl-7 tabular-nums"
                            data-testid="input-shipping-cost"
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
                  name="shippingCarrier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Shipping Carrier</FormLabel>
                      <FormControl>
                        {showCustomCarrier ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter carrier name..."
                              data-testid="input-custom-carrier"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowCustomCarrier(false);
                                field.onChange("Colissimo");
                              }}
                              data-testid="button-cancel-custom-carrier"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              if (value === "custom") {
                                setShowCustomCarrier(true);
                                field.onChange("");
                              } else {
                                field.onChange(value);
                              }
                            }}
                          >
                            <SelectTrigger data-testid="select-shipping-carrier">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Colissimo">Colissimo</SelectItem>
                              <SelectItem value="custom">Other (Custom)...</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Status</FormLabel>
                      <FormControl>
                        {showCustomStatus ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter custom status..."
                              data-testid="input-custom-status"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowCustomStatus(false);
                                field.onChange("Shipped");
                              }}
                              data-testid="button-cancel-custom-status"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              if (value === "custom") {
                                setShowCustomStatus(true);
                                field.onChange("");
                              } else {
                                field.onChange(value);
                              }
                            }}
                          >
                            <SelectTrigger data-testid="select-status">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status} value={status} data-testid={`option-status-${status.toLowerCase()}`}>
                                  {status}
                                </SelectItem>
                              ))}
                              <SelectItem value="custom">Other (Custom)...</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentReceived"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Payment Received</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="pl-7 tabular-nums"
                            data-testid="input-payment-received"
                            value={field.value || ""}
                            onChange={(e) => {
                              const val = e.target.valueAsNumber;
                              field.onChange(isNaN(val) ? 0 : val);
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes..."
                        className="resize-none min-h-[60px]"
                        data-testid="input-notes"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-muted/50 rounded-md p-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Product Cost</span>
                  <span className="font-medium tabular-nums">€{Number(productCost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Markup ({markupPercentage}%)</span>
                  <span className="font-medium tabular-nums">€{(Number(productCost) * Number(markupPercentage) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-2">
                  <span className="text-muted-foreground">Product + Markup</span>
                  <span className="font-semibold tabular-nums">€{productCostWithMarkup.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Shipping Cost</span>
                  <span className="font-medium tabular-nums">€{Number(shippingCost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Total Amount</span>
                  <span className="text-2xl font-semibold tabular-nums" data-testid="text-total-amount">
                    €{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
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
                  {isSubmitting ? "Saving..." : editExpense ? "Update Expense" : "Save Expense"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
