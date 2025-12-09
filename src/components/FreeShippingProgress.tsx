import { Truck, Gift } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FreeShippingProgressProps {
  currentTotal: number;
  threshold?: number;
}

export const FreeShippingProgress = ({ currentTotal, threshold = 500 }: FreeShippingProgressProps) => {
  const progress = Math.min((currentTotal / threshold) * 100, 100);
  const remaining = Math.max(threshold - currentTotal, 0);
  const hasFreeShipping = currentTotal >= threshold;

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-3 space-y-2">
      {hasFreeShipping ? (
        <div className="flex items-center gap-2 text-primary animate-fade-in">
          <Gift className="h-5 w-5 animate-bounce" />
          <span className="font-semibold text-sm">¡Felicidades! Tienes envío GRATIS</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm">
            <Truck className="h-4 w-4 text-primary" />
            <span>
              Te faltan <span className="font-bold text-primary">${remaining.toLocaleString()}</span> para envío gratis
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Agrega ${remaining.toLocaleString()} más y ahorra $99 en envío
          </p>
        </>
      )}
    </div>
  );
};
