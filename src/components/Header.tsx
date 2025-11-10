import { useState } from "react";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartSheet } from "./CartSheet";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { SearchBar } from "./SearchBar";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-proveedor.png";
import brandBassPro from "@/assets/brand-bass-pro.jpg";
import brandJC from "@/assets/brand-jc.jpg";
import brandRanchCorral from "@/assets/brand-ranch-corral.jpg";
import brandIcon from "@/assets/brand-icon.jpg";
import brandFino from "@/assets/brand-fino.jpg";
import brand31 from "@/assets/brand-31.jpg";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Header = () => {
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 hover-lift cursor-pointer"
            onClick={() => setIsBrandsOpen(true)}
          >
            <img src={logo} alt="Proveedor Boutique" className="h-28 w-auto scale-125 logo-glow" />
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:scale-110 transition-transform"
              onClick={() => navigate("/favoritos")}
            >
              <Heart className="h-6 w-6" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Button>

            <CartSheet />
          </div>
        </div>
      </div>

      {/* Modal de Marcas Pantalla Completa */}
      <Dialog open={isBrandsOpen} onOpenChange={setIsBrandsOpen}>
        <DialogContent className="max-w-full h-full w-full p-0 bg-background border-0">
          <div className="relative h-full w-full overflow-y-auto">
            {/* Botón cerrar */}
            <button
              onClick={() => setIsBrandsOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Grid de Marcas */}
            <div className="container mx-auto px-4 py-8">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Nuestras Marcas</h2>
              <div className="grid grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
                <div className="aspect-square bg-card rounded-lg p-6 md:p-8 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-border">
                  <img src={brandBassPro} alt="Bass Pro Shops" className="w-full h-full object-contain" />
                </div>
                <div className="aspect-square bg-card rounded-lg p-6 md:p-8 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-border">
                  <img src={brandJC} alt="JC Solo los Mejores" className="w-full h-full object-contain" />
                </div>
                <div className="aspect-square bg-card rounded-lg p-6 md:p-8 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-border">
                  <img src={brandRanchCorral} alt="Ranch & Corral" className="w-full h-full object-contain" />
                </div>
                <div className="aspect-square bg-card rounded-lg p-6 md:p-8 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-border">
                  <img src={brandIcon} alt="Marca Especial" className="w-full h-full object-contain" />
                </div>
                <div className="aspect-square bg-card rounded-lg p-6 md:p-8 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-border">
                  <img src={brandFino} alt="Fino" className="w-full h-full object-contain" />
                </div>
                <div className="aspect-square bg-card rounded-lg p-6 md:p-8 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-border">
                  <img src={brand31} alt="31" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
