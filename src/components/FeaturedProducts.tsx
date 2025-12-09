import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Sparkles, Clock, Store, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

const FeaturedProducts = () => {
  const { addItem } = useCart();

  // Productos marcados como nuevos
  const { data: newProducts, isLoading: loadingNew } = useQuery({
    queryKey: ["featured-new-products"],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from("products")
        .select(`*, product_images(*)`)
        .eq("is_new", true)
        .order("created_at", { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return products;
    },
  });

  // Productos recientes (últimos 30 días)
  const { data: recentProducts, isLoading: loadingRecent } = useQuery({
    queryKey: ["featured-recent-products"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: products, error } = await supabase
        .from("products")
        .select(`*, product_images(*)`)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .eq("is_new", false)
        .order("created_at", { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return products;
    },
  });

  // Últimas gorras de marcas
  const { data: brandProducts, isLoading: loadingBrands } = useQuery({
    queryKey: ["featured-brand-products"],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from("brand_products")
        .select(`*, brands(name, slug)`)
        .order("created_at", { ascending: false })
        .limit(4);
      
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

  const ProductCard = ({ product, isBrandProduct = false, badgeText, badgeIcon: BadgeIcon, index = 0 }: any) => {
    const price = isBrandProduct ? (product.sale_price || product.price) : product.price;
    const originalPrice = isBrandProduct ? product.price : product.original_price;
    const image = isBrandProduct ? product.image_url : product.product_images?.[0]?.image_url || "/placeholder.svg";
    const brandName = isBrandProduct ? product.brands?.name : null;

    return (
      <Card 
        className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover-scale animate-fade-in"
        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <Badge className="absolute top-2 left-2 gap-1 animate-scale-in" style={{ animationDelay: `${index * 100 + 200}ms` }} variant="secondary">
            <BadgeIcon className="h-3 w-3" />
            {badgeText}
          </Badge>
          {brandName && (
            <Badge className="absolute top-2 right-2 animate-scale-in" style={{ animationDelay: `${index * 100 + 300}ms` }} variant="outline">
              {brandName}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 text-sm">{product.name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">${price}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-muted-foreground line-through">${originalPrice}</span>
              )}
            </div>
            <button
              onClick={() => handleAddToCart(product, isBrandProduct)}
              className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-square" />
          <CardContent className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, linkTo }: { icon: any; title: string; linkTo: string }) => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Icon className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      <Link 
        to={linkTo} 
        className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
      >
        Ver todos
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );

  const hasNewProducts = newProducts && newProducts.length > 0;
  const hasRecentProducts = recentProducts && recentProducts.length > 0;
  const hasBrandProducts = brandProducts && brandProducts.length > 0;

  // Si no hay ningún producto, no mostrar la sección
  if (!loadingNew && !loadingRecent && !loadingBrands && !hasNewProducts && !hasRecentProducts && !hasBrandProducts) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">Lo Nuevo</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Descubre las últimas novedades en nuestra tienda
        </p>
      </div>

      {/* Productos marcados como nuevos */}
      {(loadingNew || hasNewProducts) && (
        <div className="mb-12">
          <SectionHeader icon={Sparkles} title="Productos Nuevos" linkTo="/lo-nuevo" />
          {loadingNew ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newProducts?.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  badgeText="Nuevo"
                  badgeIcon={Sparkles}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Productos recientes */}
      {(loadingRecent || hasRecentProducts) && (
        <div className="mb-12">
          <SectionHeader icon={Clock} title="Agregados Recientemente" linkTo="/lo-nuevo" />
          {loadingRecent ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentProducts?.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  badgeText="Reciente"
                  badgeIcon={Clock}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Últimas gorras de marcas */}
      {(loadingBrands || hasBrandProducts) && (
        <div className="mb-12">
          <SectionHeader icon={Store} title="Últimas Gorras de Marcas" linkTo="/lo-nuevo" />
          {loadingBrands ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {brandProducts?.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isBrandProduct
                  badgeText="Marca"
                  badgeIcon={Store}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;
