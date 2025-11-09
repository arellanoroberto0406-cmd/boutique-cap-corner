import { Truck } from "lucide-react";

export const FreeShippingBanner = () => {
  return (
    <div className="bg-primary text-primary-foreground overflow-hidden">
      <div className="animate-marquee whitespace-nowrap py-2 flex items-center gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider px-8">
            <Truck className="h-4 w-4" />
            <span>Envío gratis en todas las compras</span>
          </div>
        ))}
      </div>
    </div>
  );
};
