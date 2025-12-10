import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { MenuProvider } from "@/context/MenuContext";
import ThemeProvider from "@/components/ThemeProvider";
import DynamicFavicon from "@/components/DynamicFavicon";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const BarbaHats = lazy(() => import("./pages/BarbaHats"));
const BoutiqueVariedad = lazy(() => import("./pages/BoutiqueVariedad"));
const DespachoContable = lazy(() => import("./pages/DespachoContable"));
const EstucheDeGorra = lazy(() => import("./pages/EstucheDeGorra"));
const GalloFino = lazy(() => import("./pages/GalloFino"));
const JcHats = lazy(() => import("./pages/JcHats"));
const Pines = lazy(() => import("./pages/Pines"));
const Viyaxi = lazy(() => import("./pages/Viyaxi"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const RanchCorral = lazy(() => import("./pages/RanchCorral"));
const BassProShops = lazy(() => import("./pages/BassProShops"));
const Marca31 = lazy(() => import("./pages/Marca31"));
const DandyHats = lazy(() => import("./pages/DandyHats"));
const Checkout = lazy(() => import("./pages/Checkout"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const DynamicBrandPage = lazy(() => import("./pages/DynamicBrandPage"));
const LoNuevo = lazy(() => import("./pages/LoNuevo"));
const Legal = lazy(() => import("./pages/Legal"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

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
              <ThemeProvider>
                <DynamicFavicon />
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Suspense fallback={<LoadingFallback />}>
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
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/rastrear-pedido" element={<TrackOrder />} />
                      <Route path="/lo-nuevo" element={<LoNuevo />} />
                      <Route path="/legal" element={<Legal />} />
                      <Route path="/:brandSlug" element={<DynamicBrandPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </ThemeProvider>
            </WishlistProvider>
          </CartProvider>
        </MenuProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;