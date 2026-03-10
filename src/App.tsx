import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import CustomersPage from "@/pages/CustomersPage";
import ProductsPage from "@/pages/ProductsPage";
import CreateInvoicePage from "@/pages/CreateInvoicePage";
import InvoiceListPage from "@/pages/InvoiceListPage";
import InvoiceDetailPage from "@/pages/InvoiceDetailPage";
import EditInvoicePage from "@/pages/EditInvoicePage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const App = () => (
  <AuthProvider>
    <DataProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
            <Route path="/customers" element={<AppLayout><CustomersPage /></AppLayout>} />
            <Route path="/products" element={<AppLayout><ProductsPage /></AppLayout>} />
            <Route path="/invoices/create" element={<AppLayout><CreateInvoicePage /></AppLayout>} />
            <Route path="/invoices/:id/edit" element={<AppLayout><EditInvoicePage /></AppLayout>} />
            <Route path="/invoices/:id" element={<AppLayout><InvoiceDetailPage /></AppLayout>} />
            <Route path="/invoices" element={<AppLayout><InvoiceListPage /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </DataProvider>
  </AuthProvider>
);

export default App;
