import { useState } from "react";
import { Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartSheet } from "./CartSheet";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { SearchBar } from "./SearchBar";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-proveedor.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 hover-lift cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="Proveedor Boutique" className="h-16 w-auto" />
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

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="py-4 border-t animate-fade-in space-y-4">
            {/* Search Bar - Mobile */}
            <div className="lg:hidden">
              <SearchBar />
            </div>

            <nav className="flex flex-col gap-3">
              <a href="#productos" className="text-lg hover:text-primary transition-colors">
                Colecciones
              </a>
              <a href="#productos" className="text-lg hover:text-primary transition-colors">
                Ofertas
              </a>
              <a href="#contacto" className="text-lg hover:text-primary transition-colors">
                Contacto
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
