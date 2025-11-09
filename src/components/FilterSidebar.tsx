import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { allColors, collections } from "@/data/products";

interface FilterSidebarProps {
  selectedColors: string[];
  selectedCollections: string[];
  onColorChange: (color: string) => void;
  onCollectionChange: (collection: string) => void;
  onClearFilters: () => void;
}

export const FilterSidebar = ({
  selectedColors,
  selectedCollections,
  onColorChange,
  onCollectionChange,
  onClearFilters,
}: FilterSidebarProps) => {
  const hasFilters = selectedColors.length > 0 || selectedCollections.length > 0;

  return (
    <div className="w-full lg:w-64 space-y-6 animate-fade-in-up sticky top-24">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold animate-fade-in-up">Filtros</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="animate-scale-in hover:text-destructive transition-all duration-300">
            <X className="h-4 w-4 mr-1 transition-transform duration-300 hover:rotate-90" />
            Limpiar
          </Button>
        )}
      </div>

      <Separator />

      {/* Colecciones */}
      <div className="space-y-3 animate-fade-in-up animation-delay-100">
        <h4 className="font-semibold text-sm uppercase tracking-wide">Colecciones</h4>
        <div className="space-y-2">
          {collections.map((collection, index) => (
            <div 
              key={collection} 
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Checkbox
                id={`collection-${collection}`}
                checked={selectedCollections.includes(collection)}
                onCheckedChange={() => onCollectionChange(collection)}
                className="transition-all duration-300"
              />
              <Label
                htmlFor={`collection-${collection}`}
                className="text-sm cursor-pointer hover:text-primary transition-colors duration-300"
              >
                {collection}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Colores */}
      <div className="space-y-3 animate-fade-in-up animation-delay-200">
        <h4 className="font-semibold text-sm uppercase tracking-wide">Colores</h4>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2 pr-4">
            {allColors.map((color, index) => (
              <div 
                key={color} 
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <Checkbox
                  id={`color-${color}`}
                  checked={selectedColors.includes(color)}
                  onCheckedChange={() => onColorChange(color)}
                  className="transition-all duration-300"
                />
                <Label
                  htmlFor={`color-${color}`}
                  className="text-sm cursor-pointer hover:text-primary transition-colors duration-300"
                >
                  {color}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
