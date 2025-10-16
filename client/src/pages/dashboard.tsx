import { useQuery } from "@tanstack/react-query";
import { type Expense } from "@shared/schema";
import { StatsCard } from "@/components/stats-card";
import { ExpenseTable } from "@/components/expense-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, DollarSign, Users } from "lucide-react";
import { startOfMonth, endOfMonth } from "date-fns";

const CLIENTS = [
  "A TA PORTE",
  "BEST DEAL",
  "LE PHÉNICIEN",
  "LE GRAND MARCHÉ DE FRANCE",
] as const;

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
  const totalPaymentReceived = currentMonthExpenses.reduce(
    (sum, exp) => sum + Number(exp.paymentReceived),
    0
  );
  const totalExpenses = totalProductCost + totalShippingCost;
  const totalBalanceOwed = totalExpenses - totalPaymentReceived;

  const recentExpenses = [...currentMonthExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate balances by client
  const clientBalances = CLIENTS.map(client => {
    const clientExpenses = currentMonthExpenses.filter(exp => exp.client === client);
    const total = clientExpenses.reduce((sum, exp) => {
      const productWithMarkup = Number(exp.productCost) * (1 + Number(exp.markupPercentage) / 100);
      return sum + productWithMarkup + Number(exp.shippingCost);
    }, 0);
    const paid = clientExpenses.reduce((sum, exp) => sum + Number(exp.paymentReceived), 0);
    const balance = total - paid;
    return {
      client,
      total,
      paid,
      balance,
      count: clientExpenses.length,
    };
  }).filter(cb => cb.count > 0); // Only show clients with expenses this month

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
          trend="Amount billed to clients"
          testId="stat-total-expenses"
        />
        <StatsCard
          title="Balance Owed"
          value={`€${totalBalanceOwed.toFixed(2)}`}
          icon={Users}
          trend={`${totalPaymentReceived > 0 ? `€${totalPaymentReceived.toFixed(2)} received` : 'No payments yet'}`}
          testId="stat-balance-owed"
        />
      </div>

      {clientBalances.length > 0 && (
        <>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">A TA PORTE Financial Overview</h3>
              <p className="text-sm text-muted-foreground mt-1">Track amounts paid to and received from each company</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {clientBalances.map((cb) => (
                <Card key={cb.client} className="hover-elevate">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {cb.client}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Paid Out (A TA PORTE)</p>
                      <p className="text-lg font-semibold tabular-nums text-red-600 dark:text-red-400">
                        €{cb.total.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Received From Company</p>
                      <p className="text-lg font-semibold tabular-nums text-green-600 dark:text-green-400">
                        €{cb.paid.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1 pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="text-xl font-bold tabular-nums" data-testid={`text-ata-balance-${cb.client.toLowerCase().replace(/\s+/g, '-')}`}>
                        €{cb.balance.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">{cb.count} orders</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Client Payment Status</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {clientBalances.map((cb) => (
                <Card key={cb.client} className="hover-elevate">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {cb.client}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-2xl font-bold tabular-nums" data-testid={`text-client-balance-${cb.client.toLowerCase().replace(/\s+/g, '-')}`}>
                      €{cb.balance.toFixed(2)}
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="tabular-nums">€{cb.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Paid:</span>
                        <span className="tabular-nums text-green-600 dark:text-green-400">€{cb.paid.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Orders:</span>
                        <span>{cb.count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Recent Expenses</h3>
        <ExpenseTable expenses={recentExpenses} showActions={false} />
      </div>
    </div>
  );
}
