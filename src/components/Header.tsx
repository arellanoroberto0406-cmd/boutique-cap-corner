import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Heart, Search, X, Download, ChevronRight, Store } from "lucide-react";
import { CartSheet } from "./CartSheet";
import { SearchBar } from "./SearchBar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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

// Preload default logo on module load
preloadLogo(defaultLogo);

const Header = () => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isBrandsMenuOpen, setIsBrandsMenuOpen] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const navigate = useNavigate();
  const { wishlist } = useWishlist();
  const { brands } = useBrands();
  const { settings } = useSiteSettings();
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);

  const logo = settings.company_logo || defaultLogo;

  // Preload custom logo when settings change
  useEffect(() => {
    if (settings.company_logo) {
      preloadLogo(settings.company_logo);
    }
  }, [settings.company_logo]);

  useEffect(() => {
    setMenuCategories(getMenuCategories().filter(c => c.isActive));
  }, []);

  const closeBrandsMenu = () => setIsBrandsMenuOpen(false);

  const handleBrandClick = (brandPath: string) => {
    navigate(brandPath);
    closeBrandsMenu();
  };

  const handleCategoryClick = (categoryPath: string) => {
    navigate(categoryPath);
    closeBrandsMenu();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Menu Button */}
          <Dialog open={isBrandsMenuOpen} onOpenChange={setIsBrandsMenuOpen}>
            <DialogTrigger asChild>
              <button 
                className="p-2 sm:p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-105 active:scale-95"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-full w-full h-[100dvh] p-0 border-none bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
              <div className="h-full overflow-y-auto">
                {/* Header del menú */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/30 p-4 flex items-center justify-between">
                  <img 
                    src={logo} 
                    alt="Logo" 
                    className="h-10 w-auto object-contain cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => { navigate('/'); closeBrandsMenu(); }}
                  />
                  <button
                    onClick={closeBrandsMenu}
                    className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4 space-y-6">
                  {/* Marcas */}
                  <section>
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Store className="h-5 w-5 text-primary" />
                      Nuestras Marcas
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {brands.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => handleBrandClick(brand.path)}
                          className="group flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-primary/10 border border-border/50 hover:border-primary/50 transition-all duration-300"
                        >
                          <img 
                            src={brand.logo_url} 
                            alt={brand.name}
                            className="h-10 w-10 object-contain rounded-lg"
                            loading="lazy"
                          />
                          <span className="text-sm font-medium text-foreground group-hover:text-primary truncate">
                            {brand.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Categorías */}
                  <section>
                    <h3 className="text-lg font-bold text-foreground mb-4">Categorías</h3>
                    <div className="space-y-2">
                      {menuCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryClick(category.items[0]?.path || '/')}
                          className="w-full flex items-center justify-between p-4 rounded-xl bg-card hover:bg-primary/10 border border-border/50 hover:border-primary/50 transition-all duration-300"
                        >
                          <span className="font-medium text-foreground">{category.title}</span>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Descargar App */}
                  <Link
                    to="/instalar"
                    onClick={closeBrandsMenu}
                    className="flex items-center justify-center gap-2 w-full p-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Download className="h-5 w-5" />
                    Descargar App
                  </Link>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Logo - Optimized loading */}
          <Link to="/" className="flex-shrink-0 group">
            <div className="relative">
              {/* Placeholder while loading */}
              {!logoLoaded && (
                <div className="h-12 sm:h-14 w-[100px] sm:w-[130px] bg-muted/50 rounded-xl animate-pulse" />
              )}
              <img 
                src={logo} 
                alt="Proveedor Boutique" 
                className={`h-12 sm:h-14 max-w-[100px] sm:max-w-[130px] w-auto object-contain rounded-xl transition-all duration-300 group-hover:scale-105 ${logoLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
                onLoad={() => setLogoLoaded(true)}
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Mobile */}
            <button 
              className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              aria-label="Buscar"
            >
              <Search className="h-5 w-5 text-foreground" />
            </button>

            {/* Wishlist */}
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

            {/* Cart */}
            <CartSheet />
          </div>
        </div>

        {/* Mobile Search */}
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
