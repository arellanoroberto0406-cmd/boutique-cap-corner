import { ShoppingCart, Search, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useMemo, memo } from "react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [marcasVideoLoaded, setMarcasVideoLoaded] = useState(false);
  const [marcasMenuOpen, setMarcasMenuOpen] = useState(false);

  const marcasVideoMemo = useMemo(() => marcasVideo, []);
  const coleccionesVideoMemo = useMemo(() => coleccionesVideo, []);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/0 overflow-hidden pb-0 antialiased"
      style={{
        backgroundImage: `url(${headerPattern})`,
        backgroundRepeat: "repeat",
        backgroundSize: "13.5%",
        backgroundPosition: "0 0",
        contain: 'paint layout style',
        isolation: 'isolate',
        willChange: 'auto',
      }}
    >
      {/* PRIMERA FILA - MENÚ SUPERIOR */}
      <div className="hidden md:block w-full">
        <div className="container px-4 md:px-8 py-0 max-w-[110%]">
          <nav className="flex items-center justify-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-xs font-bold transition-none hover:text-primary uppercase tracking-wide h-auto text-foreground whitespace-nowrap focus-visible:outline-none focus-visible:ring-0">
                Patrocinadores
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card z-[100]" align="center" sideOffset={6}>
                <DropdownMenuItem className="focus:bg-muted focus-visible:outline-none focus-visible:ring-0">
                  <Link to="/boutique-variedad" className="w-full">
                    Boutique Variedad En Moda
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-muted focus-visible:outline-none focus-visible:ring-0">
                  <Link to="/despacho-contable" className="w-full">
                    Despacho Contable R&A
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-muted focus-visible:outline-none focus-visible:ring-0">
                  <Link to="/viyaxi" className="w-full">
                    Viyaxi
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-xs font-bold transition-none hover:text-primary uppercase tracking-wide h-auto text-foreground whitespace-nowrap focus-visible:outline-none focus-visible:ring-0">
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
              className="text-xs font-bold transition-colors hover:text-primary uppercase tracking-wide flex items-center h-auto text-foreground whitespace-nowrap story-link"
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
          <Link to="/" className="hidden md:flex items-center absolute left-4 md:left-8 -top-10 md:-top-16 z-10">
            <img src={logo} alt="Proveedor Boutique AR" className="h-[100px] md:h-[160px] w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200" />
          </Link>

          {/* LOGO MÓVIL CON MENÚ */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden flex items-center absolute left-4 -top-6 z-10">
                <img src={logo} alt="Proveedor Boutique AR" className="h-[100px] w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200" />
              </button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-card overflow-y-auto p-6">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Link to="/" onClick={() => setIsOpen(false)}>
                    <img src={logo} alt="Proveedor Boutique AR" className="h-25 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200" />
                  </Link>
                </SheetTitle>
              </SheetHeader>

              {/* MENÚ MÓVIL */}
              <nav className="mt-8 pb-8">
                <div className="space-y-4">
                  <a
                    href="#todo-disponible"
                    className="block px-4 py-3 text-base font-medium hover:bg-muted rounded-md transition-none uppercase"
                    onClick={() => setIsOpen(false)}
                  >
                    Todo lo disponible
                  </a>
                  <a
                    href="#colecciones"
                    className="block px-4 py-3 text-base font-medium hover:bg-muted rounded-md transition-none uppercase"
                    onClick={() => setIsOpen(false)}
                  >
                    Colecciones
                  </a>

                  {/* ACCORDIONS */}
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="marcas" className="border-none">
                      <AccordionTrigger className="px-4 py-3 hover:bg-muted rounded-md text-base font-medium hover:no-underline flex items-center transition-none">
                        <video
                          src={marcasVideoMemo}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          onLoadedData={() => setMarcasVideoLoaded(true)}
                          className="h-[24px] w-auto object-cover"
                          style={{
                            display: "block",
                            imageRendering: "auto",
                          }}
                        />
                      </AccordionTrigger>
                      <AccordionContent className="pl-4 space-y-2">
                        {marcasVideoLoaded ? (
                          <>
                            <Link to="/jc-hats" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-none" onClick={() => setIsOpen(false)}>
                              Jc Hats
                            </Link>
                            <Link to="/gallo-fino" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-none" onClick={() => setIsOpen(false)}>
                              Gallo Fino
                            </Link>
                            <Link to="/barba-hats" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-none" onClick={() => setIsOpen(false)}>
                              Barba Hats
                            </Link>
                          </>
                        ) : (
                          <div className="px-4 py-2 text-sm text-muted-foreground">Cargando...</div>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="patrocinadores" className="border-none">
                      <AccordionTrigger className="px-4 py-3 hover:bg-muted rounded-md text-base font-medium hover:no-underline uppercase transition-none">
                        Patrocinadores
                      </AccordionTrigger>
                      <AccordionContent className="pl-4 space-y-2">
                        <Link to="/boutique-variedad" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-none" onClick={() => setIsOpen(false)}>
                          Boutique Variedad En Moda
                        </Link>
                        <Link to="/despacho-contable" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-none" onClick={() => setIsOpen(false)}>
                          Despacho Contable R&A
                        </Link>
                        <Link to="/viyaxi" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-none" onClick={() => setIsOpen(false)}>
                          Viyaxi
                        </Link>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="accesorios" className="border-none">
                      <AccordionTrigger className="px-4 py-3 hover:bg-muted rounded-md text-base font-medium hover:no-underline uppercase transition-none">
                        Accesorios
                      </AccordionTrigger>
                      <AccordionContent className="pl-4 space-y-2">
                        <Link to="/pines" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-none" onClick={() => setIsOpen(false)}>
                          Pines
                        </Link>
                        <Link to="/estuche-de-gorra" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-none" onClick={() => setIsOpen(false)}>
                          Estuche De Gorra
                        </Link>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <a
                    href="#promociones"
                    className="block px-4 py-3 text-base font-medium hover:bg-muted rounded-md transition-none uppercase"
                    onClick={() => setIsOpen(false)}
                  >
                    Promociones
                  </a>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* VIDEOS + TEXTO - SOLO DESKTOP - CENTRADO ABSOLUTO */}
          <nav className="hidden md:flex items-center gap-0 overflow-hidden absolute left-1/2 -translate-x-1/2" style={{ contain: 'layout paint style', isolation: 'isolate' }}>
            <a href="#colecciones" className="flex items-center h-auto">
              <video
                src={coleccionesVideoMemo}
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                className="h-[14px] md:h-[18px] w-auto object-cover block m-0 p-0"
                style={{
                  display: "block",
                  lineHeight: 0,
                  margin: 0,
                  padding: 0,
                  imageRendering: "auto",
                }}
              />
            </a>

            <Popover open={marcasMenuOpen} onOpenChange={setMarcasMenuOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 h-auto select-none focus-visible:outline-none focus-visible:ring-0 focus:outline-none transition-none" style={{ isolation: 'isolate' }}>
                  <video
                    src={marcasVideoMemo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    className="h-[14px] md:h-[18px] w-auto object-cover block m-0 p-0"
                    style={{
                      display: "block",
                      lineHeight: 0,
                      margin: 0,
                      padding: 0,
                      imageRendering: "auto",
                      pointerEvents: "none",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      contain: "layout paint style",
                    }}
                  />
                  <ChevronDown className="h-3 md:h-4 w-3 md:w-4 text-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="bg-card z-[100] w-auto p-0 animate-none" 
                align="center" 
                sideOffset={8}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
                style={{ animation: 'none' }}
              >
                <div className="flex flex-col">
                  <Link 
                    to="/jc-hats" 
                    className="w-full px-4 py-2 text-sm hover:bg-muted transition-none"
                    onClick={() => setMarcasMenuOpen(false)}
                  >
                    Jc Hats
                  </Link>
                  <Link 
                    to="/gallo-fino" 
                    className="w-full px-4 py-2 text-sm hover:bg-muted transition-none"
                    onClick={() => setMarcasMenuOpen(false)}
                  >
                    Gallo Fino
                  </Link>
                  <Link 
                    to="/barba-hats" 
                    className="w-full px-4 py-2 text-sm hover:bg-muted transition-none"
                    onClick={() => setMarcasMenuOpen(false)}
                  >
                    Barba Hats
                  </Link>
                </div>
              </PopoverContent>
            </Popover>

            <a
              href="#todo-disponible"
              className="text-[10px] md:text-xs font-bold transition-colors hover:text-primary uppercase tracking-wide flex items-center h-auto text-foreground whitespace-nowrap story-link"
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

export default memo(Header);
