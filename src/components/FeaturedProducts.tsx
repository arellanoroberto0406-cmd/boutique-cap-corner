import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Sparkles, Store, ArrowRight, Percent, Flame, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { useState } from "react";

const FeaturedProducts = () => {
  const { addItem } = useCart();
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const { data: newProducts, isLoading: loadingNew } = useQuery({
    queryKey: ["featured-new-products"],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from("products")
        .select(`*, product_images(*)`)
        .eq("is_new", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return products;
    },
  });

  const { data: saleProducts, isLoading: loadingSale } = useQuery({
    queryKey: ["featured-sale-products"],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from("products")
        .select(`*, product_images(*)`)
        .eq("is_on_sale", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return products;
    },
  });

  const { data: brandProducts, isLoading: loadingBrands } = useQuery({
    queryKey: ["featured-brand-products"],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from("brand_products")
        .select(`*, brands(name, slug)`)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return products;
    },
  });

  const handleAddToCart = (product: any, isBrandProduct: boolean = false) => {
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: isBrandProduct ? (product.sale_price || product.price) : product.price,
      image: isBrandProduct ? product.image_url : product.product_images?.[0]?.image_url || "/placeholder.svg",
      description: product.description || "",
      collection: isBrandProduct ? "marcas" : product.collection || "",
    };
    addItem(cartProduct as any);
  };

  const ProductCard = ({ product, isBrandProduct = false, isNew = false, isOnSale = false }: any) => {
    const price = isBrandProduct ? (product.sale_price || product.price) : product.price;
    const originalPrice = isBrandProduct ? product.price : product.original_price;
    const image = isBrandProduct ? product.image_url : product.product_images?.[0]?.image_url || "/placeholder.svg";
    const brandName = isBrandProduct ? product.brands?.name : null;
    const discountPercentage = originalPrice && originalPrice > price 
      ? Math.round(((originalPrice - price) / originalPrice) * 100) 
      : 0;
    const isHovered = hoveredProduct === product.id;

    return (
      <Card 
        className="group relative overflow-hidden border-0 bg-card shadow-lg hover:shadow-2xl transition-all duration-500"
        onMouseEnter={() => setHoveredProduct(product.id)}
        onMouseLeave={() => setHoveredProduct(null)}
      >
        {/* Image Container - Large and prominent */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
          <img
            src={image}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
          
          {/* Overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {isNew && (
              <Badge className="bg-primary text-primary-foreground shadow-lg gap-1.5 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5" />
                Nuevo
              </Badge>
            )}
            {isOnSale && discountPercentage > 0 && (
              <Badge className="bg-destructive text-destructive-foreground shadow-lg font-bold px-3 py-1">
                -{discountPercentage}%
              </Badge>
            )}
            {brandName && (
              <Badge className="bg-gold text-gold-foreground shadow-lg gap-1.5 px-3 py-1">
                <Store className="h-3.5 w-3.5" />
                {brandName}
              </Badge>
            )}
          </div>

          {/* Action buttons on hover */}
          <div className={`absolute bottom-4 left-4 right-4 flex gap-2 transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={() => handleAddToCart(product, isBrandProduct)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-xl"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Agregar</span>
            </button>
            <Link
              to={`/producto/${product.id}`}
              className="p-3 rounded-xl bg-background/90 backdrop-blur-sm text-foreground hover:bg-background transition-colors shadow-xl"
            >
              <Eye className="h-5 w-5" />
            </Link>
          </div>
        </div>
        
        {/* Product Info */}
        <CardContent className="p-5 space-y-3">
          <h3 className="font-heading font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-display font-bold text-primary">${price}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-base text-muted-foreground line-through">${originalPrice}</span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden border-0 shadow-lg">
          <Skeleton className="aspect-[3/4]" />
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, linkTo, accent = false }: { icon: any; title: string; linkTo: string; accent?: boolean }) => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${accent ? 'bg-gradient-to-br from-destructive to-orange-500' : 'bg-primary'}`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl md:text-4xl font-heading font-bold text-foreground">{title}</h2>
      </div>
      <Link 
        to={linkTo} 
        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium group"
      >
        <span className="hidden sm:inline">Ver todos</span>
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );

  const hasNewProducts = newProducts && newProducts.length > 0;
  const hasBrandProducts = brandProducts && brandProducts.length > 0;
  const hasSaleProducts = saleProducts && saleProducts.length > 0;

  if (!loadingNew && !loadingBrands && !loadingSale && !hasNewProducts && !hasBrandProducts && !hasSaleProducts) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 md:px-6 py-12 md:py-20 space-y-16 md:space-y-24">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold tracking-widest uppercase">
          <Flame className="h-5 w-5" />
          Productos Destacados
          <Flame className="h-5 w-5" />
        </div>
        <h1 className="text-4xl md:text-6xl font-display tracking-wide">COLECCIÓN</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Descubre nuestra selección de gorras premium
        </p>
      </div>

      {/* Sale Products - Big and prominent */}
      {(loadingSale || hasSaleProducts) && (
        <div>
          <SectionHeader icon={Percent} title="Ofertas" linkTo="/lo-nuevo" accent />
          {loadingSale ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {saleProducts?.map((product: any) => (
                <ProductCard key={product.id} product={product} isOnSale />
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Products */}
      {(loadingNew || hasNewProducts) && (
        <div>
          <SectionHeader icon={Sparkles} title="Lo Nuevo" linkTo="/lo-nuevo" />
          {loadingNew ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {newProducts?.map((product: any) => (
                <ProductCard key={product.id} product={product} isNew />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Brand Products */}
      {(loadingBrands || hasBrandProducts) && (
        <div>
          <SectionHeader icon={Store} title="Nuestras Marcas" linkTo="/lo-nuevo" />
          {loadingBrands ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {brandProducts?.map((product: any) => (
                <ProductCard key={product.id} product={product} isBrandProduct />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;
