import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { products } from "@/data/products";
import { useNavigate } from "react-router-dom";
import { Product } from "@/types/product";
import brandBassPro from "@/assets/brand-bass-pro.jpg";
import brandJC from "@/assets/brand-jc-new.jpg";
import brandRanchCorral from "@/assets/brand-ranch-corral.jpg";
import brandFino from "@/assets/brand-fino.jpg";
import brand31 from "@/assets/brand-31.jpg";

const brandImages: { [key: string]: string } = {
  "Bass Pro Shops": brandBassPro,
  "JC Hats": brandJC,
  "Ranch Corral": brandRanchCorral,
  "Gallo Fino": brandFino,
  "Marca 31": brand31,
  "Barba Hats": brandJC, // temporal
};

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length > 0) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.collection.toLowerCase().includes(query.toLowerCase()) ||
        product.colors.some((color) => color.toLowerCase().includes(query.toLowerCase()))
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50 animate-fade-in">
          <div className="p-2">
            <p className="text-sm text-muted-foreground px-3 py-2">
              {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
            </p>
            {results.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors text-left"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  {brandImages[product.collection] && (
                    <img
                      src={brandImages[product.collection]}
                      alt={product.collection}
                      className="absolute -bottom-1 -right-1 w-8 h-8 object-contain rounded-full border-2 border-background bg-background"
                    />
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
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg p-4 z-50 animate-fade-in">
          <p className="text-sm text-muted-foreground text-center">
            No se encontraron resultados para "{query}"
          </p>
        </div>
      )}
    </div>
  );
};
