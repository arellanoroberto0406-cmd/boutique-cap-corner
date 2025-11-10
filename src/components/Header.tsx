import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartSheet } from "./CartSheet";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { SearchBar } from "./SearchBar";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-proveedor.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
          {/* Logo con Menú */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 hover-lift cursor-pointer">
                <img src={logo} alt="Proveedor Boutique" className="h-28 w-auto scale-125 logo-glow" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/")}>
                Inicio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                navigate("/");
                setTimeout(() => {
                  document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}>
                Colecciones
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                navigate("/");
                setTimeout(() => {
                  document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}>
                Ofertas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                navigate("/");
                setTimeout(() => {
                  document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}>
                Contacto
              </DropdownMenuItem>
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
