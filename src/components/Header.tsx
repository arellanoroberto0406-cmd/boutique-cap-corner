import { useState, useEffect } from "react";
import { Heart, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartSheet } from "./CartSheet";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
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
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  // Precargar imágenes de marcas
  useEffect(() => {
    const images = [brandBassPro, brandJC, brandRanchCorral, brandIcon, brandFino, brand31];
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
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
            onClick={() => setIsBrandsOpen(true)}
          >
            <img src={logo} alt="Proveedor Boutique" className="h-28 w-auto scale-125 logo-glow" />
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
          </div>
        </div>
      </div>

      {/* Modal de Marcas Pantalla Completa */}
      <Dialog open={isBrandsOpen} onOpenChange={setIsBrandsOpen}>
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
                  setIsBrandsOpen(false);
                }}
              />
            </div>

            {/* Menú de Navegación Vertical con scroll táctil */}
            <div className="flex flex-col items-center gap-2 mb-6 max-w-md mx-auto px-4 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
              {menuCategories.map((category) => (
                <div key={category.title} className="w-full">
                  {category.title === "MARCAS" ? (
                    <details className="w-full group">
                      <summary className="w-full cursor-pointer list-none flex items-center justify-between p-3 rounded-md bg-white/5 hover:bg-white/10 transition-colors">
                        <span className="text-sm font-bold text-white">{category.title}</span>
                        <ChevronDown className="h-4 w-4 text-white transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="mt-2 grid grid-cols-2 gap-3 p-4 bg-black/50 rounded-md border border-white/10">
                        <div 
                          onClick={() => {
                            navigate('/bass-pro-shops');
                            setIsBrandsOpen(false);
                          }}
                          className="aspect-square bg-black rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-all duration-1000 ease-in-out cursor-pointer brand-glow"
                        >
                          <img src={brandBassPro} alt="Bass Pro Shops" className="w-full h-full object-contain" loading="lazy" />
                        </div>
                        <div 
                          onClick={() => {
                            navigate('/jc-hats');
                            setIsBrandsOpen(false);
                          }}
                          className="aspect-square bg-black rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-all duration-1000 ease-in-out cursor-pointer brand-glow"
                        >
                          <img src={brandJC} alt="JC Solo los Mejores" className="w-full h-full object-contain" loading="lazy" />
                        </div>
                        <div 
                          onClick={() => {
                            navigate('/ranch-corral');
                            setIsBrandsOpen(false);
                          }}
                          className="aspect-square bg-black rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-all duration-1000 ease-in-out cursor-pointer brand-glow"
                        >
                          <img src={brandRanchCorral} alt="Ranch & Corral" className="w-full h-full object-contain" loading="lazy" />
                        </div>
                        <div 
                          onClick={() => {
                            navigate('/barba-hats');
                            setIsBrandsOpen(false);
                          }}
                          className="aspect-square bg-black rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-all duration-1000 ease-in-out cursor-pointer brand-glow"
                        >
                          <img src={brandIcon} alt="Marca Especial" className="w-full h-full object-contain" loading="lazy" />
                        </div>
                        <div 
                          onClick={() => {
                            navigate('/gallo-fino');
                            setIsBrandsOpen(false);
                          }}
                          className="aspect-square bg-black rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-all duration-1000 ease-in-out cursor-pointer brand-glow"
                        >
                          <img src={brandFino} alt="Fino" className="w-full h-full object-contain" loading="lazy" />
                        </div>
                        <div 
                          onClick={() => {
                            navigate('/marca-31');
                            setIsBrandsOpen(false);
                          }}
                          className="aspect-square bg-black rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-all duration-1000 ease-in-out cursor-pointer brand-glow"
                        >
                          <img src={brand31} alt="31" className="w-full h-full object-contain" loading="lazy" />
                        </div>
                      </div>
                    </details>
                  ) : (
                    <details className="w-full group">
                      <summary className="w-full cursor-pointer list-none flex items-center justify-between p-3 rounded-md bg-white/5 hover:bg-white/10 transition-colors">
                        <span className="text-sm font-bold text-white">{category.title}</span>
                        <ChevronDown className="h-4 w-4 text-white transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="mt-2 flex flex-col gap-1 p-2 bg-black/50 rounded-md border border-white/10">
                        {category.items.map((item) => (
                          <button
                            key={item.name}
                            onClick={() => {
                              navigate(item.path);
                              setIsBrandsOpen(false);
                            }}
                            className="w-full text-left p-2 rounded-md hover:bg-white/10 text-white text-sm transition-colors"
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


          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
