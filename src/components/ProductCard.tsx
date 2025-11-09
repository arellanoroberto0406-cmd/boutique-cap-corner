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
    <Card className="group overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <Badge className="bg-accent text-accent-foreground">NUEVO</Badge>
          )}
          {product.isOnSale && (
            <Badge variant="destructive">OFERTA</Badge>
          )}
        </div>
        {product.stock < 10 && product.stock > 0 && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            ¡Últimas {product.stock}!
          </Badge>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive">AGOTADO</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {product.collection}
          </p>
          <h3 className="font-semibold text-lg">{product.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice.toLocaleString()}
            </span>
          )}
          <span className="text-2xl font-bold text-primary">
            ${product.price.toLocaleString()}
          </span>
        </div>
        <Button
          className="w-full"
          variant="secondary"
          disabled={product.stock === 0}
          onClick={() => addItem(product)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
