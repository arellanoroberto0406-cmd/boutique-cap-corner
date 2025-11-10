import { products } from "@/data/products";
import ProductCard from "./ProductCard";
import { QuickViewModal } from "./QuickViewModal";
import { Product } from "@/types/product";
import { useState } from "react";

interface CollectionProductsProps {
  collection: string;
  brandImage?: string;
}

export const CollectionProducts = ({ collection, brandImage }: CollectionProductsProps) => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  const collectionProducts = products.filter(
    (product) => product.collection === collection
  );

  return (
    <div className="space-y-12">
      {/* Imagen de la marca si se proporciona */}
      {brandImage && (
        <div className="max-w-sm mx-auto">
          <img 
            src={brandImage} 
            alt={`${collection} Brand`} 
            className="w-full h-auto rounded-lg brand-glow"
          />
        </div>
      )}

      {/* Grid de productos */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Productos de {collection}</h2>
          <p className="text-muted-foreground">
            {collectionProducts.length} {collectionProducts.length === 1 ? 'producto' : 'productos'} disponibles
          </p>
        </div>

        {collectionProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              No hay productos disponibles en esta colección
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collectionProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        )}
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
