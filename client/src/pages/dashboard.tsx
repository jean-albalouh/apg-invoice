import { useQuery } from "@tanstack/react-query";
import { type Expense } from "@shared/schema";
import { StatsCard } from "@/components/stats-card";
import { ExpenseTable } from "@/components/expense-table";
import { Package, Truck, DollarSign } from "lucide-react";
import { startOfMonth, endOfMonth } from "date-fns";

export default function Dashboard() {
  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const currentMonthExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate >= monthStart && expDate <= monthEnd;
  });

  const totalProductCost = currentMonthExpenses.reduce(
    (sum, exp) => sum + Number(exp.productCost) * (1 + Number(exp.markupPercentage) / 100),
    0
  );
  const totalShippingCost = currentMonthExpenses.reduce(
    (sum, exp) => sum + Number(exp.shippingCost),
    0
  );
  const totalExpenses = totalProductCost + totalShippingCost;

  const recentExpenses = [...currentMonthExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-md animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-muted/50 rounded-md animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Current Month Overview</h2>
        <p className="text-muted-foreground">
          {monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Product Costs"
          value={`€${totalProductCost.toFixed(2)}`}
          icon={Package}
          trend={`${currentMonthExpenses.length} orders this month`}
          testId="stat-product-cost"
        />
        <StatsCard
          title="Shipping Costs"
          value={`€${totalShippingCost.toFixed(2)}`}
          icon={Truck}
          trend={`${currentMonthExpenses.length} parcels shipped`}
          testId="stat-shipping-cost"
        />
        <StatsCard
          title="Total Expenses"
          value={`€${totalExpenses.toFixed(2)}`}
          icon={DollarSign}
          trend="Amount owed by client"
          testId="stat-total-expenses"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Recent Expenses</h3>
        <ExpenseTable expenses={recentExpenses} showActions={false} />
      </div>
    </div>
  );
}
