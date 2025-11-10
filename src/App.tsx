import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BarbaHats from "./pages/BarbaHats";
import BoutiqueVariedad from "./pages/BoutiqueVariedad";
import DespachoContable from "./pages/DespachoContable";
import EstucheDeGorra from "./pages/EstucheDeGorra";
import GalloFino from "./pages/GalloFino";
import JcHats from "./pages/JcHats";
import Pines from "./pages/Pines";
import Viyaxi from "./pages/Viyaxi";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import RanchCorral from "./pages/RanchCorral";
import BassProShops from "./pages/BassProShops";
import Marca31 from "./pages/Marca31";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import BackgroundMusic from "@/components/BackgroundMusic";

const queryClient = new QueryClient();


const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <WishlistProvider>
            <BackgroundMusic />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/favoritos" element={<Wishlist />} />
                <Route path="/barba-hats" element={<BarbaHats />} />
                <Route path="/boutique-variedad" element={<BoutiqueVariedad />} />
                <Route path="/despacho-contable" element={<DespachoContable />} />
                <Route path="/estuche-de-gorra" element={<EstucheDeGorra />} />
                <Route path="/gallo-fino" element={<GalloFino />} />
                <Route path="/jc-hats" element={<JcHats />} />
                <Route path="/pines" element={<Pines />} />
                <Route path="/viyaxi" element={<Viyaxi />} />
                <Route path="/ranch-corral" element={<RanchCorral />} />
                <Route path="/bass-pro-shops" element={<BassProShops />} />
                <Route path="/marca-31" element={<Marca31 />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
