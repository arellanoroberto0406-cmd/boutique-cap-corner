import { useState } from "react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Eye, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Rating } from "./Rating";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  priority?: boolean;
}

const ProductCard = ({ product, onQuickView, priority = false }: ProductCardProps) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inWishlist = isInWishlist(product.id);

  return (
    <div 
      className="group relative rounded-2xl overflow-hidden animate-scale-in bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-muted/50 to-card">
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}
        <img
          src={product.image}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            isHovered && "scale-110"
          )}
        />
        
        {/* Gradient overlay on hover */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500",
          isHovered ? "opacity-100" : "opacity-0"
        )} />

        {/* Wishlist Button - Always visible */}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => toggleWishlist(product)}
          className={cn(
            "absolute top-3 right-3 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 z-10 transition-all duration-300",
            inWishlist ? "bg-destructive text-white border-destructive" : "hover:bg-primary hover:text-primary-foreground hover:border-primary"
          )}
        >
          <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
        </Button>
        
        {/* Quick Actions - Bottom on hover */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 p-4 transition-all duration-500",
          isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}>
          <Button
            onClick={() => onQuickView?.(product)}
            className="w-full font-heading tracking-wide backdrop-blur-sm"
            variant="secondary"
          >
            <Eye className="h-4 w-4 mr-2" />
            VISTA RÁPIDA
          </Button>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.isNew && (
            <Badge className="bg-primary text-primary-foreground shadow-lg px-3 py-1.5 font-heading tracking-wide flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              NUEVO
            </Badge>
          )}
          {product.isOnSale && (
            <Badge className="bg-gradient-to-r from-destructive to-orange-500 text-white shadow-lg px-3 py-1.5 font-heading tracking-wide">
              OFERTA
            </Badge>
          )}
        </div>

        {/* Stock Badge */}
        {product.stock <= 5 && product.stock > 0 && (
          <Badge className="absolute bottom-3 left-3 bg-orange-500/90 text-white shadow-lg backdrop-blur-sm font-medium z-10">
            ¡Últimas {product.stock}!
          </Badge>
        )}
        
        {product.stock === 0 && (
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
            {product.collection}
          </p>
          <h3 className="font-heading text-lg font-semibold line-clamp-2 transition-colors duration-300 group-hover:text-primary">
            {product.name}
          </h3>
          {product.rating && (
            <div className="flex items-center gap-2 mt-2">
              <Rating rating={product.rating} size="sm" />
              {product.reviewCount && (
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl text-foreground">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          {product.originalPrice && (
            <Badge variant="secondary" className="text-xs font-bold bg-primary/10 text-primary">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </Badge>
          )}
        </div>

        <Button
          onClick={() => addItem(product)}
          disabled={product.stock === 0}
          className={cn(
            "w-full py-5 font-heading tracking-wide transition-all duration-500 hover-shine",
            isHovered && "shadow-lg shadow-primary/25"
          )}
        >
          <ShoppingCart className={cn(
            "h-4 w-4 mr-2 transition-transform duration-300",
            isHovered && "-rotate-12"
          )} />
          {product.stock === 0 ? "AGOTADO" : "AGREGAR"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;