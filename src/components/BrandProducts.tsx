import { useState, useEffect } from "react";
import { useMenu } from "@/context/MenuContext";
import { getBrandByPath, Brand, BrandProduct } from "@/data/brandsStore";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
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

  const handleAddToCart = (product: BrandProduct, brandName: string) => {
    const option = getSelectedOption(product.id, product);
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
                className="group bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300"
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
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 truncate">{product.name}</h3>
                  
                  {/* Opciones de Full Set / Solo Gorra */}
                  {(product.hasFullSet || product.onlyCap) && product.onlyCapPrice && (
                    <div className="flex flex-wrap gap-2 mb-3">
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
                  
                  <div className="flex items-center justify-between">
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
