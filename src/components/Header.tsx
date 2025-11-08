import { ShoppingCart, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Proveedor Boutique <span className="text-primary">AR</span>
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#todo-disponible" className="text-sm font-medium transition-colors hover:text-primary">
            TODO LO DISPONIBLE
          </a>
          <a href="#colecciones" className="text-sm font-medium transition-colors hover:text-primary">
            COLECCIONES
          </a>
          <a href="#colaboraciones" className="text-sm font-medium transition-colors hover:text-primary">
            COLABORACIONES
          </a>
          <a href="#jc-shirts" className="text-sm font-medium transition-colors hover:text-primary">
            JC SHIRTS
          </a>
          <a href="#accesorios" className="text-sm font-medium transition-colors hover:text-primary">
            ACCESORIOS
          </a>
          <a href="#promociones" className="text-sm font-medium transition-colors hover:text-primary">
            PROMOCIONES
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Buscar">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Carrito de compras">
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
