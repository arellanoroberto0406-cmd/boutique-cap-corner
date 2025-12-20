import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Heart, Search, X, Download, ChevronDown, ChevronRight } from "lucide-react";
import { CartSheet } from "./CartSheet";
import { SearchBar } from "./SearchBar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useWishlist } from "@/context/WishlistContext";
import { useBrands } from "@/hooks/useBrands";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import defaultLogo from "@/assets/logo-proveedor.png";
import { getMenuCategories, MenuCategory } from "@/data/menuCategoriesStore";
import menuHeaderImage from "@/assets/menu-header-2.png";

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
  const [isBrandsMenuOpen, setIsBrandsMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
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

  const closeBrandsMenu = () => {
    setIsBrandsMenuOpen(false);
    setExpandedCategory(null);
  };

  const handleBrandClick = (brandPath: string) => {
    navigate(brandPath);
    closeBrandsMenu();
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
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
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                {/* Header Image */}
                <div className="relative w-full h-40 md:h-56 overflow-hidden">
                  <img 
                    src={menuHeaderImage} 
                    alt="Proveedor Boutique" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
                  <button
                    onClick={closeBrandsMenu}
                    className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Logo de la tienda para ir a inicio */}
                <div className="flex justify-center pt-6 pb-3">
                  <img 
                    src={logo} 
                    alt="Proveedor Boutique" 
                    className="h-32 md:h-40 max-w-[200px] md:max-w-[280px] w-auto object-contain rounded-xl cursor-pointer hover:scale-105 transition-all duration-700 ease-in-out"
                    loading="eager"
                    onClick={() => {
                      navigate('/');
                      closeBrandsMenu();
                    }}
                  />
                </div>

                <div className="p-4 md:p-8 space-y-8">
                  {/* Sección de Marcas */}
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-primary mb-4 flex items-center gap-2">
                      <span className="w-8 h-0.5 bg-primary rounded-full" />
                      Nuestras Marcas
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                      {brands.map((brand, index) => (
                        <button
                          key={brand.id}
                          onClick={() => handleBrandClick(brand.path)}
                          className="group relative overflow-hidden rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300 p-4"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-background/50 p-2">
                              <img 
                                src={brand.logo_url} 
                                alt={brand.name}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors text-center line-clamp-1">
                              {brand.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categorías del menú */}
                  <div className="space-y-3">
                    <h3 className="text-lg md:text-xl font-bold text-primary mb-4 flex items-center gap-2">
                      <span className="w-8 h-0.5 bg-primary rounded-full" />
                      Categorías
                    </h3>
                    {menuCategories.map((category) => (
                      <div key={category.id} className="overflow-hidden rounded-xl border border-border/30 bg-card/30">
                        <button 
                          onClick={() => toggleCategory(category.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors"
                        >
                          <span className="font-semibold text-foreground">{category.title}</span>
                          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${expandedCategory === category.id ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedCategory === category.id && (
                          <div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                            {category.items.map((item) => (
                              <button
                                key={item.path}
                                onClick={() => {
                                  navigate(item.path);
                                  closeBrandsMenu();
                                }}
                                className="w-full text-left p-3 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                              >
                                <ChevronRight className="h-4 w-4" />
                                {item.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Botón de descarga */}
                  <Link
                    to="/instalar"
                    onClick={closeBrandsMenu}
                    className="flex items-center justify-center gap-3 w-full p-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-primary/30"
                  >
                    <Download className="h-5 w-5" />
                    <span>Descargar App</span>
                  </Link>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <div className="relative">
              <img 
                src={logo} 
                alt="Proveedor Boutique" 
                className="h-12 sm:h-14 max-w-[100px] sm:max-w-[130px] w-auto object-contain rounded-xl transition-all duration-500 group-hover:scale-105 group-hover:brightness-110" 
                fetchPriority="high"
              />
              <div className="absolute -inset-2 rounded-2xl bg-primary/20 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />
            </div>
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