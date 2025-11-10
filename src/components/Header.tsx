import { useState, useEffect } from "react";
import { Heart, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartSheet } from "./CartSheet";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useMenu } from "@/context/MenuContext";
import { SearchBar } from "./SearchBar";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-proveedor.png";
import brandBassPro from "@/assets/brand-bass-pro.jpg";
import brandJC from "@/assets/brand-jc-new.jpg";
import brandRanchCorral from "@/assets/brand-ranch-corral.jpg";
import brandIcon from "@/assets/brand-icon.jpg";
import brandFino from "@/assets/brand-fino.jpg";
import brand31 from "@/assets/brand-31.jpg";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Header = () => {
  const { isBrandsOpen, openBrandsMenu, closeBrandsMenu } = useMenu();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  // Precargar imágenes de marcas al montar el componente
  useEffect(() => {
    const images = [brandBassPro, brandJC, brandRanchCorral, brandIcon, brandFino, brand31];
    let loadedCount = 0;
    
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === images.length) {
        setImagesLoaded(true);
      }
    };
    
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded;
    });
    
    // Timeout de seguridad
    const timeout = setTimeout(() => {
      setImagesLoaded(true);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);

  const menuCategories = [
    {
      title: "MARCAS",
      items: [
        { name: "Bass Pro Shops", path: "/bass-pro-shops" },
        { name: "JC Hats", path: "/jc-hats" },
        { name: "Ranch Corral", path: "/ranch-corral" },
        { name: "Barba Hats", path: "/barba-hats" },
        { name: "Gallo Fino", path: "/gallo-fino" },
        { name: "Marca 31", path: "/marca-31" },
      ],
    },
    {
      title: "ACCESORIOS",
      items: [
        { name: "Pines", path: "/pines" },
        { name: "Estuches de Gorra", path: "/estuche-de-gorra" },
        { name: "Productos Especiales", path: "/boutique-variedad" },
      ],
    },
    {
      title: "LO NUEVO",
      items: [
        { name: "Nuevas Colecciones", path: "/" },
        { name: "Últimos Modelos", path: "/" },
      ],
    },
    {
      title: "PATROCINADORES",
      items: [
        { name: "Viyaxi", path: "/viyaxi" },
        { name: "Despacho Contable", path: "/despacho-contable" },
      ],
    },
    {
      title: "ESTUCHES",
      items: [
        { name: "Ver Todos", path: "/estuche-de-gorra" },
      ],
    },
    {
      title: "PINES",
      items: [
        { name: "Ver Todos", path: "/pines" },
      ],
    },
    {
      title: "DESCUENTOS",
      items: [
        { name: "Ofertas Especiales", path: "/" },
        { name: "Liquidación", path: "/" },
      ],
    },
    {
      title: "MAYOREO",
      items: [
        { name: "Catálogo Mayoreo", path: "/" },
        { name: "Pedidos Especiales", path: "/" },
      ],
    },
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

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Botón de búsqueda móvil con barra deslizante */}
            <div className={`lg:hidden flex items-center transition-all duration-500 ease-in-out ${showMobileSearch ? 'gap-2' : 'gap-0'}`}>
              <div className={`transition-all duration-500 ease-in-out ${showMobileSearch ? 'w-56 sm:w-64 opacity-100 visible' : 'w-0 opacity-0 invisible'}`}>
                {showMobileSearch && <SearchBar />}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="hover:scale-110 transition-all duration-500 flex-shrink-0"
                onClick={() => {
                  console.log('Search toggle clicked:', !showMobileSearch);
                  setShowMobileSearch(!showMobileSearch);
                }}
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
            {!imagesLoaded && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
              </div>
            )}

            {/* Menú de Navegación Vertical con scroll táctil - Solo se muestra cuando las imágenes están cargadas */}
            {imagesLoaded && (
              <div className="flex flex-col items-center gap-2 mb-6 max-w-md mx-auto px-4 overflow-y-auto animate-fade-in" style={{ touchAction: 'pan-y' }}>
              {menuCategories.map((category) => (
                <div key={category.title} className="w-full">
                  {category.title === "MARCAS" ? (
                    <details className="w-full group [&>summary]:outline-none">
                      <summary className="w-full cursor-pointer list-none flex items-center justify-between p-3 rounded-md bg-white/5 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.3),inset_0_0_0_1px_rgba(255,255,255,0.4)] transition-all">
                        <span className="text-sm font-bold text-white">{category.title}</span>
                        <ChevronDown className="h-4 w-4 text-white transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="mt-2 grid grid-cols-2 gap-3 p-4 bg-black/50 rounded-md border border-white/10">
                        <div 
                          onClick={() => {
                            navigate('/bass-pro-shops');
                            closeBrandsMenu();
                          }}
                          className="aspect-square bg-black rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-all duration-1000 ease-in-out cursor-pointer brand-glow"
                        >
                          <img src={brandBassPro} alt="Bass Pro Shops" className="w-full h-full object-contain" loading="eager" />
                        </div>
                        <div 
                          onClick={() => {
                            navigate('/jc-hats');
                            closeBrandsMenu();
                          }}
                          className="aspect-square bg-black rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-all duration-1000 ease-in-out cursor-pointer brand-glow"
                        >
                          <img src={brandJC} alt="JC Solo los Mejores" className="w-full h-full object-contain" loading="eager" />
                        </div>
                        <div 
                          onClick={() => {
                            navigate('/ranch-corral');
                            closeBrandsMenu();
                          }}
                          className="aspect-square bg-black rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-all duration-1000 ease-in-out cursor-pointer brand-glow"
                        >
                          <img src={brandRanchCorral} alt="Ranch & Corral" className="w-full h-full object-contain" loading="eager" />
                        </div>
                        <div 
                          onClick={() => {
                            navigate('/barba-hats');
                            closeBrandsMenu();
                          }}
                          className="aspect-square bg-black rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-all duration-1000 ease-in-out cursor-pointer brand-glow"
                        >
                          <img src={brandIcon} alt="Marca Especial" className="w-full h-full object-contain" loading="eager" />
                        </div>
                        <div 
                          onClick={() => {
                            navigate('/gallo-fino');
                            closeBrandsMenu();
                          }}
                          className="aspect-square bg-black rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-all duration-1000 ease-in-out cursor-pointer brand-glow"
                        >
                          <img src={brandFino} alt="Fino" className="w-full h-full object-contain" loading="eager" />
                        </div>
                        <div 
                          onClick={() => {
                            navigate('/marca-31');
                            closeBrandsMenu();
                          }}
                          className="aspect-square bg-black rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-all duration-1000 ease-in-out cursor-pointer brand-glow"
                        >
                          <img src={brand31} alt="31" className="w-full h-full object-contain" loading="eager" />
                        </div>
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
