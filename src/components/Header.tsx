import { ShoppingCart, Search, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4 md:gap-8">
          <Button variant="ghost" size="icon" className="md:hidden hover:bg-muted">
            <Menu className="h-6 w-6" />
          </Button>
          <Link to="/">
            <h1 className="text-lg md:text-2xl font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
              Proveedor Boutique <span className="text-primary">AR</span>
            </h1>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#todo-disponible" className="text-sm font-medium transition-colors hover:text-primary">
            TODO LO DISPONIBLE
          </a>
          <a href="#colecciones" className="text-sm font-medium transition-colors hover:text-primary">
            COLECCIONES
          </a>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary">
              MARCAS
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
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary">
              PATROCINADORES
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
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary">
              ACCESORIOS
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
          <a href="#promociones" className="text-sm font-medium transition-colors hover:text-primary">
            PROMOCIONES
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
