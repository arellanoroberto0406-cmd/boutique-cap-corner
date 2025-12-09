import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBrands } from "@/hooks/useBrands";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface BrandsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BrandsModal = ({ isOpen, onClose }: BrandsModalProps) => {
  const { brands, loading } = useBrands();
  const navigate = useNavigate();

  const handleBrandClick = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Nuestras Marcas
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No hay marcas disponibles
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => handleBrandClick(brand.path)}
                className="group flex flex-col items-center p-4 rounded-xl border-2 border-border/50 hover:border-primary bg-card hover:bg-primary/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-black flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 p-2">
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="font-bold text-foreground text-sm md:text-base text-center group-hover:text-primary transition-colors">
                  {brand.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {brand.products.length} productos
                </p>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BrandsModal;
