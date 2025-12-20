import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

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

interface RelatedBrandProductsProps {
  products: BrandProductWithBrand[];
  currentProductId: string;
  brandName: string;
  onProductClick: (product: BrandProductWithBrand) => void;
}

const ProductThumbnail = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-primary/50" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-xs">Error</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
};

export const RelatedBrandProducts = ({ 
  products, 
  currentProductId, 
  brandName,
  onProductClick 
}: RelatedBrandProductsProps) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Filter out current product and get related products
  const relatedProducts = products.filter(p => p.id !== currentProductId).slice(0, 6);

  if (relatedProducts.length === 0) return null;

  const handleAddToCart = (e: React.MouseEvent, product: BrandProductWithBrand) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.image_url,
      collection: product.brands?.name || "Marca",
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

  const handleToggleWishlist = (e: React.MouseEvent, product: BrandProductWithBrand) => {
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.image_url,
      collection: product.brands?.name || "Marca",
      colors: [],
      stock: product.stock || 10,
      description: product.description || "",
      isOnSale: !!product.sale_price,
      originalPrice: product.sale_price ? product.price : undefined,
    });
  };

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <h3 className="text-lg font-bold text-foreground mb-4">
        Más productos de {brandName}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {relatedProducts.map((product) => {
          const hasDiscount = !!product.sale_price;
          const displayPrice = product.sale_price || product.price;
          const isOutOfStock = (product.stock || 0) === 0;
          const inWishlist = isInWishlist(product.id);

          return (
            <div
              key={product.id}
              onClick={() => onProductClick(product)}
              className="group cursor-pointer bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <ProductThumbnail src={product.image_url} alt={product.name} />
                
                {/* Badges */}
                {hasDiscount && (
                  <Badge className="absolute top-2 left-2 bg-destructive text-white text-xs px-2 py-0.5">
                    OFERTA
                  </Badge>
                )}

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <Badge className="bg-destructive text-xs">AGOTADO</Badge>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="absolute top-2 right-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => handleToggleWishlist(e, product)}
                    className={cn(
                      "h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm",
                      inWishlist ? "text-destructive" : "hover:text-primary"
                    )}
                  >
                    <Heart className={cn("h-3 w-3", inWishlist && "fill-current")} />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h4>
                
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-primary text-sm">
                    ${displayPrice}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-muted-foreground line-through">
                      ${product.price}
                    </span>
                  )}
                </div>

                <Button
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={isOutOfStock}
                  size="sm"
                  className="w-full text-xs h-8"
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Agregar
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
