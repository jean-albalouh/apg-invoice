import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Expenses from "@/pages/expenses";
import Payments from "@/pages/payments";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Receipt, CreditCard, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/expenses" component={Expenses} />
      <ProtectedRoute path="/payments" component={Payments} />
      <ProtectedRoute path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Navigation() {
  const [location] = useLocation();

  const getActiveTab = () => {
    if (location === "/expenses") return "expenses";
    if (location === "/payments") return "payments";
    if (location === "/reports") return "reports";
    return "dashboard";
  };

  return (
    <Tabs value={getActiveTab()} className="w-auto">
      <TabsList className="grid w-full grid-cols-4 lg:w-auto">
        <Link href="/">
          <TabsTrigger value="dashboard" className="gap-2" data-testid="nav-dashboard">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
        </Link>
        <Link href="/expenses">
          <TabsTrigger value="expenses" className="gap-2" data-testid="nav-expenses">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Expenses</span>
          </TabsTrigger>
        </Link>
        <Link href="/payments">
          <TabsTrigger value="payments" className="gap-2" data-testid="nav-payments">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
        </Link>
        <Link href="/reports">
          <TabsTrigger value="reports" className="gap-2" data-testid="nav-reports">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
        </Link>
      </TabsList>
    </Tabs>
  );
}

function AppHeader() {
  const { user, logoutMutation } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-xl font-semibold">Expense Tracker</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Shipping Fulfillment
              </p>
            </div>
            {user && <Navigation />}
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-logout"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <AppHeader />
              <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Router />
              </main>
            </div>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
