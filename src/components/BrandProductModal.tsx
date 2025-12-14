import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, Truck, Package, Ruler, X, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

// Componente de imagen optimizada para el modal
const ModalImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset state cuando cambia la imagen
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <div className="relative w-full h-full">
      {/* Skeleton mientras carga */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse flex items-center justify-center z-10">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">Error al cargar imagen</span>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          className,
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
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

interface BrandProductModalProps {
  product: BrandProductWithBrand | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BrandProductModal = ({ product, isOpen, onClose }: BrandProductModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  // Obtener todas las imágenes
  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image_url];

  const handleAddToCart = () => {
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      originalPrice: product.sale_price ? product.price : undefined,
      image: product.image_url,
      images: allImages,
      colors: [],
      collection: product.brands?.name || "Marcas",
      stock: product.stock || 0,
      description: product.description || "",
      isOnSale: !!product.sale_price,
    };
    addItem(cartProduct, selectedSize || undefined);
    onClose();
  };

  const handleToggleWishlist = () => {
    const wishlistProduct = {
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      originalPrice: product.sale_price ? product.price : undefined,
      image: product.image_url,
      images: allImages,
      colors: [],
      collection: product.brands?.name || "Marcas",
      stock: product.stock || 0,
      description: product.description || "",
      isOnSale: !!product.sale_price,
    };
    toggleWishlist(wishlistProduct);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const inWishlist = isInWishlist(product.id);
  const hasDiscount = !!product.sale_price;
  const displayPrice = product.sale_price || product.price;
  const isOutOfStock = (product.stock || 0) === 0;
  const discountPercentage = hasDiscount 
    ? Math.round((1 - (product.sale_price! / product.price)) * 100) 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="relative bg-muted">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden">
              <ModalImage
                src={allImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {hasDiscount && (
                  <Badge className="bg-gradient-to-r from-destructive to-orange-500 text-white shadow-lg px-3 py-1.5">
                    -{discountPercentage}% OFERTA
                  </Badge>
                )}
                {product.free_shipping && (
                  <Badge className="bg-green-500 text-white shadow-lg px-3 py-1.5">
                    ENVÍO GRATIS
                  </Badge>
                )}
              </div>

              {/* Image counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                      currentImageIndex === index 
                        ? "border-primary ring-2 ring-primary/30" 
                        : "border-transparent hover:border-primary/50"
                    )}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 flex flex-col">
            <DialogHeader className="text-left">
              <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">
                {product.brands?.name || "Marca"}
              </p>
              <DialogTitle className="text-2xl font-bold">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-4xl font-bold text-primary">
                ${displayPrice}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.price}
                  </span>
                  <Badge variant="secondary" className="text-sm font-bold bg-primary/10 text-primary">
                    Ahorras ${(product.price - product.sale_price!).toFixed(0)}
                  </Badge>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Descripción
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Tallas disponibles
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all",
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50 bg-card"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Options */}
            {(product.has_full_set || product.only_cap) && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Opciones del producto
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {product.has_full_set && (
                    <p>✓ Disponible en set completo</p>
                  )}
                  {product.only_cap && product.only_cap_price && (
                    <p>✓ Solo gorra disponible: <span className="font-semibold text-foreground">${product.only_cap_price}</span></p>
                  )}
                </div>
              </div>
            )}

            {/* Shipping Info */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Información de envío
              </h4>
              {product.free_shipping ? (
                <div className="flex items-center gap-2 text-green-600">
                  <span className="text-lg">🚚</span>
                  <span className="font-medium">¡Envío GRATIS a todo México!</span>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Costo de envío: <span className="font-semibold text-foreground">${product.shipping_cost || 0}</span></p>
                  <p className="text-xs">El envío se calcula según tu ubicación</p>
                </div>
              )}
            </div>

            {/* Stock */}
            <div className="mt-4">
              {isOutOfStock ? (
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Producto agotado
                </p>
              ) : (product.stock || 0) <= 5 ? (
                <p className="text-sm text-orange-500 font-medium">
                  ⚡ ¡Solo quedan {product.stock} unidades!
                </p>
              ) : (
                <p className="text-sm text-green-600 font-medium">
                  ✓ En stock ({product.stock} disponibles)
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-auto pt-6">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-6 text-lg font-heading tracking-wide"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isOutOfStock ? "Agotado" : "Agregar al Carrito"}
              </Button>
              <Button
                variant={inWishlist ? "default" : "outline"}
                size="lg"
                onClick={handleToggleWishlist}
                className="py-6"
              >
                <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};