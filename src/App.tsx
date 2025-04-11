import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect } from "react";

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

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDB();
        console.log("Database initialized successfully");
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
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<AppLayout />}>
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
