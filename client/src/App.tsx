import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { getAuthToken } from "@/lib/authUtils";

// Pages
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Calendar from "@/pages/Calendar";
import Posts from "@/pages/Posts";
import AIContent from "@/pages/AIContent";
import ImageGeneration from "@/pages/ImageGeneration";
import BufferIntegration from "@/pages/BufferIntegration";
import SocialPublishing from "@/pages/SocialPublishing";
import Billing from "@/pages/Billing";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/not-found";

// Layout components
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Set up auth token interceptor
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Add token to all API requests
      const originalFetch = window.fetch;
      window.fetch = function(input, init = {}) {
        const headers = new Headers(init.headers || {});
        headers.set('Authorization', `Bearer ${token}`);
        
        return originalFetch(input, {
          ...init,
          headers,
        });
      };
    }
  }, []);

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
            <Route path="/" component={Dashboard} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/posts" component={Posts} />
            <Route path="/ai-content" component={AIContent} />
            <Route path="/image-generation" component={ImageGeneration} />
            <Route path="/buffer-integration" component={BufferIntegration} />
            <Route path="/social-publishing" component={SocialPublishing} />
            <Route path="/billing" component={Billing} />
            <Route path="/settings" component={Settings} />
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
