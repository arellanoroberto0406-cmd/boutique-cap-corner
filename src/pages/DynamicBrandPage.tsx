import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { BrandProduct } from "@/hooks/useBrands";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, Heart, Eye, Loader2, ChevronLeft, ChevronRight, X, Package, Truck, Box } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useMenu } from "@/context/MenuContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BrandProductModal } from "@/components/BrandProductModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import WhatsAppButton from "@/components/WhatsAppButton";
// Imagen optimizada con skeleton
const OptimizedImage = ({ src, alt, className, isHovered }: { src: string; alt: string; className?: string; isHovered?: boolean }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Error</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          className,
          "transition-all duration-500",
          isLoaded ? "opacity-100" : "opacity-0",
          isHovered && "scale-110"
        )}
      />
    </div>
  );
};

// Convertir BrandProduct a formato del modal
const convertToModalProduct = (product: BrandProduct, brandName: string) => ({
  ...product,
  sale_price: product.sale_price ?? null,
  free_shipping: product.free_shipping ?? null,
  shipping_cost: product.shipping_cost ?? null,
  images: product.images ?? null,
  description: product.description ?? null,
  has_full_set: product.has_full_set ?? null,
  only_cap: product.only_cap ?? null,
  only_cap_price: product.only_cap_price ?? null,
  stock: product.stock ?? null,
  sizes: product.sizes ?? null,
  brands: { name: brandName, slug: brandName.toLowerCase().replace(/\s+/g, '-') }
});

interface BrandData {
  id: string;
  slug: string;
  name: string;
  logo_url: string;
  path: string;
}

