import { useState } from "react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Rating } from "./Rating";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="group relative bg-card rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-border/50 hover:border-primary animate-scale-in hover:-translate-y-2">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-black p-4 product-card-glow">
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onQuickView?.(product)}
            className="transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
          >
            <Eye className="h-4 w-4 mr-1" />
            Vista Rápida
          </Button>
          <Button
            size="sm"
            variant={inWishlist ? "default" : "secondary"}
            onClick={() => toggleWishlist(product)}
            className="transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100"
          >
            <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
          </Button>
        </div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.isNew && (
            <Badge className="bg-primary text-primary-foreground shadow-lg animate-bounce-subtle">
              NUEVO
            </Badge>
          )}
          {product.isOnSale && (
            <Badge className="bg-destructive text-destructive-foreground shadow-lg animate-pulse-border">
              OFERTA
            </Badge>
          )}
        </div>

        {/* Stock Badge */}
        {product.stock <= 5 && product.stock > 0 && (
          <Badge className="absolute top-4 right-4 bg-orange-500 text-white shadow-lg animate-bounce-subtle">
            ¡Últimas {product.stock}!
          </Badge>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-20">
            <Badge className="bg-destructive text-destructive-foreground text-lg px-6 py-2 shadow-xl">
              AGOTADO
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1 transition-colors duration-300 group-hover:text-primary">
            {product.collection}
          </p>
          <h3 className="text-xl font-bold mb-2 line-clamp-2 transition-colors duration-300 group-hover:text-primary">
            {product.name}
          </h3>
          {product.rating && (
            <div className="flex items-center gap-2 mb-2">
              <Rating rating={product.rating} size="sm" />
              {product.reviewCount && (
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary transition-all duration-300 group-hover:scale-105">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through transition-all duration-300">
              ${product.originalPrice}
            </span>
          )}
        </div>

        <Button
          onClick={() => addItem(product)}
          disabled={product.stock === 0}
          className="w-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl brand-glow"
        >
          <ShoppingCart className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
          {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
