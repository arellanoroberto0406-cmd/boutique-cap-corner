import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Sparkles, Store, Pin, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const LoNuevo = () => {
  const { addItem } = useCart();
  const navigate = useNavigate();

  // Últimas marcas creadas
  const { data: newBrands, isLoading: loadingBrands } = useQuery({
    queryKey: ["new-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data;
    },
  });

  // Últimas gorras de marcas
  const { data: brandProducts, isLoading: loadingBrandProducts } = useQuery({
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

  // Últimos pines
  const { data: newPines, isLoading: loadingPines } = useQuery({
    queryKey: ["new-pines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pines")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data;
    },
  });

  // Últimos estuches
  const { data: newEstuches, isLoading: loadingEstuches } = useQuery({
    queryKey: ["new-estuches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estuches")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data;
    },
  });

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

  const handleAddToCart = (product: any, type: string) => {
    let cartProduct;
    
    if (type === 'brand') {
      cartProduct = {
        id: product.id,
        name: product.name,
        price: product.sale_price || product.price,
        image: product.image_url,
        description: product.description || "",
        collection: "marcas",
      };
    } else if (type === 'pin') {
      cartProduct = {
        id: product.id,
        name: product.name || 'Pin',
        price: product.sale_price || product.price,
        image: product.image_url,
        description: product.description || "",
        collection: "pines",
      };
    } else if (type === 'estuche') {
      cartProduct = {
        id: product.id,
        name: product.name,
        price: product.sale_price || product.price,
        image: product.image_url,
        description: product.description || "",
        collection: "estuches",
      };
    } else {
      cartProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.product_images?.[0]?.image_url || "/placeholder.svg",
        description: product.description || "",
        collection: product.collection || "",
      };
    }
    
    addItem(cartProduct as any);
    toast.success(`${cartProduct.name} agregado al carrito`);
  };

  const ProductCard = ({ product, type, badgeText, badgeIcon: BadgeIcon }: any) => {
    let price, originalPrice, image, name;
    
    if (type === 'brand') {
      price = product.sale_price || product.price;
      originalPrice = product.sale_price ? product.price : null;
      image = product.image_url;
      name = product.name;
    } else if (type === 'pin') {
      price = product.sale_price || product.price;
      originalPrice = product.sale_price ? product.price : null;
      image = product.image_url;
      name = product.name || 'Pin';
    } else if (type === 'estuche') {
      price = product.sale_price || product.price;
      originalPrice = product.sale_price ? product.price : null;
      image = product.image_url;
      name = product.name;
    } else {
      price = product.price;
      originalPrice = product.original_price;
      image = product.product_images?.[0]?.image_url || "/placeholder.svg";
      name = product.name;
    }

    return (
      <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className="absolute top-2 left-2 gap-1" variant="secondary">
            <BadgeIcon className="h-3 w-3" />
            {badgeText}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">${price}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-muted-foreground line-through">${originalPrice}</span>
              )}
            </div>
            <button
              onClick={() => handleAddToCart(product, type)}
              className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const BrandCard = ({ brand }: any) => (
    <Card 
      className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={() => navigate(brand.path)}
    >
      <div className="aspect-square overflow-hidden bg-black p-4 flex items-center justify-center">
        <img
          src={brand.logo_url}
          alt={brand.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4 text-center">
        <h3 className="font-semibold text-foreground">{brand.name}</h3>
        <p className="text-sm text-muted-foreground">Ver productos</p>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = ({ count = 4 }: { count?: number }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
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
            Descubre las últimas novedades en nuestra tienda. Nuevas marcas, gorras, pines y estuches agregados recientemente.
          </p>
        </div>

        {/* Nuevas Marcas */}
        {newBrands && newBrands.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Store className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Nuevas Marcas</h2>
            </div>
            {loadingBrands ? (
              <LoadingSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {newBrands.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Últimas Gorras de Marcas */}
        {brandProducts && brandProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Últimas Gorras</h2>
            </div>
            {loadingBrandProducts ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {brandProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    type="brand"
                    badgeText={product.brands?.name || "Marca"}
                    badgeIcon={Store}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Nuevos Pines */}
        {newPines && newPines.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Pin className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Nuevos Pines</h2>
            </div>
            {loadingPines ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newPines.map((pin) => (
                  <ProductCard
                    key={pin.id}
                    product={pin}
                    type="pin"
                    badgeText="Pin"
                    badgeIcon={Pin}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Nuevos Estuches */}
        {newEstuches && newEstuches.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Nuevos Estuches</h2>
            </div>
            {loadingEstuches ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newEstuches.map((estuche) => (
                  <ProductCard
                    key={estuche.id}
                    product={estuche}
                    type="estuche"
                    badgeText="Estuche"
                    badgeIcon={Package}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Productos marcados como nuevos */}
        {newProducts && newProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Productos Destacados</h2>
            </div>
            {loadingNew ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    type="product"
                    badgeText="Nuevo"
                    badgeIcon={Sparkles}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Mensaje si no hay nada */}
        {!loadingBrands && !loadingBrandProducts && !loadingPines && !loadingEstuches && !loadingNew &&
          (!newBrands || newBrands.length === 0) && 
          (!brandProducts || brandProducts.length === 0) && 
          (!newPines || newPines.length === 0) && 
          (!newEstuches || newEstuches.length === 0) && 
          (!newProducts || newProducts.length === 0) && (
          <div className="text-center py-16">
            <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Próximamente</h2>
            <p className="text-muted-foreground">Estamos preparando nuevos productos para ti.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LoNuevo;
