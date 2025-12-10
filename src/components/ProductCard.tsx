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
      className="group relative premium-card rounded-2xl overflow-hidden animate-scale-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-background to-card">
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
            isHovered && "scale-110 rotate-1"
          )}
        />
        
        {/* Gradient overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent transition-opacity duration-300",
          isHovered ? "opacity-80" : "opacity-0"
        )} />
        
        {/* Quick Actions Overlay */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center gap-3 transition-all duration-500",
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => onQuickView?.(product)}
            className={cn(
              "transform transition-all duration-300 hover-glow",
              isHovered ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
            style={{ transitionDelay: '0.1s' }}
          >
            <Eye className="h-5 w-5 mr-2" />
            Vista Rápida
          </Button>
          <Button
            size="icon"
            variant={inWishlist ? "default" : "secondary"}
            onClick={() => toggleWishlist(product)}
            className={cn(
              "h-12 w-12 rounded-full transform transition-all duration-300",
              isHovered ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
              inWishlist && "bg-destructive hover:bg-destructive/90"
            )}
            style={{ transitionDelay: '0.15s' }}
          >
            <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
          </Button>
        </div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.isNew && (
            <Badge className="bg-primary text-primary-foreground shadow-lg px-3 py-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              NUEVO
            </Badge>
          )}
          {product.isOnSale && (
            <Badge className="bg-gradient-to-r from-destructive to-orange-500 text-white shadow-lg px-3 py-1 animate-pulse">
              OFERTA
            </Badge>
          )}
        </div>

        {/* Stock Badge */}
        {product.stock <= 5 && product.stock > 0 && (
          <Badge className="absolute top-4 right-4 bg-orange-500/90 text-white shadow-lg backdrop-blur-sm">
            ¡Últimas {product.stock}!
          </Badge>
        )}
        
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-20">
            <Badge className="bg-destructive text-destructive-foreground text-lg px-8 py-3 shadow-2xl">
              AGOTADO
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <p className={cn(
            "text-sm font-medium mb-1 transition-all duration-300",
            isHovered ? "text-primary" : "text-muted-foreground"
          )}>
            {product.collection}
          </p>
          <h3 className="text-xl font-bold line-clamp-2 transition-colors duration-300 group-hover:text-primary">
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

        <div className="flex items-baseline gap-3">
          <span className={cn(
            "text-3xl font-bold transition-all duration-300",
            isHovered ? "text-primary scale-105" : "text-foreground"
          )}>
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
          {product.originalPrice && (
            <Badge variant="secondary" className="text-xs">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </Badge>
          )}
        </div>

        <Button
          onClick={() => addItem(product)}
          disabled={product.stock === 0}
          className={cn(
            "w-full py-6 text-base font-semibold transition-all duration-500 hover-shine",
            isHovered && "shadow-lg shadow-primary/25"
          )}
        >
          <ShoppingCart className={cn(
            "h-5 w-5 mr-2 transition-transform duration-300",
            isHovered && "rotate-12"
          )} />
          {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;