import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { products } from "@/data/products";
import { useNavigate } from "react-router-dom";
import { Product } from "@/types/product";
import brandBassPro from "@/assets/brand-bass-pro-new.png";
import brandJC from "@/assets/brand-jc-new.png";
import brandRanchCorral from "@/assets/brand-ranch-corral-new.png";
import brandFino from "@/assets/brand-fino-new.png";
import brand31 from "@/assets/brand-31-new.png";
import brandBarba from "@/assets/brand-barba-new.png";
import brandDandy from "@/assets/brand-dandy.png";

type Brand = { name: string; image: string; path?: string };

const brands: Brand[] = [
  { name: "Bass Pro Shops", image: brandBassPro, path: "/bass-pro-shops" },
  { name: "JC Hats", image: brandJC, path: "/jc-hats" },
  { name: "Ranch Corral", image: brandRanchCorral, path: "/ranch-corral" },
  { name: "Barba Hats", image: brandBarba, path: "/barba-hats" },
  { name: "Gallo Fino", image: brandFino, path: "/gallo-fino" },
  { name: "Marca 31", image: brand31, path: "/marca-31" },
  { name: "Dandy Hats", image: brandDandy, path: "/dandy-hats" },
];

const brandImages: { [key: string]: string } = Object.fromEntries(brands.map(b => [b.name, b.image]));

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const brandMatches: Brand[] = query
    ? query.toLowerCase() === "marcas"
      ? brands // Mostrar todas las marcas si busca "marcas"
      : brands.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  useEffect(() => {
    if (query.length > 0) {
      const queryLower = query.toLowerCase();
      
      // Si busca "productos", mostrar todos los productos
      if (queryLower === "productos") {
        setResults(products);
        setIsOpen(true);
        return;
      }
      
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(queryLower) ||
        product.collection.toLowerCase().includes(queryLower) ||
        product.colors.some((color) => color.toLowerCase().includes(queryLower))
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductClick = (productId: string) => {
    navigate(`/producto/${productId}`);
    setQuery("");
    setIsOpen(false);
  };

  const handleBrandClick = (brand: Brand) => {
    if (brand.path) navigate(brand.path);
    setQuery("");
    setIsOpen(false);
  };
  const highlightMatch = (text: string, query: string) => {
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? 
            <mark key={i} className="bg-primary/20 text-primary font-medium">{part}</mark> : 
            part
        )}
      </span>
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-all duration-300 hover:text-foreground hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] cursor-pointer" />
        <Input
          type="text"
          placeholder="Buscar gorras..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (brandMatches.length > 0 || results.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50 animate-fade-in [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/20 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-foreground/80 [scrollbar-width:thin] [scrollbar-color:hsl(var(--foreground))_hsl(var(--muted)/0.2)]">
          <div className="p-2 space-y-2">
            {brandMatches.length > 0 && (
              <div>
                <p className="text-xs uppercase text-muted-foreground px-3 py-2">Marcas</p>
                {brandMatches.map((brand) => (
                  <button
                    key={brand.name}
                    onClick={() => handleBrandClick(brand)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors text-left group"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-card/50 border border-border/40 shadow-sm group-hover:shadow-md group-hover:border-foreground/20 transition-all">
                      <img src={brand.image} alt={brand.name} className="w-full h-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{highlightMatch(brand.name, query)}</p>
                      <p className="text-xs text-muted-foreground">Ver productos de esta marca</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.length > 0 && (
              <div>
                <p className="text-xs uppercase text-muted-foreground px-3 py-2">Productos</p>
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors text-left group"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-card border border-border/40 shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      {brandImages[product.collection] && (
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-background overflow-hidden">
                          <img
                            src={brandImages[product.collection]}
                            alt={product.collection}
                            className="w-full h-full object-contain p-0.5"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {highlightMatch(product.name, query)}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{product.collection}</span>
                      </div>
                    </div>
                    <p className="font-semibold text-primary">${product.price}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && query && results.length === 0 && brandMatches.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg p-4 z-50 animate-fade-in">
          <p className="text-sm text-muted-foreground text-center">
            No se encontraron resultados para "{query}"
          </p>
        </div>
      )}
    </div>
  );
};
