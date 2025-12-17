import { Sparkles } from "lucide-react";
import { useNewProducts } from "@/hooks/useNewProducts";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NewProductsBadgeProps {
  className?: string;
  showText?: boolean;
}

const NewProductsBadge = ({ className, showText = true }: NewProductsBadgeProps) => {
  const { newProductsCount, markAsVisited } = useNewProducts();
  const navigate = useNavigate();

  if (newProductsCount === 0) return null;

  const handleClick = () => {
    markAsVisited();
    navigate("/lo-nuevo");
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium animate-pulse hover:animate-none hover:scale-105 transition-transform",
        className
      )}
    >
      <Sparkles className="h-4 w-4" />
      <span className="bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
        {newProductsCount > 99 ? "99+" : newProductsCount}
      </span>
      {showText && <span>Nuevos</span>}
    </button>
  );
};

export default NewProductsBadge;
