import { useState, useEffect } from "react";
import { Heart, ChevronDown, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartSheet } from "./CartSheet";
import { useWishlist } from "@/context/WishlistContext";
import { useMenu } from "@/context/MenuContext";
import { SearchBar } from "./SearchBar";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-proveedor.png";
import { useBrands } from "@/hooks/useBrands";
import { getMenuCategories, MenuCategory } from "@/data/menuCategoriesStore";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Header = () => {
  const { isBrandsOpen, openBrandsMenu, closeBrandsMenu } = useMenu();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const { brands, loading: brandsLoading } = useBrands();
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);

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
      items: brands.map(brand => ({ name: brand.name, path: brand.path })),
      isActive: true,
    },
    ...menuCategories,
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 hover-lift cursor-pointer"
            onClick={openBrandsMenu}
          >
            <img src={logo} alt="Proveedor Boutique" className="h-28 w-auto scale-125 logo-glow" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Barra de búsqueda expandible */}
            <div className={`flex items-center transition-all duration-500 ease-in-out ${showMobileSearch ? 'gap-2' : 'gap-0'}`}>
              <div className={`transition-all duration-500 ease-in-out ${showMobileSearch ? 'w-56 sm:w-64 lg:w-80 opacity-100 visible' : 'w-0 opacity-0 invisible'}`}>
                {showMobileSearch && <SearchBar />}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="hover:scale-110 transition-all duration-500 flex-shrink-0"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                <Search className="h-6 w-6" />
              </Button>
            </div>

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
      <Dialog open={isBrandsOpen} onOpenChange={(open) => open ? openBrandsMenu() : closeBrandsMenu()}>
        <DialogContent className="max-w-full h-full w-full p-0 bg-black border-0 [&>button]:!hidden">
          <DialogTitle className="sr-only">Nuestras Marcas</DialogTitle>
          <DialogDescription className="sr-only">
            Explora las marcas disponibles en nuestra tienda
          </DialogDescription>
          <div 
            className="relative h-full w-full overflow-y-auto bg-black"
            style={{ touchAction: 'pan-y' }}
          >
            {/* Logo de la tienda para ir a inicio */}
            <div className="flex justify-center pt-6 pb-3">
              <img 
                src={logo} 
                alt="Proveedor Boutique" 
                className="h-40 md:h-48 w-auto cursor-pointer hover:scale-105 transition-all duration-700 ease-in-out logo-glow"
                loading="eager"
                onClick={() => {
                  navigate('/');
                  closeBrandsMenu();
                }}
              />
            </div>

            {/* Indicador de carga */}
            {(brandsLoading || !imagesLoaded) && (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin h-16 w-16 text-white" />
              </div>
            )}

            {/* Menú de Navegación Vertical con scroll táctil */}
            {!brandsLoading && imagesLoaded && (
              <div className="flex flex-col items-center gap-2 mb-6 max-w-md mx-auto px-4 overflow-y-auto animate-fade-in" style={{ touchAction: 'pan-y' }}>
              {fullMenuCategories.map((category) => (
                <div key={category.title} className="w-full">
                  {category.title === "MARCAS" ? (
                    <details className="w-full group [&>summary]:outline-none">
                      <summary className="w-full cursor-pointer list-none flex items-center justify-between p-3 rounded-md bg-white/5 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.3),inset_0_0_0_1px_rgba(255,255,255,0.4)] transition-all">
                        <span className="text-sm font-bold text-white">{category.title}</span>
                        <ChevronDown className="h-4 w-4 text-white transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="mt-2 grid grid-cols-2 gap-3 p-4 bg-black/50 rounded-md border border-white/10">
                        {brands.length === 0 ? (
                          <p className="col-span-2 text-center text-white/60 py-4">No hay marcas disponibles</p>
                        ) : (
                          brands.map((brand) => (
                            <div 
                              key={brand.id}
                              onClick={() => {
                                navigate(brand.path);
                                closeBrandsMenu();
                              }}
                              className="aspect-square bg-black rounded-lg p-3 flex items-center justify-center cursor-pointer brand-glow"
                            >
                              <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" loading="eager" />
                            </div>
                          ))
                        )}
                      </div>
                    </details>
                  ) : (
                    <details className="w-full group [&>summary]:outline-none">
                      <summary className="w-full cursor-pointer list-none flex items-center justify-between p-3 rounded-md bg-white/5 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.3),inset_0_0_0_1px_rgba(255,255,255,0.4)] transition-all">
                        <span className="text-sm font-bold text-white">{category.title}</span>
                        <ChevronDown className="h-4 w-4 text-white transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="mt-2 flex flex-col gap-1 p-2 bg-black/50 rounded-md border border-white/10">
                        {category.items.map((item) => (
                          <button
                            key={item.name}
                            onClick={() => {
                              navigate(item.path);
                              closeBrandsMenu();
                            }}
                            className="w-full text-left p-2 rounded-md hover:bg-white/10 hover:shadow-[0_0_10px_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.3)] text-white text-sm transition-all"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
            )}

          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;