import { ShoppingCart, Search, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";
import marcasVideo from "@/assets/marcas-video.mov";
import coleccionesVideo from "@/assets/colecciones-video.mov";
import headerPattern from "@/assets/menu-header-2.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuReady, setMenuReady] = useState(false);

  // Retrasa la carga pesada del menú hasta que se abre
  useEffect(() => {
    if (isOpen && !menuReady) {
      setTimeout(() => setMenuReady(true), 100);
    }
  }, [isOpen, menuReady]);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/0 overflow-hidden"
      style={{
        backgroundImage: `url(${headerPattern})`,
        backgroundRepeat: "repeat",
        backgroundSize: "13.5%",
        filter: "brightness(1.6)",
      }}
    >
      {/* MENÚ SUPERIOR */}
      <div className="hidden md:block w-full">
        <div className="container px-4 md:px-8 py-0">
          <nav className="flex items-center justify-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-xs font-bold uppercase hover:text-primary">
                Patrocinadores
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card z-[100]">
                <DropdownMenuItem>
                  <Link to="/boutique-variedad">Boutique Variedad En Moda</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/despacho-contable">Despacho Contable R&A</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/viyaxi">Viyaxi</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-xs font-bold uppercase hover:text-primary">
                Accesorios
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card z-[100]">
                <DropdownMenuItem>
                  <Link to="/pines">Pines</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/estuche-de-gorra">Estuche De Gorra</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a href="#promociones" className="text-xs font-bold uppercase hover:text-primary">
              Promociones
            </a>
          </nav>
        </div>
      </div>

      {/* SEGUNDA FILA */}
      <div className="w-full">
        <div className="container flex h-12 items-center justify-between px-4 md:px-8 relative">
          {/* LOGO DESKTOP */}
          <Link to="/" className="hidden md:flex items-center absolute left-6 -top-12 z-10">
            <img
              src={logo}
              alt="Proveedor Boutique AR"
              loading="lazy"
              className="h-[120px] w-auto cursor-pointer hover:opacity-80 transition-transform duration-200 will-change-transform"
            />
          </Link>

          {/* LOGO + MENÚ MÓVIL */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden flex items-center absolute left-4 -top-6 z-10">
                <img
                  src={logo}
                  alt="Proveedor Boutique AR"
                  loading="lazy"
                  className="h-[100px] w-auto cursor-pointer hover:opacity-80 transition-transform active:scale-110 duration-150"
                />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[380px] bg-card overflow-y-auto p-6 transition-all duration-200 ease-out"
            >
              <SheetHeader>
                <SheetTitle>
                  <img src={logo} alt="Proveedor Boutique AR" className="h-20 mx-auto" />
                </SheetTitle>
              </SheetHeader>

              {menuReady && (
                <nav className="mt-8 pb-8 space-y-4">
                  <a href="#todo-disponible" onClick={() => setIsOpen(false)} className="block py-3 uppercase">
                    Todo lo disponible
                  </a>
                  <a href="#colecciones" onClick={() => setIsOpen(false)} className="block py-3 uppercase">
                    Colecciones
                  </a>

                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="marcas">
                      <AccordionTrigger className="px-4 py-3 text-base uppercase">
                        Marcas
                      </AccordionTrigger>
                      <AccordionContent className="pl-4 space-y-2">
                        <Link to="/jc-hats" onClick={() => setIsOpen(false)}>Jc Hats</Link>
                        <Link to="/gallo-fino" onClick={() => setIsOpen(false)}>Gallo Fino</Link>
                        <Link to="/barba-hats" onClick={() => setIsOpen(false)}>Barba Hats</Link>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="patrocinadores">
                      <AccordionTrigger className="px-4 py-3 text-base uppercase">
                        Patrocinadores
                      </AccordionTrigger>
                      <AccordionContent className="pl-4 space-y-2">
                        <Link to="/boutique-variedad" onClick={() => setIsOpen(false)}>Boutique Variedad En Moda</Link>
                        <Link to="/despacho-contable" onClick={() => setIsOpen(false)}>Despacho Contable R&A</Link>
                        <Link to="/viyaxi" onClick={() => setIsOpen(false)}>Viyaxi</Link>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <a href="#promociones" onClick={() => setIsOpen(false)} className="block py-3 uppercase">
                    Promociones
                  </a>
                </nav>
              )}
            </SheetContent>
          </Sheet>

          {/* VIDEOS DESKTOP */}
          <nav className="hidden md:flex items-center gap-0 absolute left-1/2 -translate-x-1/2">
            <a href="#colecciones" className="flex items-center h-auto">
              <video
                src={coleccionesVideo}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="h-[18px] w-auto object-cover"
                style={{
                  mixBlendMode: "screen",
                  filter: "brightness(2.8) contrast(3) saturate(2.5)",
                }}
              />
            </a>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1">
                <video
                  src={marcasVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-[18px] w-auto object-cover"
                  style={{
                    mixBlendMode: "screen",
                    filter: "brightness(2.8) contrast(3) saturate(2.5)",
                  }}
                />
                <ChevronDown className="h-4 w-4 text-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card z-[100]">
                <DropdownMenuItem>
                  <Link to="/jc-hats">Jc Hats</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/gallo-fino">Gallo Fino</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/barba-hats">Barba Hats</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a href="#todo-disponible" className="text-xs font-bold uppercase tracking-wide ml-2">
              Todo lo disponible
            </a>
          </nav>

          {/* ICONOS DERECHA */}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-muted">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-muted">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
