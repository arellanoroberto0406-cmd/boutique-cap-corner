import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { useBrands, Brand, BrandProduct } from "@/hooks/useBrands";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";

const DynamicBrandPage = () => {
  const { brandSlug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { brands, loading } = useBrands();
  const [brand, setBrand] = useState<Brand | null>(null);

  useEffect(() => {
    if (brandSlug && brands.length > 0) {
      const foundBrand = brands.find(b => b.path === `/${brandSlug}` || b.slug === brandSlug);
      setBrand(foundBrand || null);
    }
  }, [brandSlug, brands]);

  const handleAddToCart = (product: BrandProduct) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.image_url,
      collection: brand?.name || "Marca",
      colors: [],
      isNew: false,
      isOnSale: !!product.sale_price,
      originalPrice: product.sale_price ? product.price : undefined,
      stock: product.stock || 10,
      description: product.description || "",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-background">
        <PromoBanner />
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Marca no encontrada</h1>
          <p className="text-muted-foreground mb-8">La marca que buscas no existe o ha sido eliminada.</p>
          <Button onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PromoBanner />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header de la marca */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-black rounded-xl flex items-center justify-center p-3 brand-glow">
            <img 
              src={brand.logo_url} 
              alt={brand.name} 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{brand.name}</h1>
            <p className="text-muted-foreground mt-1">{brand.products.length} productos disponibles</p>
          </div>
        </div>

        {/* Grid de productos */}
        {brand.products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No hay productos disponibles en esta marca todavía.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {brand.products.map((product) => (
              <div 
                key={product.id}
                className="group relative bg-card rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-border/50 hover:border-primary"
              >
                {/* Imagen */}
                <div className="relative aspect-square overflow-hidden bg-black p-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.sale_price && (
                      <Badge className="bg-destructive text-destructive-foreground">
                        OFERTA
                      </Badge>
                    )}
                    {product.free_shipping && (
                      <Badge className="bg-green-600 text-white">
                        Envío Gratis
                      </Badge>
                    )}
                  </div>

                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                      <Badge className="bg-destructive text-destructive-foreground text-lg px-6 py-2">
                        AGOTADO
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-primary">
                      ${product.sale_price || product.price}
                    </span>
                    {product.sale_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.price}
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full"
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.stock === 0 ? "Agotado" : "Agregar"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DynamicBrandPage;
