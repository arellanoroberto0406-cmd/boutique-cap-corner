import { useState } from "react";
import { Heart } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo con Menú de Marcas */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 hover-lift cursor-pointer">
                <img src={logo} alt="Proveedor Boutique" className="h-28 w-auto scale-125 logo-glow" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[400px] p-4 bg-card/95 backdrop-blur-sm">
              <h3 className="text-lg font-bold mb-3 text-center text-foreground">Nuestras Marcas</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="aspect-square bg-background rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-border">
                  <img src={brandBassPro} alt="Bass Pro Shops" className="w-full h-full object-contain" />
                </div>
                <div className="aspect-square bg-background rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-border">
                  <img src={brandJC} alt="JC Solo los Mejores" className="w-full h-full object-contain" />
                </div>
                <div className="aspect-square bg-background rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-border">
                  <img src={brandRanchCorral} alt="Ranch & Corral" className="w-full h-full object-contain" />
                </div>
                <div className="aspect-square bg-background rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-border">
                  <img src={brandIcon} alt="Marca Especial" className="w-full h-full object-contain" />
                </div>
                <div className="aspect-square bg-background rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-border">
                  <img src={brandFino} alt="Fino" className="w-full h-full object-contain" />
                </div>
                <div className="aspect-square bg-background rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-border">
                  <img src={brand31} alt="31" className="w-full h-full object-contain" />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

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
    </header>
  );
};

export default Header;
