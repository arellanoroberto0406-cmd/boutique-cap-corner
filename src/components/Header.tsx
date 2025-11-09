import { ShoppingCart, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
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
  const [marcasVideoLoaded, setMarcasVideoLoaded] = useState(false);

  // 🧠 Cachear los videos en memoria (no se vuelven a recargar)
  const marcasVideoMemo = useMemo(() => marcasVideo, []);
  const coleccionesVideoMemo = useMemo(() => coleccionesVideo, []);

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
      {/* FILA SUPERIOR */}
      <div className="hidden md:block w-full">
        <div className="container px-4 md:px-8 py-0 max-w-[110%]">
          <nav className="flex items-center justify-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide h-auto text-foreground whitespace-nowrap">
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
              <DropdownMenuTrigger className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide h-auto text-foreground whitespace-nowrap">
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
              className="text-xs font-bold hover:text-primary uppercase tracking-wide flex items-center h-auto text-foreground whitespace-nowrap"
            >
              Promociones
            </a>
          </nav>
        </div>
      </div>

      {/* LOGO + MENU */}
      <div className="w-full">
        <div className="container flex h-12 md:h-12 items-center justify-between px-4 md:px-8 relative max-w-[110%]">
          {/* LOGO */}
          <Link
            to="/"
            className="hidden md:flex items-center absolute left-4 md:left-8 -top-10 md:-top-16 z-10"
          >
            <img
              src={logo}
              alt="Proveedor Boutique AR"
              className="h-[100px] md:h-[160px] w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
            />
          </Link>

          {/* LOGO MÓVIL */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden flex items-center absolute left-4 -top-6 z-10">
                <img
                  src={logo}
                  alt="Proveedor Boutique AR"
                  className="h-[100px] w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
                />
              </button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[300px] sm:w-[400px] bg-card overflow-y-auto p-6"
            >
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Link to="/" onClick={() => setIsOpen(false)}>
                    <img
                      src={logo}
                      alt="Proveedor Boutique AR"
                      className="h-25 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    />
                  </Link>
                </SheetTitle>
              </SheetHeader>

              {/* MENU MÓVIL */}
              <nav className="mt-8 pb-8">
                <div className="space-y-4 font-sans text-base text-foreground">
                  <a
                    href="#todo-disponible"
                    className="block px-4 py-3 font-medium hover:bg-muted rounded-md uppercase"
                    onClick={() => setIsOpen(false)}
                  >
                    Todo lo disponible
                  </a>
                  <a
                    href="#colecciones"
                    className="block px-4 py-3 font-medium hover:bg-muted rounded-md uppercase"
                    onClick={() => setIsOpen(false)}
                  >
                    Colecciones
                  </a>

                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="marcas" className="border-none">
                      <AccordionTrigger className="px-4 py-3 hover:bg-muted rounded-md text-base font-medium uppercase flex items-center">
                        <video
                          src={marcasVideoMemo}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                          onLoadedData={() => setMarcasVideoLoaded(true)}
                          className="h-[24px] w-auto object-cover"
                          style={{
                            mixBlendMode: "screen",
                            filter:
                              "brightness(3.2) contrast(3.5) saturate(3)",
                          }}
                        />
                      </AccordionTrigger>

                      <AccordionContent className="pl-4 space-y-2">
                        {marcasVideoLoaded ? (
                          <>
                            <Link
                              to="/jc-hats"
                              className="block px-4 py-2 text-sm hover:bg-muted rounded-md"
                              onClick={() => setIsOpen(false)}
                            >
                              JC Hats
                            </Link>
                            <Link
                              to="/gallo-fino"
                              className="block px-4 py-2 text-sm hover:bg-muted rounded-md"
                              onClick={() => setIsOpen(false)}
                            >
                              Gallo Fino
                            </Link>
                            <Link
                              to="/barba-hats"
                              className="block px-4 py-2 text-sm hover:bg-muted rounded-md"
                              onClick={() => setIsOpen(false)}
                            >
                              Barba Hats
                            </Link>
                          </>
                        ) : (
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            Cargando...
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <a
                    href="#promociones"
                    className="block px-4 py-3 font-medium hover:bg-muted rounded-md uppercase"
                    onClick={() => setIsOpen(false)}
                  >
                    Promociones
                  </a>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* VIDEOS CENTRAL */}
          <nav className="hidden md:flex items-center gap-0 overflow-hidden absolute left-1/2 -translate-x-1/2">
            <a href="#colecciones" className="flex items-center h-auto">
              <video
                src={coleccionesVideoMemo}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="h-[14px] md:h-[18px] w-auto object-cover"
                style={{
                  mixBlendMode: "screen",
                  filter: "brightness(2.8) contrast(3) saturate(2.5)",
                }}
              />
            </a>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 h-auto select-none">
                <video
                  src={marcasVideoMemo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="h-[14px] md:h-[18px] w-auto object-cover"
                  style={{
                    mixBlendMode: "screen",
                    filter: "brightness(2.8) contrast(3) saturate(2.5)",
                    pointerEvents: "none",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                />
                <ChevronDown className="h-3 md:h-4 w-3 md:w-4 text-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card z-[100]">
                {["JC Hats", "Gallo Fino", "Barba Hats"].map((marca) => (
                  <DropdownMenuItem key={marca} className="focus:bg-muted">
                    <Link
                      to={`/${marca.toLowerCase().replace(" ", "-")}`}
                      className="w-full select-none"
                      style={{
                        WebkitFontSmoothing: "antialiased",
                        MozOsxFontSmoothing: "grayscale",
                        textRendering: "optimizeLegibility",
                      }}
                    >
                      {marca}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <a
              href="#todo-disponible"
              className="text-[10px] md:text-xs font-bold hover:text-primary uppercase tracking-wide flex items-center h-auto text-foreground whitespace-nowrap"
            >
              Todo lo disponible
            </a>
          </nav>

          {/* ICONOS */}
          <div className="flex items-center gap-1 md:gap-2 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 md:h-10 md:w-10 hover:bg-muted"
              aria-label="Buscar"
            >
              <Search className="h-6 w-6 md:h-5 md:w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 md:h-10 md:w-10 hover:bg-muted"
              aria-label="Carrito de compras"
            >
              <ShoppingCart className="h-6 w-6 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