const DynamicBrandPage = () => {
  const { brandSlug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openBrandsMenu } = useMenu();
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: 'fullSet' | 'onlyCap' }>({});
  const [expandedProduct, setExpandedProduct] = useState<BrandProduct | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSelectedOption, setExpandedSelectedOption] = useState<'fullSet' | 'onlyCap'>('fullSet');
  const detailsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Obtener todas las imágenes del producto
  const getProductImages = (product: BrandProduct): string[] => {
    const images: string[] = [product.image_url];
    if (product.images && product.images.length > 0) {
      images.push(...product.images.filter(img => img !== product.image_url));
    }
    return images;
  };

  // Fetch brand data directly by slug - FAST
  const { data: brand, isLoading: brandLoading } = useQuery({
    queryKey: ["brand-by-slug", brandSlug],
    queryFn: async () => {
      // First try by slug
      let { data, error } = await supabase
        .from("brands")
        .select("id, slug, name, logo_url, path")
        .eq("slug", brandSlug)
        .maybeSingle();

      if (!data && !error) {
        // Try by path
        const result = await supabase
          .from("brands")
          .select("id, slug, name, logo_url, path")
          .eq("path", `/${brandSlug}`)
          .maybeSingle();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data as BrandData | null;
    },
    enabled: !!brandSlug,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fetch products for this brand only - FAST
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["brand-products", brand?.id],
    queryFn: async () => {
      if (!brand?.id) return [];
      
      const { data, error } = await supabase
        .from("brand_products")
        .select("id, brand_id, name, image_url, price, sale_price, free_shipping, shipping_cost, description, has_full_set, only_cap, only_cap_price, stock, sizes, images")
        .eq("brand_id", brand.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as BrandProduct[];
    },
    enabled: !!brand?.id,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });

  // Realtime subscription for products
  useEffect(() => {
    if (!brand?.id) return;

    const channel = supabase
      .channel(`brand-products-${brand.id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'brand_products',
          filter: `brand_id=eq.${brand.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["brand-products", brand.id] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [brand?.id, queryClient]);

  const getSelectedOption = (productId: string, product: BrandProduct): 'fullSet' | 'onlyCap' => {
    if (selectedOptions[productId]) return selectedOptions[productId];
    return product.has_full_set ? 'fullSet' : 'onlyCap';
  };

  const getDisplayPrice = (product: BrandProduct) => {
    const option = getSelectedOption(product.id, product);
    if (option === 'onlyCap' && product.only_cap_price) {
      return product.only_cap_price;
    }
    return product.sale_price || product.price;
  };

  const handleAddToCart = (product: BrandProduct, overrideOption?: 'fullSet' | 'onlyCap') => {
    const option = overrideOption || getSelectedOption(product.id, product);
    const price = option === 'onlyCap' && product.only_cap_price ? product.only_cap_price : (product.sale_price || product.price);
    
    addItem({
      id: product.id,
      name: `${product.name}${option === 'onlyCap' ? ' (Solo Gorra)' : product.has_full_set ? ' (Full Set)' : ''}`,
      price: price,
      image: product.image_url,
      collection: brand?.name || "Marca",
      colors: [],
      isNew: false,
      isOnSale: !!product.sale_price,
      originalPrice: product.sale_price ? product.price : undefined,
      stock: product.stock || 10,
      description: product.description || "",
      shippingCost: product.shipping_cost || 0,
      freeShipping: product.free_shipping || false,
    });
    toast.success(`${product.name} agregado al carrito`);
  };

  const handleToggleWishlist = (product: BrandProduct) => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.image_url,
      collection: brand?.name || "Marca",
      colors: [],
      stock: product.stock || 10,
      description: product.description || "",
      isOnSale: !!product.sale_price,
      originalPrice: product.sale_price ? product.price : undefined,
    });
  };

  // Show loading only while fetching brand (products can load after)
  if (brandLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          {brand.name}
        </h1>
        
        <div className="space-y-12">
          {/* Imagen de la marca - clickeable para abrir menú de marcas */}
          <div className="max-w-xs mx-auto cursor-pointer" onClick={openBrandsMenu}>
            <img 
              src={brand.logo_url} 
              alt={`${brand.name} Brand`} 
              className="w-full h-auto rounded-lg brand-glow hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Vista expandida inline para gorra seleccionada */}
          {expandedProduct && (
            <div ref={detailsRef} className="bg-card rounded-2xl border border-border shadow-xl p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-foreground">{expandedProduct.name}</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setExpandedProduct(null);
                    setCurrentImageIndex(0);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Galería de imágenes */}
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                    <img 
                      src={getProductImages(expandedProduct)[currentImageIndex]} 
                      alt={expandedProduct.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Botones de navegación */}
                    {getProductImages(expandedProduct).length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background shadow-lg"
                          onClick={() => setCurrentImageIndex(prev => 
                            prev === 0 ? getProductImages(expandedProduct).length - 1 : prev - 1
                          )}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background shadow-lg"
                          onClick={() => setCurrentImageIndex(prev => 
                            prev === getProductImages(expandedProduct).length - 1 ? 0 : prev + 1
                          )}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                        
                        {/* Indicador de imagen */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {getProductImages(expandedProduct).length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Miniaturas */}
                  {getProductImages(expandedProduct).length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {getProductImages(expandedProduct).map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === currentImageIndex 
                              ? 'border-primary ring-2 ring-primary/30' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Detalles del producto */}
                <div className="space-y-5">
                  {/* Descripción */}
                  {expandedProduct.description && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Descripción</h4>
                      <p className="text-muted-foreground">{expandedProduct.description}</p>
                    </div>
                  )}
                  
                  {/* Precios - Seleccionables */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Precios</h4>
                    <div className="flex flex-wrap gap-3">
                      {expandedProduct.has_full_set && (
                        <button
                          onClick={() => setExpandedSelectedOption('fullSet')}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-bold text-lg border-2 ${
                            expandedSelectedOption === 'fullSet'
                              ? 'bg-orange-500 text-white border-orange-500'
                              : 'bg-secondary text-secondary-foreground border-border hover:border-orange-400'
                          }`}
                        >
                          <Package className="h-5 w-5" />
                          Full Set: ${expandedProduct.price}
                        </button>
                      )}
                      {expandedProduct.only_cap && expandedProduct.only_cap_price && (
                        <button
                          onClick={() => setExpandedSelectedOption('onlyCap')}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-bold text-lg border-2 ${
                            expandedSelectedOption === 'onlyCap'
                              ? 'bg-orange-500 text-white border-orange-500'
                              : 'bg-secondary text-secondary-foreground border-border hover:border-orange-400'
                          }`}
                        >
                          <Box className="h-5 w-5" />
                          Solo Gorra: ${expandedProduct.only_cap_price}
                        </button>
                      )}
                      {!expandedProduct.has_full_set && !expandedProduct.only_cap && (
                        <div className="text-3xl font-bold text-primary">${expandedProduct.price}</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Envío */}
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    {expandedProduct.free_shipping ? (
                      <span className="text-green-600 font-semibold">¡Envío Gratis!</span>
                    ) : expandedProduct.shipping_cost ? (
                      <span className="text-foreground">Costo de envío: <strong>${expandedProduct.shipping_cost}</strong></span>
                    ) : (
                      <span className="text-muted-foreground">Consultar costo de envío</span>
                    )}
                  </div>
                  
                  {/* Stock */}
                  {expandedProduct.stock !== undefined && (
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      expandedProduct.stock > 0 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {expandedProduct.stock > 0 ? `${expandedProduct.stock} disponibles` : 'Agotado'}
                    </div>
                  )}
                  
                  {/* Botón de agregar */}
                  <Button 
                    className="w-full gap-2 mt-4 bg-orange-500 hover:bg-orange-600"
                    size="lg"
                    onClick={() => {
                      handleAddToCart(expandedProduct, expandedSelectedOption);
                      setExpandedProduct(null);
                      setCurrentImageIndex(0);
                    }}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Agregar al Carrito
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Grid de productos */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Productos de {brand.name}</h2>
              <p className="text-muted-foreground">
                {productsLoading ? "Cargando..." : `${products.length} ${products.length === 1 ? 'producto' : 'productos'} disponibles`}
              </p>
            </div>

            {productsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">
                  No hay productos disponibles en esta marca
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    className={`group bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer ${expandedProduct?.id === product.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => {
                      setExpandedProduct(product);
                      setCurrentImageIndex(0);
                      setExpandedSelectedOption(product.has_full_set ? 'fullSet' : 'onlyCap');
                      setTimeout(() => {
                        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                  >
                    <div className="aspect-square overflow-hidden bg-muted relative">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleWishlist(product);
                        }}
                      >
                        <Heart className={cn("h-5 w-5", isInWishlist(product.id) && "fill-current text-destructive")} />
                      </Button>
                      <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        Click para ver detalles
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-2 truncate">{product.name}</h3>
                      
                      {/* Opciones de Full Set / Solo Gorra */}
                      {(product.has_full_set || product.only_cap) && product.only_cap_price && (
                        <div className="flex flex-wrap gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                          {product.has_full_set && (
                            <button
                              onClick={() => setSelectedOptions(prev => ({ ...prev, [product.id]: 'fullSet' }))}
                              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                                getSelectedOption(product.id, product) === 'fullSet'
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-background text-foreground border-border hover:border-primary'
                              }`}
                            >
                              Full Set - ${product.price}
                            </button>
                          )}
                          {product.only_cap && product.only_cap_price && (
                            <button
                              onClick={() => setSelectedOptions(prev => ({ ...prev, [product.id]: 'onlyCap' }))}
                              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                                getSelectedOption(product.id, product) === 'onlyCap'
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-background text-foreground border-border hover:border-primary'
                              }`}
                            >
                              Solo Gorra - ${product.only_cap_price}
                            </button>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xl font-bold text-primary">${getDisplayPrice(product)}</span>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddToCart(product)}
                          className="gap-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default DynamicBrandPage;