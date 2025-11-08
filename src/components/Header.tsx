import { ShoppingCart, Search, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "@/assets/logo.png";
import heroVideo from "@/assets/hero-video.mov";
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card backdrop-blur">
      <div className="container flex h-24 md:h-32 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4 md:gap-8">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-muted">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-card">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <img 
                    src={logo} 
                    alt="Proveedor Boutique AR" 
                    className="h-25 w-auto"
                  />
                </SheetTitle>
              </SheetHeader>
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
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="marcas" className="border-none">
                      <AccordionTrigger className="px-4 py-3 hover:bg-muted rounded-md text-base font-medium hover:no-underline uppercase">
                        Marcas
                      </AccordionTrigger>
                      <AccordionContent className="pl-4 space-y-2">
                        <Link 
                          to="/jc-hats" 
                          className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          Jc Hats
                        </Link>
                        <Link 
                          to="/gallo-fino" 
                          className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          Gallo Fino
                        </Link>
                        <Link 
                          to="/barba-hats" 
                          className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          Barba Hats
                        </Link>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="patrocinadores" className="border-none">
                      <AccordionTrigger className="px-4 py-3 hover:bg-muted rounded-md text-base font-medium hover:no-underline uppercase">
                        Patrocinadores
                      </AccordionTrigger>
                      <AccordionContent className="pl-4 space-y-2">
                        <Link 
                          to="/boutique-variedad" 
                          className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          Boutique Variedad En Moda
                        </Link>
                        <Link 
                          to="/despacho-contable" 
                          className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          Despacho Contable R&A
                        </Link>
                        <Link 
                          to="/viyaxi" 
                          className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          Viyaxi
                        </Link>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="accesorios" className="border-none">
                      <AccordionTrigger className="px-4 py-3 hover:bg-muted rounded-md text-base font-medium hover:no-underline uppercase">
                        Accesorios
                      </AccordionTrigger>
                      <AccordionContent className="pl-4 space-y-2">
                        <Link 
                          to="/pines" 
                          className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          Pines
                        </Link>
                        <Link 
                          to="/estuche-de-gorra" 
                          className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
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
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="Proveedor Boutique AR" 
              className="h-25 md:h-36 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#todo-disponible" className="text-sm font-semibold transition-colors hover:text-primary uppercase tracking-wide flex items-center h-10">
            Todo lo disponible
          </a>
          <a href="#colecciones" className="text-sm font-semibold transition-colors hover:text-primary uppercase tracking-wide flex items-center h-10">
            Colecciones
          </a>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-semibold transition-colors hover:text-primary uppercase tracking-wide h-10">
              <video
                src={heroVideo}
                autoPlay
                muted
                loop
                playsInline
                className="h-12 w-auto mix-blend-screen brightness-110 contrast-125"
                style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))' }}
              />
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card z-[100]">
              <DropdownMenuItem>
                <Link to="/jc-hats" className="w-full">Jc Hats</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/gallo-fino" className="w-full">Gallo Fino</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/barba-hats" className="w-full">Barba Hats</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-semibold transition-colors hover:text-primary uppercase tracking-wide h-10">
              Patrocinadores
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card z-[100]">
              <DropdownMenuItem>
                <Link to="/boutique-variedad" className="w-full">Boutique Variedad En Moda</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/despacho-contable" className="w-full">Despacho Contable R&A</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/viyaxi" className="w-full">Viyaxi</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-semibold transition-colors hover:text-primary uppercase tracking-wide h-10">
              Accesorios
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card z-[100]">
              <DropdownMenuItem>
                <Link to="/pines" className="w-full">Pines</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/estuche-de-gorra" className="w-full">Estuche De Gorra</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <a href="#promociones" className="text-sm font-semibold transition-colors hover:text-primary uppercase tracking-wide flex items-center h-10">
            Promociones
          </a>
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" className="h-12 w-12 md:h-10 md:w-10 hover:bg-muted" aria-label="Buscar">
            <Search className="h-6 w-6 md:h-5 md:w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-12 w-12 md:h-10 md:w-10 hover:bg-muted" aria-label="Carrito de compras">
            <ShoppingCart className="h-6 w-6 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
