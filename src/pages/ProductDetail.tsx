import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { products } from "@/data/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, ChevronLeft, Share2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import { PromoBanner } from "@/components/PromoBanner";
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
      document.title = `${product.name} - Élite HATS`;
      
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

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedColor);
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
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    }
  };

  const relatedProducts = products
    .filter((p) => p.collection === product.collection && p.id !== product.id)
    .slice(0, 4);

  const images = product.images || [product.image];
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="min-h-screen">
      <PromoBanner />
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
            <p className="font-bold text-lg">${product.price.toLocaleString('es-MX')}</p>
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
                ${(product.price * quantity).toLocaleString('es-MX')}
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
              Ver carrito
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <main className="container max-w-5xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a la tienda
        </button>

        {/* Product Details - Centered Layout */}
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Main Product Image */}
          <div className="space-y-4">
            <div
              className="relative w-full aspect-square rounded-lg overflow-hidden bg-card cursor-zoom-in"
              onMouseEnter={() => setImageZoom(true)}
              onMouseLeave={() => setImageZoom(false)}
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className={cn(
                  "w-full h-full object-cover transition-transform duration-500",
                  imageZoom && "scale-110"
                )}
              />
            </div>
            
            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                      selectedImage === idx
                        ? "border-foreground"
                        : "border-border opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Centered */}
          <div className="text-center space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">
                {product.collection}
              </p>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline justify-center gap-3">
              <span className="text-2xl md:text-4xl font-bold">
                ${product.price.toLocaleString('es-MX')}
              </span>
              {product.originalPrice && (
                <span className="text-xl md:text-2xl text-muted-foreground line-through">
                  ${product.originalPrice.toLocaleString('es-MX')}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Los gastos de envío se calculan en la pantalla de pagos.
            </p>

            {/* Colors - Select Dropdown */}
            {product.colors.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Variante</p>
                <select
                  value={selectedColor || product.colors[0]}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full max-w-xs mx-auto px-4 py-3 rounded-lg border border-border bg-background text-foreground"
                >
                  {product.colors.map((color) => (
                    <option key={color} value={color}>
                      {color} - ${product.price.toLocaleString('es-MX')} MXN
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 max-w-md mx-auto">
              <Button
                size="lg"
                className="w-full text-base h-12 uppercase tracking-wide"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                Agregar al carrito
              </Button>
              
              <Button
                size="lg"
                variant="secondary"
                className="w-full text-base h-12 uppercase tracking-wide"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                Comprar ahora
              </Button>

              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleWishlist(product)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Heart className={cn("h-4 w-4 mr-2", inWishlist && "fill-current")} />
                  {inWishlist ? "En favoritos" : "Agregar a favoritos"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="max-w-3xl mx-auto mt-16 mb-16 text-center space-y-6">
          <h2 className="text-2xl font-bold">Descripción</h2>
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
          {product.materials && (
            <div className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Materiales y Cuidado</h3>
              <p className="text-sm text-muted-foreground">{product.materials}</p>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              También te puede interesar
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
