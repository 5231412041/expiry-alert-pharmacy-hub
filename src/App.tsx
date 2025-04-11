
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";

// Layout
import AppLayout from "./components/layout/AppLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Home
import Home from "./pages/home/Home";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

// Medicine Pages
import Medicines from "./pages/medicines/Medicines";
import ExpiringSoon from "./pages/medicines/ExpiringSoon";
import SafeMedicines from "./pages/medicines/SafeMedicines";
import CSVUpload from "./pages/medicines/CSVUpload";
import Notifications from "./pages/notifications/Notifications";

// Inventory Pages
import Inventory from "./pages/inventory/Inventory";

// Other Pages
import NotFound from "./pages/NotFound";

// Initialize DB when app starts
import { initDB } from "./services/db";
import { dbConfig } from "./config";

const queryClient = new QueryClient();

const App = () => {
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDB();
        console.log("Database configuration loaded successfully");
        
        // Check if the API server is running
        try {
          await axios.get("http://localhost:5000/api/health", { timeout: 3000 });
          setApiConnected(true);
          console.log("Connected to API server successfully");
        } catch (error) {
          setApiConnected(false);
          console.error("Could not connect to API server:", error);
          
          toast({
            variant: "destructive",
            title: "API Connection Failed",
            description: `Could not connect to API server at http://localhost:5000. Make sure your backend server is running and the PostgreSQL database is configured with the credentials in src/config.ts.`,
            duration: 10000
          });
        }
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
    };

    initializeDB();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {apiConnected === false && (
            <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
              API server not connected. Please start your backend API server and ensure PostgreSQL is running with credentials: 
              {dbConfig.host}:{dbConfig.port}/{dbConfig.database}
            </div>
          )}
          <BrowserRouter>
            <Routes>
              {/* Public Home Page as default */}
              <Route path="/" element={<Home />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="home" element={<Home />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="medicines" element={<Medicines />} />
                <Route path="expiring-soon" element={<ExpiringSoon />} />
                <Route path="safe-medicines" element={<SafeMedicines />} />
                <Route path="csv-upload" element={<CSVUpload />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="inventory" element={<Inventory />} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
