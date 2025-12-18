import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Sparkles, Clock, Store, ArrowRight, ChevronLeft, ChevronRight, Percent, Flame } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";

const FeaturedProducts = () => {
  const { addItem } = useCart();

  const { data: newProducts, isLoading: loadingNew } = useQuery({
    queryKey: ["featured-new-products"],
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

  const { data: saleProducts, isLoading: loadingSale } = useQuery({
    queryKey: ["featured-sale-products"],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from("products")
        .select(`*, product_images(*)`)
        .eq("is_on_sale", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return products;
    },
  });

  const { data: saleBrandProducts, isLoading: loadingSaleBrands } = useQuery({
    queryKey: ["featured-sale-brand-products"],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from("brand_products")
        .select(`*, brands(name, slug)`)
        .not("sale_price", "is", null)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return products;
    },
  });

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
        .limit(8);
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
  };

  const ProductCard = ({ product, isBrandProduct = false, badgeText, badgeIcon: BadgeIcon, badgeColor = "bg-secondary", index = 0 }: any) => {
    const price = isBrandProduct ? (product.sale_price || product.price) : product.price;
    const originalPrice = isBrandProduct ? product.price : product.original_price;
    const image = isBrandProduct ? product.image_url : product.product_images?.[0]?.image_url || "/placeholder.svg";
    const brandName = isBrandProduct ? product.brands?.name : null;
    const discountPercentage = originalPrice && originalPrice > price 
      ? Math.round(((originalPrice - price) / originalPrice) * 100) 
      : 0;

    return (
      <div className="min-w-0 flex-[0_0_50%] md:flex-[0_0_25%] pl-4">
        <Card 
          className="group overflow-hidden border-border/30 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 premium-card animate-fade-in"
          style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
        >
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/30 to-background">
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Top badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Badge className={`${badgeColor} shadow-lg gap-1.5 font-medium`}>
                <BadgeIcon className="h-3 w-3" />
                {badgeText}
              </Badge>
              {discountPercentage > 0 && (
                <Badge className="bg-destructive text-destructive-foreground shadow-lg font-bold">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>
            
            {brandName && (
              <Badge className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-foreground border-border/50 shadow-lg">
                {brandName}
              </Badge>
            )}
            
            {/* Quick add button */}
            <button
              onClick={() => handleAddToCart(product, isBrandProduct)}
              className="absolute bottom-3 right-3 p-3 rounded-xl bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 shadow-xl"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
          
          <CardContent className="p-5">
            <h3 className="font-heading font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors duration-300">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display text-primary">${price}</span>
                {originalPrice && originalPrice > price && (
                  <span className="text-sm text-muted-foreground line-through">${originalPrice}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const ProductCarousel = ({ products, isLoading, badgeText, badgeIcon, badgeColor, isBrandProduct = false }: any) => {
    const autoplayRef = useRef(
      Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
    );
    
    const [emblaRef, emblaApi] = useEmblaCarousel({ 
      loop: true, 
      align: "start",
      dragFree: true,
    }, [autoplayRef.current]);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
      if (!emblaApi) return;
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
      if (!emblaApi) return;
      onSelect();
      emblaApi.on("select", onSelect);
      emblaApi.on("reInit", onSelect);
      return () => {
        emblaApi.off("select", onSelect);
        emblaApi.off("reInit", onSelect);
      };
    }, [emblaApi, onSelect]);

    if (isLoading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden bg-card/50">
              <Skeleton className="aspect-square" />
              <CardContent className="p-5">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-7 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!products || products.length === 0) return null;

    return (
      <div className="relative group/carousel">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4">
            {products.map((product: any, index: number) => (
              <ProductCard
                key={product.id}
                product={product}
                badgeText={badgeText}
                badgeIcon={badgeIcon}
                badgeColor={badgeColor}
                isBrandProduct={isBrandProduct}
                index={index}
              />
            ))}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 bg-background/90 backdrop-blur-sm shadow-xl border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 bg-background/90 backdrop-blur-sm shadow-xl border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary"
          onClick={scrollNext}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    );
  };

  const SectionHeader = ({ icon: Icon, title, linkTo, accent = false }: { icon: any; title: string; linkTo: string; accent?: boolean }) => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${accent ? 'bg-gradient-to-br from-destructive to-orange-500' : 'bg-primary/10'}`}>
          <Icon className={`h-6 w-6 ${accent ? 'text-white' : 'text-primary'}`} />
        </div>
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground tracking-wide">{title}</h2>
      </div>
      <Link 
        to={linkTo} 
        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium group"
      >
        Ver todos
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );

  const hasNewProducts = newProducts && newProducts.length > 0;
  const hasRecentProducts = recentProducts && recentProducts.length > 0;
  const hasBrandProducts = brandProducts && brandProducts.length > 0;
  const hasSaleProducts = saleProducts && saleProducts.length > 0;
  const hasSaleBrandProducts = saleBrandProducts && saleBrandProducts.length > 0;
  const hasAnySaleProducts = hasSaleProducts || hasSaleBrandProducts;

  const allSaleProducts = [
    ...(saleProducts || []).map(p => ({ ...p, isBrandProduct: false })),
    ...(saleBrandProducts || []).map(p => ({ ...p, isBrandProduct: true }))
  ];

  if (!loadingNew && !loadingRecent && !loadingBrands && !loadingSale && !loadingSaleBrands && !hasNewProducts && !hasRecentProducts && !hasBrandProducts && !hasAnySaleProducts) {
    return null;
  }

  return (
    <section className="container mx-auto px-6 py-16 md:py-24">
      {/* Section intro */}
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 text-primary text-sm font-medium tracking-widest uppercase">
          <Flame className="h-4 w-4" />
          Novedades
          <Flame className="h-4 w-4" />
        </div>
        <h2 className="text-4xl md:text-5xl font-display tracking-wide">LO NUEVO</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Descubre las últimas novedades y ofertas exclusivas en nuestra tienda
        </p>
      </div>

      {/* Sale Products */}
      {(loadingSale || loadingSaleBrands || hasAnySaleProducts) && (
        <div className="mb-16">
          <SectionHeader icon={Percent} title="Ofertas Especiales" linkTo="/lo-nuevo" accent />
          {(loadingSale || loadingSaleBrands) && !hasAnySaleProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden bg-card/50">
                  <Skeleton className="aspect-square" />
                  <CardContent className="p-5">
                    <Skeleton className="h-5 w-3/4 mb-3" />
                    <Skeleton className="h-7 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : hasAnySaleProducts ? (
            <ProductCarousel 
              products={allSaleProducts} 
              isLoading={false} 
              badgeText="Oferta" 
              badgeIcon={Percent}
              badgeColor="bg-gradient-to-r from-destructive to-orange-500 text-white"
              isBrandProduct={false}
            />
          ) : null}
        </div>
      )}

      {/* New Products */}
      {(loadingNew || hasNewProducts) && (
        <div className="mb-16">
          <SectionHeader icon={Sparkles} title="Productos Nuevos" linkTo="/lo-nuevo" />
          <ProductCarousel 
            products={newProducts} 
            isLoading={loadingNew} 
            badgeText="Nuevo" 
            badgeIcon={Sparkles}
            badgeColor="bg-primary text-primary-foreground"
          />
        </div>
      )}

      {/* Recent Products */}
      {(loadingRecent || hasRecentProducts) && (
        <div className="mb-16">
          <SectionHeader icon={Clock} title="Recién Agregados" linkTo="/lo-nuevo" />
          <ProductCarousel 
            products={recentProducts} 
            isLoading={loadingRecent} 
            badgeText="Reciente" 
            badgeIcon={Clock}
            badgeColor="bg-secondary text-secondary-foreground"
          />
        </div>
      )}

      {/* Brand Products */}
      {(loadingBrands || hasBrandProducts) && (
        <div className="mb-8">
          <SectionHeader icon={Store} title="De Nuestras Marcas" linkTo="/lo-nuevo" />
          <ProductCarousel 
            products={brandProducts} 
            isLoading={loadingBrands} 
            badgeText="Marca" 
            badgeIcon={Store}
            badgeColor="bg-gold text-gold-foreground"
            isBrandProduct 
          />
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;
