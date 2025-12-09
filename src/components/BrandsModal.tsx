import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getBrands, Brand } from "@/data/brandsStore";
import { useNavigate } from "react-router-dom";

interface BrandsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BrandsModal = ({ isOpen, onClose }: BrandsModalProps) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setBrands(getBrands());
    
    // Escuchar actualizaciones de marcas
    const handleBrandsUpdate = () => {
      setBrands(getBrands());
    };
    
    window.addEventListener('brandsUpdated', handleBrandsUpdate);
    return () => window.removeEventListener('brandsUpdated', handleBrandsUpdate);
  }, []);

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
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => handleBrandClick(brand.path)}
              className="group flex flex-col items-center p-4 rounded-xl border-2 border-border/50 hover:border-primary bg-card hover:bg-primary/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-black flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 p-2">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-sm md:text-base font-semibold text-center group-hover:text-primary transition-colors">
                {brand.name}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {brand.products.length} productos
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrandsModal;
