import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Heart, Search, X, Download } from "lucide-react";
import { CartSheet } from "./CartSheet";
import { SearchBar } from "./SearchBar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useWishlist } from "@/context/WishlistContext";
import { useBrands } from "@/hooks/useBrands";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import defaultLogo from "@/assets/logo-proveedor.png";
import { getMenuCategories, MenuCategory } from "@/data/menuCategoriesStore";

// Preload logo immediately
const preloadLogo = (src: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
};

preloadLogo(defaultLogo);

const Header = () => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { wishlist } = useWishlist();
  const { brands } = useBrands();
  const { settings } = useSiteSettings();
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);

  const logo = settings.company_logo || defaultLogo;

  useEffect(() => {
    if (settings.company_logo) {
      preloadLogo(settings.company_logo);
    }
  }, [settings.company_logo]);

  useEffect(() => {
    setMenuCategories(getMenuCategories().filter(c => c.isActive));
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleBrandClick = (brandPath: string) => {
    navigate(brandPath);
    closeMenu();
  };

  const handleCategoryClick = (path: string) => {
    navigate(path);
    closeMenu();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button 
                className="p-2 sm:p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-105 active:scale-95"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Logo */}
                <div className="flex justify-center pb-4 border-b border-border/50">
                  <img 
                    src={logo} 
                    alt="Proveedor Boutique" 
                    className="h-20 max-w-[150px] w-auto object-contain cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => {
                      navigate('/');
                      closeMenu();
                    }}
                  />
                </div>

                {/* Marcas */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Marcas
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {brands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => handleBrandClick(brand.path)}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <img 
                          src={brand.logo_url} 
                          alt={brand.name}
                          className="w-8 h-8 object-contain rounded"
                        />
                        <span className="text-sm font-medium text-foreground truncate">
                          {brand.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categorías */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Categorías
                  </h3>
                  <div className="space-y-1">
                    {menuCategories.map((category) => (
                      <div key={category.id}>
                        <span className="text-xs font-medium text-muted-foreground px-3 py-1">
                          {category.title}
                        </span>
                        {category.items.map((item) => (
                          <button
                            key={item.path}
                            onClick={() => handleCategoryClick(item.path)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Descargar App */}
                <Link
                  to="/instalar"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>Descargar App</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <img 
              src={logo} 
              alt="Proveedor Boutique" 
              className="h-12 sm:h-14 max-w-[100px] sm:max-w-[130px] w-auto object-contain rounded-xl transition-transform duration-300 group-hover:scale-105" 
              fetchPriority="high"
            />
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              aria-label="Buscar"
            >
              <Search className="h-5 w-5 text-foreground" />
            </button>

            <Link 
              to="/wishlist" 
              className="relative p-2 rounded-xl hover:bg-muted transition-colors"
              aria-label="Lista de deseos"
            >
              <Heart className="h-5 w-5 text-foreground" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <CartSheet />
          </div>
        </div>

        {showMobileSearch && (
          <div className="md:hidden pt-3 pb-1 animate-in slide-in-from-top-2 duration-200">
            <SearchBar />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;