import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { products } from "@/data/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Heart, ChevronLeft, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Rating } from "@/components/Rating";
import ProductCard from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import { FreeShippingBanner } from "@/components/FreeShippingBanner";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);
  const [selectedColor, setSelectedColor] = useState<string>();
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

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
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={images[selectedImage]}
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
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              
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
              <span className="text-4xl font-bold text-primary">${product.price}</span>
              {product.originalPrice && (
                <span className="text-2xl text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description}
            </p>

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

            {/* Stock */}
            <div className="p-4 rounded-lg bg-muted/50">
              {product.stock > 0 ? (
                <p className="text-green-600 font-semibold">
                  ✓ En stock - {product.stock} unidades disponibles
                </p>
              ) : (
                <p className="text-destructive font-semibold">Agotado</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 text-lg h-14"
                onClick={() => addItem(product, selectedColor)}
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
