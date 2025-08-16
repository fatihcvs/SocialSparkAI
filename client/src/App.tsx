import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

// Pages (optimized lazy loading)
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/not-found";
import {
  LazyDashboard,
  LazyCalendar,
  LazyPosts,
  LazyAIContent,
  LazyImageGeneration,
  LazyZapierIntegration,
  LazySocialPublishing,
  LazyBilling,
  LazySettings,
  LazyAdmin
} from "@/components/LazyComponents";

// Layout components
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/auth" component={Auth} />
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="pl-64">
        <TopBar />
        <main className="px-6 py-6">
          <Switch>
            <Route path="/" component={LazyDashboard} />
            <Route path="/calendar" component={LazyCalendar} />
            <Route path="/posts" component={LazyPosts} />
            <Route path="/ai-content" component={LazyAIContent} />
            <Route path="/image-generation" component={LazyImageGeneration} />
            <Route path="/zapier-integration" component={LazyZapierIntegration} />
            <Route path="/social-publishing" component={LazySocialPublishing} />
            <Route path="/billing" component={LazyBilling} />
            <Route path="/settings" component={LazySettings} />
            <Route path="/admin" component={LazyAdmin} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
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