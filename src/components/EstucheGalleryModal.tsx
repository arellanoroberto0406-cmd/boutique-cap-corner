import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ShoppingCart, Truck } from 'lucide-react';
import { Estuche } from '@/hooks/useEstuches';

interface EstucheGalleryModalProps {
  estuche: Estuche | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (estuche: Estuche) => void;
}

const EstucheGalleryModal = ({ estuche, isOpen, onClose, onAddToCart }: EstucheGalleryModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!estuche) return null;

  const images = estuche.images?.length > 0 ? estuche.images : [estuche.image_url];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setCurrentImageIndex(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-background/80 p-2 hover:bg-background transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="relative bg-muted aspect-square">
            <img
              src={images[currentImageIndex]}
              alt={`${estuche.name} - Imagen ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Thumbnails */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-primary scale-110' 
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Image counter */}
            <div className="absolute top-4 left-4 bg-background/80 px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-6 flex flex-col">
            <div className="flex-1">
              <div className="flex gap-2 mb-3">
                {estuche.sale_price && (
                  <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                    OFERTA
                  </span>
                )}
                {estuche.free_shipping && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    ENVÍO GRATIS
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">{estuche.name}</h2>
              
              <div className="flex items-center gap-3 mb-4">
                {estuche.sale_price ? (
                  <>
                    <span className="text-3xl font-bold text-primary">${estuche.sale_price}</span>
                    <span className="text-xl text-muted-foreground line-through">${estuche.price}</span>
                    <span className="text-sm bg-destructive/10 text-destructive px-2 py-1 rounded">
                      {Math.round((1 - estuche.sale_price / estuche.price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-foreground">${estuche.price}</span>
                )}
              </div>

              {!estuche.free_shipping && estuche.shipping_cost > 0 && (
                <p className="text-sm text-muted-foreground mb-4">
                  Costo de envío: ${estuche.shipping_cost}
                </p>
              )}

              {estuche.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-2">Descripción</h3>
                  <p className="text-muted-foreground">{estuche.description}</p>
                </div>
              )}
            </div>

            <Button 
              size="lg" 
              className="w-full gap-2"
              onClick={() => {
                onAddToCart(estuche);
                onClose();
              }}
            >
              <ShoppingCart className="h-5 w-5" />
              Agregar al Carrito
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EstucheGalleryModal;
