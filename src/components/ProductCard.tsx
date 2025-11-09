import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  return (
    <Card className="group overflow-hidden border-border bg-card transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 animate-fade-in-up hover-lift">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-all duration-700 group-hover:scale-125 group-hover:rotate-2"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isNew && (
            <Badge className="bg-accent text-accent-foreground animate-scale-in animate-pulse-border">NUEVO</Badge>
          )}
          {product.isOnSale && (
            <Badge variant="destructive" className="animate-scale-in animation-delay-100">OFERTA</Badge>
          )}
        </div>
        {product.stock < 10 && product.stock > 0 && (
          <Badge variant="secondary" className="absolute top-2 right-2 animate-slide-in-right animate-pulse-border">
            ¡Últimas {product.stock}!
          </Badge>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20 transition-all duration-300">
            <Badge variant="destructive" className="text-lg px-4 py-2">AGOTADO</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1 transform transition-transform duration-300 group-hover:translate-x-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide transition-colors duration-300 group-hover:text-primary">
            {product.collection}
          </p>
          <h3 className="font-semibold text-lg transition-colors duration-300 group-hover:text-primary">{product.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through transition-all duration-300 group-hover:scale-110">
              ${product.originalPrice.toLocaleString()}
            </span>
          )}
          <span className="text-2xl font-bold text-primary transition-all duration-300 group-hover:scale-110">
            ${product.price.toLocaleString()}
          </span>
        </div>
        <Button
          className="w-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
          variant="secondary"
          disabled={product.stock === 0}
          onClick={() => addItem(product)}
        >
          <ShoppingCart className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
          {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
