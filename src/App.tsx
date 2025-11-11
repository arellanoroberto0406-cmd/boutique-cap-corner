import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
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
import DandyHats from "./pages/DandyHats";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { MenuProvider } from "@/context/MenuContext";

const queryClient = new QueryClient();


const App = () => {
  useEffect(() => {
    const cleanupBgAudio = () => {
      const bgEls = Array.from(document.querySelectorAll('[data-background-music]')) as HTMLMediaElement[];
      bgEls.forEach(el => { try { el.pause(); el.currentTime = 0; } catch {} el.remove(); });

      document.querySelectorAll('audio').forEach((el) => {
        const src = (el as HTMLAudioElement).src || '';
        if (src.includes('background-music')) {
          try { el.pause(); (el as HTMLAudioElement).currentTime = 0; } catch {}
          el.remove();
        }
      });

      const w = window as any;
      if (w.__bgMusicEl) { try { w.__bgMusicEl.pause(); w.__bgMusicEl.currentTime = 0; } catch {} w.__bgMusicEl = undefined; }
    };

    cleanupBgAudio();
    setTimeout(cleanupBgAudio, 0);
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MenuProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
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
                <Route path="/dandy-hats" element={<DandyHats />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </MenuProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
