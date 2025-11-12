import { useState } from "react";
import { Product } from "@/types/product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Rating } from "./Rating";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
  const [selectedColor, setSelectedColor] = useState<string>();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product, selectedColor);
  };

  const handleViewDetails = () => {
    navigate(`/producto/${product.id}`);
    onClose();
  };

  const inWishlist = isInWishlist(product.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isNew && (
              <Badge className="absolute top-4 left-4 bg-primary">NUEVO</Badge>
            )}
            {product.isOnSale && (
              <Badge className="absolute top-4 right-4 bg-destructive">OFERTA</Badge>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{product.collection}</p>
              <div className="flex items-center gap-2 mb-2">
                {product.rating && (
                  <>
                    <Rating rating={product.rating} showValue />
                    {product.reviewCount && (
                      <span className="text-sm text-muted-foreground">
                        ({product.reviewCount} reseñas)
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">${product.price}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Colores disponibles:</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm border transition-all",
                        selectedColor === color
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <div>
              {product.stock > 0 ? (
                <p className="text-sm text-green-600 font-medium">
                  ✓ En stock ({product.stock} disponibles)
                </p>
              ) : (
                <p className="text-sm text-destructive font-medium">Agotado</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Agregar al Carrito
              </Button>
              <Button
                variant={inWishlist ? "default" : "outline"}
                size="lg"
                onClick={() => toggleWishlist(product)}
              >
                <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
              </Button>
            </div>

            <Button variant="ghost" onClick={handleViewDetails} className="w-full">
              Ver todos los detalles
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
