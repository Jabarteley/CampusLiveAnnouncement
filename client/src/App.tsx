import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Noticeboard from "@/pages/noticeboard";
import AdminDashboard from "@/pages/admin-dashboard";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/board" component={Noticeboard} />
      <Route path="/login" component={LoginPage} />

      {/* Protected admin route */}
      {!isLoading && isAuthenticated && (
        <Route path="/admin" component={AdminDashboard} />
      )}

      {/* Home redirects based on auth status */}
      <Route path="/home" component={Home} />

      {/* Redirect to login if trying to access admin but not authenticated */}
      {!isLoading && !isAuthenticated && <Route path="/admin" component={LoginPage} />}

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
