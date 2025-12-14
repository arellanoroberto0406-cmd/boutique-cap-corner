import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { useBrands, Brand, BrandProduct } from "@/hooks/useBrands";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, Heart, Eye, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BrandProductModal } from "@/components/BrandProductModal";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Imagen optimizada con skeleton
const OptimizedImage = ({ src, alt, className, isHovered }: { src: string; alt: string; className?: string; isHovered?: boolean }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Error</span>
        </div>
      )}
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

// Convertir BrandProduct a formato del modal
const convertToModalProduct = (product: BrandProduct, brandName: string) => ({
  ...product,
  brands: { name: brandName, slug: brandName.toLowerCase().replace(/\s+/g, '-') }
});

const DynamicBrandPage = () => {
  const { brandSlug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { brands, loading } = useBrands();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (brandSlug && brands.length > 0) {
      const foundBrand = brands.find(b => b.path === `/${brandSlug}` || b.slug === brandSlug);
      setBrand(foundBrand || null);
    }
  }, [brandSlug, brands]);

  // Suscripción realtime
  useEffect(() => {
    const channel = supabase
      .channel('brand-products-page-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'brand_products' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["brands-with-products"] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const handleAddToCart = (product: BrandProduct) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.image_url,
      collection: brand?.name || "Marca",
      colors: [],
      isNew: false,
      isOnSale: !!product.sale_price,
      originalPrice: product.sale_price ? product.price : undefined,
      stock: product.stock || 10,
      description: product.description || "",
      shippingCost: product.shipping_cost || 0,
      freeShipping: product.free_shipping || false,
    });
  };

  const handleToggleWishlist = (product: BrandProduct) => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.image_url,
      collection: brand?.name || "Marca",
      colors: [],
      stock: product.stock || 10,
      description: product.description || "",
      isOnSale: !!product.sale_price,
      originalPrice: product.sale_price ? product.price : undefined,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-background">
        <PromoBanner />
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Marca no encontrada</h1>
          <p className="text-muted-foreground mb-8">La marca que buscas no existe o ha sido eliminada.</p>
          <Button onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PromoBanner />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header de la marca */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-black rounded-xl flex items-center justify-center p-3 brand-glow">
            <img 
              src={brand.logo_url} 
              alt={brand.name} 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{brand.name}</h1>
            <p className="text-muted-foreground mt-1">{brand.products.length} productos disponibles</p>
          </div>
        </div>

        {/* Grid de productos */}
        {brand.products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No hay productos disponibles en esta marca todavía.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {brand.products.map((product) => {
              const isHovered = hoveredProduct === product.id;
              const inWishlist = isInWishlist(product.id);
              const hasDiscount = !!product.sale_price;
              const displayPrice = product.sale_price || product.price;
              const isOutOfStock = (product.stock || 0) === 0;

              return (
                <div 
                  key={product.id}
                  className="group relative bg-card rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-border/50 hover:border-primary/30"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Imagen */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-card">
                    <OptimizedImage
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      isHovered={isHovered}
                    />
                    
                    {/* Overlay con botón ver detalles */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500",
                      isHovered ? "opacity-100" : "opacity-0"
                    )} />

                    {/* Botón Wishlist */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleToggleWishlist(product)}
                      className={cn(
                        "absolute top-3 right-3 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm z-10",
                        inWishlist ? "bg-destructive text-white" : "hover:bg-primary hover:text-primary-foreground"
                      )}
                    >
                      <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
                    </Button>

                    {/* Botón ver detalles */}
                    <div className={cn(
                      "absolute bottom-0 left-0 right-0 p-4 transition-all duration-500 z-10",
                      isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                    )}>
                      <Button
                        onClick={() => setQuickViewProduct(convertToModalProduct(product, brand.name))}
                        className="w-full font-heading tracking-wide"
                        variant="secondary"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        VER DETALLES
                      </Button>
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                      {hasDiscount && (
                        <Badge className="bg-gradient-to-r from-destructive to-orange-500 text-white shadow-lg">
                          OFERTA
                        </Badge>
                      )}
                      {product.free_shipping && (
                        <Badge className="bg-green-500 text-white shadow-lg">
                          ENVÍO GRATIS
                        </Badge>
                      )}
                    </div>

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm z-20">
                        <Badge className="bg-destructive text-destructive-foreground text-lg px-6 py-2">
                          AGOTADO
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        ${displayPrice}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.price}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className="w-full"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {isOutOfStock ? "Agotado" : "Agregar"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* Modal de detalles */}
      <BrandProductModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

export default DynamicBrandPage;
