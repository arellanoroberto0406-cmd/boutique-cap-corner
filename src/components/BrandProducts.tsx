import { useState, useEffect } from "react";
import { useMenu } from "@/context/MenuContext";
import { getBrandByPath, Brand, BrandProduct } from "@/data/brandsStore";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, X, Package, Truck, Box } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types/product";

interface BrandProductsProps {
  brandPath: string;
  brandImage?: string;
}

export const BrandProducts = ({ brandPath, brandImage }: BrandProductsProps) => {
  const { openBrandsMenu } = useMenu();
  const { addItem } = useCart();
  const [brand, setBrand] = useState<Brand | undefined>(undefined);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: 'fullSet' | 'onlyCap' }>({});
  const [expandedProduct, setExpandedProduct] = useState<BrandProduct | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSelectedOption, setExpandedSelectedOption] = useState<'fullSet' | 'onlyCap'>('fullSet');

  // Todos los productos son clickeables para ver detalles
  const isClickableProduct = (): boolean => {
    return true;
  };

  // Obtener todas las imágenes del producto
  const getProductImages = (product: BrandProduct): string[] => {
    const images: string[] = [product.image];
    if (product.images && product.images.length > 0) {
      images.push(...product.images.filter(img => img !== product.image));
    }
    return images;
  };

  useEffect(() => {
    const loadBrand = () => {
      const brandData = getBrandByPath(brandPath);
      setBrand(brandData);
    };
    
    loadBrand();
    
    // Escuchar cambios en localStorage (otras pestañas)
    const handleStorageChange = () => {
      loadBrand();
    };
    
    // Escuchar evento personalizado (misma pestaña)
    const handleBrandsUpdated = () => {
      loadBrand();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('brandsUpdated', handleBrandsUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('brandsUpdated', handleBrandsUpdated);
    };
  }, [brandPath]);

  const getSelectedOption = (productId: string, product: BrandProduct): 'fullSet' | 'onlyCap' => {
    if (selectedOptions[productId]) return selectedOptions[productId];
    return product.hasFullSet ? 'fullSet' : 'onlyCap';
  };

  const getDisplayPrice = (product: BrandProduct) => {
    const option = getSelectedOption(product.id, product);
    if (option === 'onlyCap' && product.onlyCapPrice) {
      return product.onlyCapPrice;
    }
    return product.salePrice || product.price;
  };

  const handleAddToCart = (product: BrandProduct, brandName: string, overrideOption?: 'fullSet' | 'onlyCap') => {
    const option = overrideOption || getSelectedOption(product.id, product);
    const price = option === 'onlyCap' && product.onlyCapPrice ? product.onlyCapPrice : product.price;
    
    // Convertir BrandProduct a Product para el carrito
    const cartProduct: Product = {
      id: product.id,
      name: `${product.name}${option === 'onlyCap' ? ' (Solo Gorra)' : ' (Full Set)'}`,
      price: price,
      image: product.image,
      colors: [],
      collection: brandName,
      stock: product.stock || 10,
      description: product.description || `Gorra ${product.name} de ${brandName}`
    };
    
    addItem(cartProduct);
    toast.success(`${product.name} agregado al carrito`);
  };

  if (!brand) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground">
          Esta marca ya no está disponible
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Imagen de la marca si se proporciona */}
      {brandImage && (
        <div className="max-w-xs mx-auto cursor-pointer" onClick={openBrandsMenu}>
          <img 
            src={brandImage} 
            alt={`${brand.name} Brand`} 
            className="w-full h-auto rounded-lg brand-glow hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Vista expandida inline para gorra seleccionada */}
      {expandedProduct && (
        <div className="bg-card rounded-2xl border border-border shadow-xl p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
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
                  {expandedProduct.hasFullSet && (
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
                  {expandedProduct.onlyCap && expandedProduct.onlyCapPrice && (
                    <button
                      onClick={() => setExpandedSelectedOption('onlyCap')}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-bold text-lg border-2 ${
                        expandedSelectedOption === 'onlyCap'
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-secondary text-secondary-foreground border-border hover:border-orange-400'
                      }`}
                    >
                      <Box className="h-5 w-5" />
                      Solo Gorra: ${expandedProduct.onlyCapPrice}
                    </button>
                  )}
                  {!expandedProduct.hasFullSet && !expandedProduct.onlyCap && (
                    <div className="text-3xl font-bold text-primary">${expandedProduct.price}</div>
                  )}
                </div>
              </div>
              
              {/* Envío */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Truck className="h-5 w-5 text-muted-foreground" />
                {expandedProduct.freeShipping ? (
                  <span className="text-green-600 font-semibold">¡Envío Gratis!</span>
                ) : expandedProduct.shippingCost ? (
                  <span className="text-foreground">Costo de envío: <strong>${expandedProduct.shippingCost}</strong></span>
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
                  handleAddToCart(expandedProduct, brand.name, expandedSelectedOption);
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
            {brand.products.length} {brand.products.length === 1 ? 'producto' : 'productos'} disponibles
          </p>
        </div>

        {brand.products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              No hay productos disponibles en esta marca
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brand.products.map((product) => (
              <div 
                key={product.id}
                className={`group bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer ${expandedProduct?.id === product.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => {
                  setExpandedProduct(product);
                  setCurrentImageIndex(0);
                  setExpandedSelectedOption(product.hasFullSet ? 'fullSet' : 'onlyCap');
                }}
              >
                <div className="aspect-square overflow-hidden bg-muted relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                  <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    Click para ver detalles
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 truncate">{product.name}</h3>
                  
                  {/* Opciones de Full Set / Solo Gorra */}
                  {(product.hasFullSet || product.onlyCap) && product.onlyCapPrice && (
                    <div className="flex flex-wrap gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                      {product.hasFullSet && (
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
                      {product.onlyCap && product.onlyCapPrice && (
                        <button
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [product.id]: 'onlyCap' }))}
                          className={`px-3 py-1 text-xs rounded-full border transition-all ${
                            getSelectedOption(product.id, product) === 'onlyCap'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background text-foreground border-border hover:border-primary'
                          }`}
                        >
                          Solo Gorra - ${product.onlyCapPrice}
                        </button>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xl font-bold text-primary">${getDisplayPrice(product)}</span>
                    <Button 
                      size="sm" 
                      onClick={() => handleAddToCart(product, brand.name)}
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
  );
};
