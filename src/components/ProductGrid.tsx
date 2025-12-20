import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, ShoppingCart, Heart, Eye, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";
import { BrandProductModal } from "./BrandProductModal";

// Componente de imagen optimizada con lazy loading y placeholder
const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  isHovered 
}: { 
  src: string; 
  alt: string; 
  className?: string; 
  isHovered?: boolean;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full">
      {/* Placeholder/Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
          </div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Error al cargar</span>
        </div>
      )}
      
      {/* Imagen real */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          className,
          "transition-all duration-500",
          isLoaded ? "opacity-100" : "opacity-0",
          isHovered && "scale-110"
        )}
      />
    </div>
  );
};

interface BrandProductWithBrand {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  image_url: string;
  images: string[] | null;
  description: string | null;
  stock: number | null;
  free_shipping: boolean | null;
  shipping_cost: number | null;
  sizes: string[] | null;
  has_full_set: boolean | null;
  only_cap: boolean | null;
  only_cap_price: number | null;
  brand_id: string;
  brands: {
    name: string;
    slug: string;
  } | null;
}

const ProductGrid = () => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<BrandProductWithBrand | null>(null);
  const queryClient = useQueryClient();

  // Obtener productos de marcas desde Supabase
  const { data: products, isLoading } = useQuery({
    queryKey: ["all-brand-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_products")
        .select(`*, brands(name, slug)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BrandProductWithBrand[];
    },
  });

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel('brand-products-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'brand_products'
        },
        () => {
          // Refrescar los productos cuando hay cambios
          queryClient.invalidateQueries({ queryKey: ["all-brand-products"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Obtener lista única de marcas para filtros
  const availableBrands = useMemo(() => {
    if (!products) return [];
    const brands = products
      .filter(p => p.brands)
      .map(p => p.brands!.name);
    return [...new Set(brands)];
  }, [products]);

  // Filtrar productos por marca
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (selectedBrands.length === 0) return products;
    return products.filter(p => p.brands && selectedBrands.includes(p.brands.name));
  }, [products, selectedBrands]);

  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
  };

  const handleAddToCart = (product: BrandProductWithBrand) => {
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      originalPrice: product.sale_price ? product.price : undefined,
      image: product.image_url,
      images: product.images || [product.image_url],
      colors: [],
      collection: product.brands?.name || "Marcas",
      stock: product.stock || 0,
      description: product.description || "",
      isOnSale: !!product.sale_price,
      shippingCost: product.shipping_cost || 0,
      freeShipping: product.free_shipping || false,
    };
    addItem(cartProduct);
  };

  const handleToggleWishlist = (product: BrandProductWithBrand) => {
    const wishlistProduct = {
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      originalPrice: product.sale_price ? product.price : undefined,
      image: product.image_url,
      images: product.images || [product.image_url],
      colors: [],
      collection: product.brands?.name || "Marcas",
      stock: product.stock || 0,
      description: product.description || "",
      isOnSale: !!product.sale_price,
    };
    toggleWishlist(wishlistProduct);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
          Marcas
        </h4>
        <div className="space-y-2">
          {availableBrands.map((brand) => (
            <label key={brand} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      {selectedBrands.length > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="container px-4 md:px-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Cargando productos...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="productos" className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container px-4 md:px-8">
        <div className="mb-12 text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Todo lo Disponible
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explora nuestra colección completa. Cada gorra está diseñada con atención al detalle y fabricada con los mejores materiales.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-1 w-20 bg-primary rounded-full" />
            <div className="h-1 w-10 bg-primary/50 rounded-full" />
            <div className="h-1 w-5 bg-primary/25 rounded-full" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
              <h3 className="font-heading text-lg font-bold mb-6 text-foreground">Filtros</h3>
              <FilterContent />
            </div>
          </aside>

          {/* Filtros Mobile */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros {selectedBrands.length > 0 && `(${selectedBrands.length})`}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Grid de Productos */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">
                  {products && products.length === 0 
                    ? "No hay productos disponibles. Agrega productos desde el panel de administración de marcas."
                    : "No se encontraron productos con estos filtros"
                  }
                </p>
                {selectedBrands.length > 0 && (
                  <Button onClick={clearFilters} className="mt-4">
                    Limpiar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {filteredProducts.map((product) => {
                  const isHovered = hoveredProduct === product.id;
                  const inWishlist = isInWishlist(product.id);
                  const hasDiscount = !!product.sale_price;
                  const displayPrice = product.sale_price || product.price;
                  const isOutOfStock = (product.stock || 0) === 0;

                  return (
                    <div
                      key={product.id}
                      className="group relative rounded-2xl overflow-hidden animate-scale-in bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      {/* Image Container */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-muted/50 to-card">
                        <OptimizedImage
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          isHovered={isHovered}
                        />
                        
                        {/* Gradient overlay on hover */}
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500",
                          isHovered ? "opacity-100" : "opacity-0"
                        )} />

                        {/* Wishlist Button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleToggleWishlist(product)}
                          className={cn(
                            "absolute top-3 right-3 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 z-10 transition-all duration-300",
                            inWishlist ? "bg-destructive text-white border-destructive" : "hover:bg-primary hover:text-primary-foreground hover:border-primary"
                          )}
                        >
                          <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
                        </Button>

                        {/* Quick View Button - On hover */}
                        <div className={cn(
                          "absolute bottom-0 left-0 right-0 p-4 transition-all duration-500 z-10",
                          isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                        )}>
                          <Button
                            onClick={() => setQuickViewProduct(product)}
                            className="w-full font-heading tracking-wide backdrop-blur-sm"
                            variant="secondary"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            VER DETALLES
                          </Button>
                        </div>
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                          {hasDiscount && (
                            <Badge className="bg-gradient-to-r from-destructive to-orange-500 text-white shadow-lg px-3 py-1.5 font-heading tracking-wide">
                              OFERTA
                            </Badge>
                          )}
                          {product.free_shipping && (
                            <Badge className="bg-green-500 text-white shadow-lg px-3 py-1.5 font-heading tracking-wide">
                              ENVÍO GRATIS
                            </Badge>
                          )}
                        </div>

                        {/* Stock Badge */}
                        {(product.stock || 0) <= 5 && (product.stock || 0) > 0 && (
                          <Badge className="absolute bottom-16 left-3 bg-orange-500/90 text-white shadow-lg backdrop-blur-sm font-medium z-10">
                            ¡Últimas {product.stock}!
                          </Badge>
                        )}
                        
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm z-20">
                            <Badge className="bg-destructive text-destructive-foreground text-lg px-8 py-3 shadow-2xl font-heading tracking-wider">
                              AGOTADO
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div>
                          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
                            {product.brands?.name || "Marca"}
                          </p>
                          <h3 className="font-heading text-lg font-semibold line-clamp-2 transition-colors duration-300 group-hover:text-primary">
                            {product.name}
                          </h3>
                        </div>

                        <div className="flex items-end justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="font-display text-3xl text-foreground">
                              ${displayPrice}
                            </span>
                            {hasDiscount && (
                              <span className="text-sm text-muted-foreground line-through">
                                ${product.price}
                              </span>
                            )}
                          </div>
                          {hasDiscount && (
                            <Badge variant="secondary" className="text-xs font-bold bg-primary/10 text-primary">
                              -{Math.round((1 - (product.sale_price! / product.price)) * 100)}%
                            </Badge>
                          )}
                        </div>

                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={isOutOfStock}
                          className={cn(
                            "w-full py-5 font-heading tracking-wide transition-all duration-500 hover-shine",
                            isHovered && "shadow-lg shadow-primary/25"
                          )}
                        >
                          <ShoppingCart className={cn(
                            "h-4 w-4 mr-2 transition-transform duration-300",
                            isHovered && "-rotate-12"
                          )} />
                          {isOutOfStock ? "AGOTADO" : "AGREGAR"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <BrandProductModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        allBrandProducts={quickViewProduct ? (products || []).filter(p => p.brand_id === quickViewProduct.brand_id) : []}
        onProductChange={setQuickViewProduct}
      />
    </section>
  );
};

export default ProductGrid;