import { useState, useEffect } from "react";
import { Heart, ChevronRight, Search, Loader2, X, Menu, Home, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartSheet } from "./CartSheet";
import { useWishlist } from "@/context/WishlistContext";
import { useMenu } from "@/context/MenuContext";
import { SearchBar } from "./SearchBar";
import { useNavigate } from "react-router-dom";
import defaultLogo from "@/assets/logo-proveedor.png";
import { useBrands } from "@/hooks/useBrands";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { getMenuCategories, MenuCategory } from "@/data/menuCategoriesStore";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const Header = () => {
  const { isBrandsOpen, openBrandsMenu, closeBrandsMenu } = useMenu();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>("MARCAS");
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const { brands, loading: brandsLoading } = useBrands();
  const { settings } = useSiteSettings();
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);

  // Usar logo personalizado o el por defecto
  const logo = settings.company_logo || defaultLogo;

  // Cargar categorías dinámicamente
  useEffect(() => {
    setMenuCategories(getMenuCategories().filter(c => c.isActive));

    const handleMenuUpdate = () => {
      setMenuCategories(getMenuCategories().filter(c => c.isActive));
    };

    window.addEventListener('menuCategoriesUpdated', handleMenuUpdate);
    return () => {
      window.removeEventListener('menuCategoriesUpdated', handleMenuUpdate);
    };
  }, []);

  // Precargar imágenes de marcas
  useEffect(() => {
    if (brands.length === 0) {
      setImagesLoaded(true);
      return;
    }
    
    Promise.all(
      brands.map(brand => 
        new Promise((resolve) => {
          const img = new Image();
          img.src = brand.logo_url;
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
        })
      )
    ).then(() => setImagesLoaded(true));
    
    // Timeout de seguridad
    const timeout = setTimeout(() => setImagesLoaded(true), 2000);
    
    return () => clearTimeout(timeout);
  }, [brands]);

  // Construir menú completo con marcas al inicio
  const fullMenuCategories = [
    {
      id: 'marcas',
      title: "MARCAS",
      items: brands.map(brand => ({ name: brand.name, path: brand.path, logo: brand.logo_url })),
      isActive: true,
    },
    ...menuCategories,
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    closeBrandsMenu();
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-background/95 via-background/90 to-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border/30 transition-all duration-300 shadow-lg shadow-black/5">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Menu Button + Logo */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300"
              onClick={openBrandsMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div 
              className="cursor-pointer group hidden sm:block"
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <img 
                  src={logo} 
                  alt="Proveedor Boutique" 
                  className="h-10 sm:h-12 max-w-[90px] sm:max-w-[110px] w-auto object-contain rounded-lg transition-all duration-500 group-hover:scale-105 group-hover:brightness-110" 
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Barra de búsqueda expandible */}
            <div className={`flex items-center transition-all duration-500 ease-in-out ${showMobileSearch ? 'gap-2' : 'gap-0'}`}>
              <div className={`transition-all duration-500 ease-in-out ${showMobileSearch ? 'w-48 sm:w-64 lg:w-80 opacity-100 visible' : 'w-0 opacity-0 invisible'}`}>
                {showMobileSearch && <SearchBar />}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300"
              onClick={() => navigate("/favoritos")}
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in shadow-lg shadow-primary/50">
                  {wishlist.length}
                </span>
              )}
            </Button>

            <CartSheet />
          </div>
        </div>
      </div>

      {/* Modal de Menú Moderno */}
      <Dialog open={isBrandsOpen} onOpenChange={(open) => open ? openBrandsMenu() : closeBrandsMenu()}>
        <DialogContent className="max-w-full h-full w-full p-0 bg-gradient-to-br from-background via-background to-card border-0 [&>button]:!hidden overflow-hidden">
          <DialogTitle className="sr-only">Menú de Navegación</DialogTitle>
          <DialogDescription className="sr-only">
            Explora nuestras marcas y categorías
          </DialogDescription>
          
          <div className="relative h-full w-full flex flex-col">
            {/* Header del menú */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => handleNavigate('/')}
              >
                <img 
                  src={logo} 
                  alt="Proveedor Boutique" 
                  className="h-12 max-w-[120px] w-auto object-contain rounded-lg transition-all duration-300 group-hover:scale-105"
                  loading="eager"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeBrandsMenu}
                className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 p-4 border-b border-border/30">
              <Button
                variant="outline"
                className="flex-1 h-12 gap-2 font-heading tracking-wide hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                onClick={() => handleNavigate('/')}
              >
                <Home className="h-4 w-4" />
                INICIO
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 gap-2 font-heading tracking-wide hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                onClick={() => handleNavigate('/lo-nuevo')}
              >
                <Sparkles className="h-4 w-4" />
                LO NUEVO
              </Button>
            </div>

            {/* Indicador de carga */}
            {(brandsLoading || !imagesLoaded) && (
              <div className="flex-1 flex justify-center items-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin h-12 w-12 text-primary" />
                  <p className="text-muted-foreground font-medium">Cargando...</p>
                </div>
              </div>
            )}

            {/* Contenido del menú */}
            {!brandsLoading && imagesLoaded && (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Sidebar de categorías */}
                <div className="md:w-64 border-b md:border-b-0 md:border-r border-border/30 bg-card/30">
                  <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1 p-3">
                    {fullMenuCategories.map((category) => (
                      <button
                        key={category.title}
                        onClick={() => setActiveCategory(category.title)}
                        className={cn(
                          "flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-left transition-all duration-300 whitespace-nowrap font-heading tracking-wide",
                          activeCategory === category.title
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span className="text-sm font-semibold">{category.title}</span>
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-transform hidden md:block",
                          activeCategory === category.title && "rotate-90"
                        )} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contenido de la categoría activa */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6" style={{ touchAction: 'pan-y' }}>
                  {activeCategory === "MARCAS" ? (
                    <div className="space-y-4">
                      <h3 className="font-display text-2xl md:text-3xl text-primary">NUESTRAS MARCAS</h3>
                      <p className="text-muted-foreground text-sm">Selecciona una marca para ver sus productos</p>
                      
                      {brands.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No hay marcas disponibles</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                          {brands.map((brand, index) => (
                            <button
                              key={brand.id}
                              onClick={() => handleNavigate(brand.path)}
                              className="group relative aspect-square bg-gradient-to-br from-card to-muted/50 rounded-2xl p-4 flex items-center justify-center border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 animate-fade-in-up"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <img 
                                src={brand.logo_url} 
                                alt={brand.name} 
                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" 
                                loading="eager" 
                              />
                              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/90 to-transparent rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-xs font-medium text-center truncate">{brand.name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="font-display text-2xl md:text-3xl text-primary">{activeCategory}</h3>
                      
                      {fullMenuCategories.find(c => c.title === activeCategory)?.items.map((item, index) => (
                        <button
                          key={item.name}
                          onClick={() => handleNavigate(item.path)}
                          className="w-full flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <ShoppingBag className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer del menú */}
            <div className="p-4 border-t border-border/30 bg-card/30">
              <p className="text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} {settings.company_name}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;