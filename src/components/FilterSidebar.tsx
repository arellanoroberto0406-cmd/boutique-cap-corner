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
    <div className="w-full lg:w-64 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Filtros</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      <Separator />

      {/* Colecciones */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm uppercase tracking-wide">Colecciones</h4>
        <div className="space-y-2">
          {collections.map((collection) => (
            <div key={collection} className="flex items-center space-x-2">
              <Checkbox
                id={`collection-${collection}`}
                checked={selectedCollections.includes(collection)}
                onCheckedChange={() => onCollectionChange(collection)}
              />
              <Label
                htmlFor={`collection-${collection}`}
                className="text-sm cursor-pointer"
              >
                {collection}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Colores */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm uppercase tracking-wide">Colores</h4>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2 pr-4">
            {allColors.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox
                  id={`color-${color}`}
                  checked={selectedColors.includes(color)}
                  onCheckedChange={() => onColorChange(color)}
                />
                <Label
                  htmlFor={`color-${color}`}
                  className="text-sm cursor-pointer"
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
