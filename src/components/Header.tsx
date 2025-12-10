import { useState, useEffect } from "react";
import { Heart, ChevronRight, Search, Loader2 } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const Header = () => {
  const { isBrandsOpen, openBrandsMenu, closeBrandsMenu } = useMenu();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
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
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo clickeable para abrir menú */}
          <div 
            className="cursor-pointer flex items-center gap-2"
            onClick={openBrandsMenu}
          >
            <img 
              src={logo} 
              alt="Proveedor Boutique" 
              className="h-10 sm:h-12 max-w-[100px] sm:max-w-[120px] w-auto object-contain" 
            />
          </div>

          {/* Barra de búsqueda expandible */}
          <div className={`flex items-center gap-2 transition-all duration-300 ${showMobileSearch ? 'flex-1' : ''}`}>
            <div className={`transition-all duration-300 ${showMobileSearch ? 'flex-1' : 'w-0 overflow-hidden'}`}>
              {showMobileSearch && <SearchBar />}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10"
              onClick={() => navigate("/favoritos")}
            >
              <Heart className="h-5 w-5" />
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

      {/* Sheet de Marcas */}
      <Sheet open={isBrandsOpen} onOpenChange={(open) => open ? openBrandsMenu() : closeBrandsMenu()}>
        <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 overflow-y-auto">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-left">Menú</SheetTitle>
            <SheetDescription className="text-left text-sm">
              Explora nuestras marcas y categorías
            </SheetDescription>
          </SheetHeader>
          
          {/* Indicador de carga */}
          {(brandsLoading || !imagesLoaded) && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          )}

          {!brandsLoading && imagesLoaded && (
            <div className="p-4 space-y-6">
              {fullMenuCategories.map((category) => (
                <div key={category.title} className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    {category.title}
                  </h3>
                  
                  {category.title === "MARCAS" ? (
                    <div className="grid grid-cols-2 gap-2">
                      {brands.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => handleNavigate(brand.path)}
                          className="aspect-square bg-card rounded-lg p-3 flex items-center justify-center border border-border hover:border-primary hover:bg-accent transition-all"
                        >
                          <img 
                            src={brand.logo_url} 
                            alt={brand.name} 
                            className="w-full h-full object-contain" 
                            loading="eager" 
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {category.items.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => handleNavigate(item.path)}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <span className="text-sm">{item.name}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
