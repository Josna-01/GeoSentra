import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Suppliers from "./pages/Suppliers";
import SatelliteMonitoring from "./pages/SatelliteMonitoring";
import SocialListener from "./pages/SocialListener";
import ShippingRoutes from "./pages/ShippingRoutes";
import CostPrediction from "./pages/CostPrediction";
import ERPIntegration from "./pages/ERPIntegration";
import RFQManagement from "./pages/RFQManagement";
import AppLayout from "./layouts/AppLayout";
import NotFound from "./pages/NotFound";
import { RiskProvider } from "@/context/RiskProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RiskProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="events" element={<Events />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="satellite" element={<SatelliteMonitoring />} />
              <Route path="social" element={<SocialListener />} />
              <Route path="shipping" element={<ShippingRoutes />} />
              <Route path="prediction" element={<CostPrediction />} />
              <Route path="erp" element={<ERPIntegration />} />
              <Route path="rfq" element={<RFQManagement />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </RiskProvider>
  </QueryClientProvider>
);

export default App;
