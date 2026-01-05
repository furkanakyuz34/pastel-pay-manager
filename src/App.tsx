import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import Login from "./pages/Login";
import Index from "./pages/Index";
import SubscriptionsPage from "./pages/Subscriptions";
import PaymentsPage from "./pages/Payments";
import CustomersPage from "./pages/Customers";
import PlansPage from "./pages/Plans";
import ProjectsPage from "./pages/Projects";
import ProductsPage from "./pages/Products";
import SettingsPage from "./pages/Settings";
import InvoicesPage from "./pages/Invoices";
import UsagePage from "./pages/Usage";
import BillingHistoryPage from "./pages/BillingHistory";
import DiscountsPage from "./pages/Discounts";
import FirmalarPage from "./pages/Firmalar";
import ProjelerPage from "./pages/Projeler";
import ProjeModullerPage from "./pages/ProjeModuller";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute>
                  <SubscriptionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <CustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/plans"
              element={
                <ProtectedRoute>
                  <PlansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <InvoicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usage"
              element={
                <ProtectedRoute>
                  <UsagePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing-history"
              element={
                <ProtectedRoute>
                  <BillingHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discounts"
              element={
                <ProtectedRoute>
                  <DiscountsPage />
                </ProtectedRoute>
              }
            />
            {/* Backend API Entegreli Sayfalar */}
            <Route
              path="/firmalar"
              element={
                <ProtectedRoute>
                  <FirmalarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projeler"
              element={
                <ProtectedRoute>
                  <ProjelerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proje-moduller"
              element={
                <ProtectedRoute>
                  <ProjeModullerPage />
                </ProtectedRoute>
              }
            />
            
            {/* Redirect root to login if not authenticated */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
