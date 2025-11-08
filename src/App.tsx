import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Pines from "./pages/Pines";
import EstucheDeGorra from "./pages/EstucheDeGorra";
import JcHats from "./pages/JcHats";
import GalloFino from "./pages/GalloFino";
import BarbaHats from "./pages/BarbaHats";
import BoutiqueVariedad from "./pages/BoutiqueVariedad";
import DespachoContable from "./pages/DespachoContable";
import Viyaxi from "./pages/Viyaxi";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pines" element={<Pines />} />
          <Route path="/estuche-de-gorra" element={<EstucheDeGorra />} />
          <Route path="/jc-hats" element={<JcHats />} />
          <Route path="/gallo-fino" element={<GalloFino />} />
          <Route path="/barba-hats" element={<BarbaHats />} />
          <Route path="/boutique-variedad" element={<BoutiqueVariedad />} />
          <Route path="/despacho-contable" element={<DespachoContable />} />
          <Route path="/viyaxi" element={<Viyaxi />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
