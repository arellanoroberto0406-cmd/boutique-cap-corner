import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { products } from "@/data/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Heart, ChevronLeft, Share2, Truck, RotateCcw, Shield, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Rating } from "@/components/Rating";
import ProductCard from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import { FreeShippingBanner } from "@/components/FreeShippingBanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);
  const [selectedColor, setSelectedColor] = useState<string>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (product) {
      const productSchema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.images || [product.image],
        "description": product.description,
        "sku": `EH-${product.id}`,
        "brand": {
          "@type": "Brand",
          "name": "Élite HATS"
        },
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": "MXN",
          "price": product.price,
          "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        },
        ...(product.rating && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "reviewCount": product.reviewCount || 0
          }
        })
      };

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(productSchema);
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [product]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product!, selectedColor);
    }
    setShowAddToCartModal(true);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => navigate("/carrito"), 500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
          <Button onClick={() => navigate("/")}>Volver a la tienda</Button>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.collection === product.collection && p.id !== product.id)
    .slice(0, 4);

  const images = product.images || [product.image];
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="min-h-screen">
      <FreeShippingBanner />
      <Header />

      {/* Sticky Buy Bar - Mobile */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-4 transition-transform duration-300 lg:hidden",
          showStickyBar ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg">${product.price}</p>
            <p className="text-xs text-muted-foreground">
              {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
            </p>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            size="lg"
            className="flex-1"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        </div>
      </div>

      {/* Add to Cart Modal */}
      <Dialog open={showAddToCartModal} onOpenChange={setShowAddToCartModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Producto agregado al carrito</DialogTitle>
          </DialogHeader>
          <div className="flex gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                Cantidad: {quantity}
              </p>
              <p className="text-lg font-bold text-primary mt-1">
                ${product.price * quantity}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddToCartModal(false)}
            >
              Seguir comprando
            </Button>
            <Button className="flex-1" onClick={() => navigate("/carrito")}>
              Ir al carrito
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <main className="container px-4 py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a la tienda
        </button>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Images with Zoom */}
          <div className="space-y-4">
            <div
              className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-zoom-in"
              onMouseEnter={() => setImageZoom(true)}
              onMouseLeave={() => setImageZoom(false)}
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className={cn(
                  "w-full h-full object-cover transition-transform duration-300",
                  imageZoom && "scale-125"
                )}
              />
              {product.isNew && (
                <Badge className="absolute top-4 left-4 bg-primary">NUEVO</Badge>
              )}
              {product.isOnSale && (
                <Badge className="absolute top-4 right-4 bg-destructive">OFERTA</Badge>
              )}
              {product.id === "1" && (
                <Badge className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-yellow-400 text-white animate-pulse">
                  LIMITED EDITION
                </Badge>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "aspect-square rounded-lg overflow-hidden border-2 transition-all",
                      selectedImage === idx
                        ? "border-primary"
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-2">{product.collection}</p>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  className="shrink-0"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              
              {product.rating && (
                <div className="flex items-center gap-3 mb-4">
                  <Rating rating={product.rating} size="lg" showValue />
                  {product.reviewCount && (
                    <span className="text-muted-foreground">
                      ({product.reviewCount} reseñas)
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">
                ${product.price.toLocaleString('es-MX')}
              </span>
              {product.originalPrice && (
                <span className="text-2xl text-muted-foreground line-through">
                  ${product.originalPrice.toLocaleString('es-MX')}
                </span>
              )}
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Technical Info */}
            <div className="p-4 rounded-lg bg-muted/30 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">SKU:</span>
                <span className="font-medium">EH-{product.id}</span>
              </div>
              {product.id === "1" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Producción:</span>
                    <span className="font-medium">50 unidades</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Peso:</span>
                    <span className="font-medium">120 g</span>
                  </div>
                </>
              )}
            </div>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div>
                <p className="font-semibold mb-3">Colores disponibles:</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 transition-all font-medium",
                        selectedColor === color
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock & Quantity */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                {product.stock > 0 ? (
                  <p className={cn(
                    "font-semibold",
                    product.stock < 5 ? "text-destructive" : "text-green-600"
                  )}>
                    {product.stock < 5 
                      ? `⚠️ Últimas ${product.stock} piezas` 
                      : `✓ En stock - ${product.stock} unidades disponibles`}
                  </p>
                ) : (
                  <p className="text-destructive font-semibold">Agotado</p>
                )}
              </div>

              {product.stock > 0 && (
                <div className="flex items-center gap-4">
                  <span className="font-medium">Cantidad:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 text-lg h-14"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Agregar al Carrito
                </Button>
                <Button
                  size="lg"
                  variant={inWishlist ? "default" : "outline"}
                  className="h-14 px-6"
                  onClick={() => toggleWishlist(product)}
                >
                  <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
                </Button>
              </div>
              <Button
                size="lg"
                variant="secondary"
                className="w-full text-lg h-14"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                Comprar Ahora
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t space-y-3">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Envío nacional 48–72 hrs</p>
                  <p className="text-sm text-muted-foreground">
                    Envío internacional: 7–15 días
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Devolución 7 días</p>
                  <p className="text-sm text-muted-foreground">
                    Sin usar, con etiqueta original
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Pago 100% seguro</p>
                  <p className="text-sm text-muted-foreground">
                    Tarjeta de crédito y PayPal
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="pt-6 border-t">
                <p className="font-semibold mb-3">Características:</p>
                <ul className="space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="description">Descripción</TabsTrigger>
            <TabsTrigger value="materials">Materiales</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas ({product.reviewCount || 0})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <div className="prose max-w-none">
              <p className="text-muted-foreground leading-relaxed text-lg">
                {product.description}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="materials" className="mt-6">
            <div className="prose max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {product.materials || "Fabricada con materiales de alta calidad, diseñada para durar y brindar máxima comodidad."}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{review.userName}</p>
                        <p className="text-sm text-muted-foreground">{review.date}</p>
                      </div>
                      <Rating rating={review.rating} />
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aún no hay reseñas para este producto.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-center">También te puede interesar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
