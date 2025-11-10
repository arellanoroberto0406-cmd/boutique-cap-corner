import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import { FilterSidebar } from "./FilterSidebar";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { products } from "@/data/products";
import { QuickViewModal } from "./QuickViewModal";
import { Product } from "@/types/product";

const ProductGrid = () => {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const colorMatch = selectedColors.length === 0 || 
        product.colors.some(color => selectedColors.includes(color));
      const collectionMatch = selectedCollections.length === 0 || 
        selectedCollections.includes(product.collection);
      return colorMatch && collectionMatch;
    });
  }, [selectedColors, selectedCollections]);

  const handleColorChange = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleCollectionChange = (collection: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collection) ? prev.filter((c) => c !== collection) : [...prev, collection]
    );
  };

  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedCollections([]);
  };

  return (
    <section id="productos" className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container px-4 md:px-8">
        <div className="mb-12 text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Todo lo Disponible
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explora nuestra colección completa. Cada gorra está diseñada con atención al detalle y fabricada con los mejores materiales.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-1 w-20 bg-primary rounded-full" />
            <div className="h-1 w-10 bg-primary/50 rounded-full" />
            <div className="h-1 w-5 bg-primary/25 rounded-full" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros Desktop */}
          <aside className="hidden lg:block">
            <FilterSidebar
              selectedColors={selectedColors}
              selectedCollections={selectedCollections}
              onColorChange={handleColorChange}
              onCollectionChange={handleCollectionChange}
              onClearFilters={clearFilters}
            />
          </aside>

          {/* Filtros Mobile */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros {(selectedColors.length + selectedCollections.length) > 0 && `(${selectedColors.length + selectedCollections.length})`}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar
                    selectedColors={selectedColors}
                    selectedCollections={selectedCollections}
                    onColorChange={handleColorChange}
                    onCollectionChange={handleCollectionChange}
                    onClearFilters={clearFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Grid de Productos */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">No se encontraron productos con estos filtros</p>
                <Button onClick={clearFilters} className="mt-4">
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
};

export default ProductGrid;
