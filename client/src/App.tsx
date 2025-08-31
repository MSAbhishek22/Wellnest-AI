import { useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";

import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Agents from "@/pages/agents";
import Insights from "@/pages/insights";
import Journal from "@/pages/journal";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import MobileHeader from "@/components/mobile-header";
import MobileNavigation from "@/components/mobile-navigation";

function Router() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem("wellnest_user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          localStorage.removeItem("wellnest_user");
          setUser(null);
          setLocation("/auth");
        }
      } else {
        setUser(null);
        if (location !== "/auth") {
          setLocation("/auth");
        }
      }
      setLoading(false);
    };

    // Check auth on mount and location change
    checkAuth();

    // Listen for storage changes (when user logs out from another tab or component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "wellnest_user") {
        if (e.newValue === null) {
          // User logged out
          setUser(null);
          setLocation("/auth");
        } else if (e.newValue) {
          // User logged in
          try {
            setUser(JSON.parse(e.newValue));
          } catch (error) {
            localStorage.removeItem("wellnest_user");
            setUser(null);
            setLocation("/auth");
          }
        }
      }
    };

    // Listen for custom logout event
    const handleLogout = () => {
      setUser(null);
      setLocation("/auth");
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("wellnest-logout", handleLogout);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("wellnest-logout", handleLogout);
    };
  }, [location, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-white text-2xl font-bold">W</span>
          </div>
          <p className="text-gray-600">Loading WellNest.AI...</p>
        </div>
      </div>
    );
  }

  if (!user && location !== "/auth") {
    return <Auth />;
  }

  if (location === "/auth" && user) {
    setLocation("/dashboard");
    return null;
  }

  const showNavigation = user && location !== "/auth" && location !== "/settings" && location !== "/profile";

  return (
    <div className="min-h-screen wellness-gradient">
      {showNavigation && <MobileHeader userName={user?.username} />}
      
      <main className={showNavigation ? "pb-20" : ""}>
        <Switch>
          <Route path="/auth" component={Auth} />
          <Route path="/" component={() => user ? <Dashboard /> : <Auth />} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/agents" component={Agents} />
          <Route path="/insights" component={Insights} />
          <Route path="/journal" component={Journal} />
          <Route path="/profile" component={Profile} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {showNavigation && <MobileNavigation />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
