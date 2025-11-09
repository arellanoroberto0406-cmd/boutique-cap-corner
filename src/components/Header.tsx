import { ShoppingCart, Search, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "@/assets/logo.png";
import heroVideo from "@/assets/hero-video.mov";
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

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/0 overflow-hidden pb-0"
      style={{
        backgroundImage: `url(${headerPattern})`,
        backgroundRepeat: "repeat",
        backgroundSize: "13.5%",
        backgroundPosition: "0 0",
        filter: "brightness(1.6)",
      }}
    >
      {/* PRIMERA FILA - MENÚ SUPERIOR */}
      <div className="hidden md:block w-full">
        <div className="container px-4 md:px-8 py-0 max-w-[110%]">
          <nav className="flex items-center justify-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-xs font-bold transition-colors hover:text-primary uppercase tracking-wide h-auto text-foreground whitespace-nowrap">
                Patrocinadores
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card z-[100]">
                <DropdownMenuItem>
                  <Link to="/boutique-variedad" className="w-full">
                    Boutique Variedad En Moda
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/despacho-contable" className="w-full">
                    Despacho Contable R&A
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/viyaxi" className="w-full">
                    Viyaxi
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-xs font-bold transition-colors hover:text-primary uppercase tracking-wide h-auto text-foreground whitespace-nowrap">
                Accesorios
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card z-[100]">
                <DropdownMenuItem>
                  <Link to="/pines" className="w-full">
                    Pines
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/estuche-de-gorra" className="w-full">
                    Estuche De Gorra
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a
              href="#promociones"
              className="text-xs font-bold transition-colors hover:text-primary uppercase tracking-wide flex items-center h-auto text-foreground whitespace-nowrap"
            >
              Promociones
            </a>
          </nav>
        </div>
      </div>

      {/* SEGUNDA FILA - LOGO + VIDEOS + ICONOS */}
      <div className="w-full">
        <div className="container flex h-12 md:h-12 items-center justify-between px-4 md:px-8 relative max-w-[110%]">
          {/* LOGO */}
          <Link to="/" className="hidden md:flex items-center absolute left-4 md:left-8 -top-6 md:-top-10 z-10">
            <img src={logo} alt="Proveedor Boutique AR" className="h-[100px] md:h-[160px] w-auto cursor-pointer hover:opacity-80 transition-opacity" />
          </Link>

          {/* LOGO MÓVIL CON MENÚ */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden flex items-center absolute left-4 -top-6 z-10">
                <img src={logo} alt="Proveedor Boutique AR" className="h-[100px] w-auto cursor-pointer hover:opacity-80 transition-opacity" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-card">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <img src={logo} alt="Proveedor Boutique AR" className="h-25 w-auto" />
                </SheetTitle>
              </SheetHeader>

              {/* MENÚ MÓVIL */}
              <nav className="mt-8">
                <div className="space-y-4">
                  <a
                    href="#todo-disponible"
                    className="block px-4 py-3 text-base font-medium hover:bg-muted rounded-md transition-colors uppercase"
                    onClick={() => setIsOpen(false)}
                  >
                    Todo lo disponible
                  </a>
                  <a
                    href="#colecciones"
                    className="block px-4 py-3 text-base font-medium hover:bg-muted rounded-md transition-colors uppercase"
                    onClick={() => setIsOpen(false)}
                  >
                    Colecciones
                  </a>

                  {/* ACCORDIONS */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="marcas" className="border-none">
                      <AccordionTrigger className="px-4 py-3 hover:bg-muted rounded-md text-base font-medium hover:no-underline uppercase">
                        Marcas
                      </AccordionTrigger>
                      <AccordionContent className="pl-4 space-y-2">
                        <Link to="/jc-hats" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors" onClick={() => setIsOpen(false)}>
                          Jc Hats
                        </Link>
                        <Link to="/gallo-fino" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors" onClick={() => setIsOpen(false)}>
                          Gallo Fino
                        </Link>
                        <Link to="/barba-hats" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors" onClick={() => setIsOpen(false)}>
                          Barba Hats
                        </Link>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="patrocinadores" className="border-none">
                      <AccordionTrigger className="px-4 py-3 hover:bg-muted rounded-md text-base font-medium hover:no-underline uppercase">
                        Patrocinadores
                      </AccordionTrigger>
                      <AccordionContent className="pl-4 space-y-2">
                        <Link to="/boutique-variedad" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors" onClick={() => setIsOpen(false)}>
                          Boutique Variedad En Moda
                        </Link>
                        <Link to="/despacho-contable" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors" onClick={() => setIsOpen(false)}>
                          Despacho Contable R&A
                        </Link>
                        <Link to="/viyaxi" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors" onClick={() => setIsOpen(false)}>
                          Viyaxi
                        </Link>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="accesorios" className="border-none">
                      <AccordionTrigger className="px-4 py-3 hover:bg-muted rounded-md text-base font-medium hover:no-underline uppercase">
                        Accesorios
                      </AccordionTrigger>
                      <AccordionContent className="pl-4 space-y-2">
                        <Link to="/pines" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors" onClick={() => setIsOpen(false)}>
                          Pines
                        </Link>
                        <Link to="/estuche-de-gorra" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors" onClick={() => setIsOpen(false)}>
                          Estuche De Gorra
                        </Link>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <a
                    href="#promociones"
                    className="block px-4 py-3 text-base font-medium hover:bg-muted rounded-md transition-colors uppercase"
                    onClick={() => setIsOpen(false)}
                  >
                    Promociones
                  </a>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* VIDEOS + TEXTO - SOLO DESKTOP */}
          <nav className="hidden md:flex items-center gap-0 overflow-hidden absolute left-1/2 -translate-x-1/2">
            <a href="#colecciones" className="flex items-center h-auto">
              <video
                src={coleccionesVideo}
                autoPlay
                muted
                loop
                playsInline
                className="h-[14px] md:h-[18px] w-auto object-cover block m-0 p-0"
                style={{
                  display: "block",
                  lineHeight: 0,
                  margin: 0,
                  padding: 0,
                  imageRendering: "crisp-edges",
                  mixBlendMode: "screen",
                  filter: "brightness(2.8) contrast(3) saturate(2.5)",
                }}
              />
            </a>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 h-auto">
                <video
                  src={marcasVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-[14px] md:h-[18px] w-auto object-cover block m-0 p-0"
                  style={{
                    display: "block",
                    lineHeight: 0,
                    margin: 0,
                    padding: 0,
                    imageRendering: "crisp-edges",
                    mixBlendMode: "screen",
                    filter: "brightness(2.8) contrast(3) saturate(2.5)",
                  }}
                />
                <ChevronDown className="h-3 md:h-4 w-3 md:w-4 text-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card z-[100]">
                <DropdownMenuItem>
                  <Link to="/jc-hats" className="w-full">
                    Jc Hats
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/gallo-fino" className="w-full">
                    Gallo Fino
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/barba-hats" className="w-full">
                    Barba Hats
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a
              href="#todo-disponible"
              className="text-[10px] md:text-xs font-bold transition-colors hover:text-primary uppercase tracking-wide flex items-center h-auto text-foreground whitespace-nowrap"
            >
              Todo lo disponible
            </a>
          </nav>

          {/* ICONOS - LADO DERECHO */}
          <div className="flex items-center gap-1 md:gap-2 ml-auto">
            <Button variant="ghost" size="icon" className="h-12 w-12 md:h-10 md:w-10 hover:bg-muted" aria-label="Buscar">
              <Search className="h-6 w-6 md:h-5 md:w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-12 w-12 md:h-10 md:w-10 hover:bg-muted" aria-label="Carrito de compras">
              <ShoppingCart className="h-6 w-6 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
