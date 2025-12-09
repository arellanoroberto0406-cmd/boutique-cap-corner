import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Sparkles, Clock, Store } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const LoNuevo = () => {
  const { addItem } = useCart();

  // Productos marcados como nuevos
  const { data: newProducts, isLoading: loadingNew } = useQuery({
    queryKey: ["new-products"],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from("products")
        .select(`*, product_images(*)`)
        .eq("is_new", true)
        .order("created_at", { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return products;
    },
  });

  // Productos recientes (últimos 30 días)
  const { data: recentProducts, isLoading: loadingRecent } = useQuery({
    queryKey: ["recent-products"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: products, error } = await supabase
        .from("products")
        .select(`*, product_images(*)`)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .eq("is_new", false)
        .order("created_at", { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return products;
    },
  });

  // Últimas gorras de marcas
  const { data: brandProducts, isLoading: loadingBrands } = useQuery({
    queryKey: ["recent-brand-products"],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from("brand_products")
        .select(`*, brands(name, slug)`)
        .order("created_at", { ascending: false })
        .limit(8);
      
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
    toast.success(`${product.name} agregado al carrito`);
  };

  const ProductCard = ({ product, isBrandProduct = false, badgeText, badgeIcon: BadgeIcon }: any) => {
    const price = isBrandProduct ? (product.sale_price || product.price) : product.price;
    const originalPrice = isBrandProduct ? product.price : product.original_price;
    const image = isBrandProduct ? product.image_url : product.product_images?.[0]?.image_url || "/placeholder.svg";
    const brandName = isBrandProduct ? product.brands?.name : null;

    return (
      <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className="absolute top-2 left-2 gap-1" variant="secondary">
            <BadgeIcon className="h-3 w-3" />
            {badgeText}
          </Badge>
          {brandName && (
            <Badge className="absolute top-2 right-2" variant="outline">
              {brandName}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{product.name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">${price}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-muted-foreground line-through">${originalPrice}</span>
              )}
            </div>
            <button
              onClick={() => handleAddToCart(product, isBrandProduct)}
              className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Lo Nuevo</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubre las últimas novedades en nuestra tienda. Productos frescos, nuevos modelos y las gorras más recientes de todas las marcas.
          </p>
        </div>

        {/* Productos marcados como nuevos */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Productos Nuevos</h2>
          </div>
          {loadingNew ? (
            <LoadingSkeleton />
          ) : newProducts && newProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  badgeText="Nuevo"
                  badgeIcon={Sparkles}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No hay productos marcados como nuevos</p>
          )}
        </section>

        {/* Productos recientes */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Agregados Recientemente</h2>
          </div>
          {loadingRecent ? (
            <LoadingSkeleton />
          ) : recentProducts && recentProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  badgeText="Reciente"
                  badgeIcon={Clock}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No hay productos recientes</p>
          )}
        </section>

        {/* Últimas gorras de marcas */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Store className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Últimas Gorras de Marcas</h2>
          </div>
          {loadingBrands ? (
            <LoadingSkeleton />
          ) : brandProducts && brandProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {brandProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isBrandProduct
                  badgeText="Marca"
                  badgeIcon={Store}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No hay gorras de marcas disponibles</p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LoNuevo;
