import { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { usePines, Pin } from '@/hooks/usePines';
import { useCart } from '@/context/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Pines = () => {
  const { pines, loading } = usePines();
  const { addItem } = useCart();
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);

  const handleAddToCart = (pin: Pin) => {
    const productForCart = {
      id: pin.id,
      name: pin.name,
      price: pin.sale_price || pin.price,
      originalPrice: pin.sale_price ? pin.price : undefined,
      image: pin.image_url,
      images: [pin.image_url],
      colors: [],
      collection: 'pines',
      stock: pin.stock || 0,
      description: pin.description || '',
      isOnSale: !!pin.sale_price
    };
    addItem(productForCart);
    toast.success('Pin agregado al carrito');
    setSelectedPin(null);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">Pines</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Descubre nuestra colección de pines de alta calidad para personalizar tus gorras.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : pines.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Próximamente tendremos pines disponibles.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {pines.map((pin) => (
              <Card
                key={pin.id}
                className={`overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${(pin.stock ?? 0) <= 0 ? 'opacity-60' : ''}`}
                onClick={() => setSelectedPin(pin)}
              >
                <div className="aspect-square relative">
                  <img
                    src={pin.image_url}
                    alt={pin.name}
                    className="w-full h-full object-cover"
                  />
                  {pin.sale_price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      OFERTA
                    </div>
                  )}
                  {(pin.stock ?? 0) <= 0 && (
                    <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                      AGOTADO
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm truncate">{pin.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {pin.sale_price ? (
                      <>
                        <span className="text-base font-bold text-primary">
                          ${pin.sale_price.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          ${pin.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-base font-bold">
                        ${pin.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {(pin.stock ?? 0) > 0 && (pin.stock ?? 0) <= 5 && (
                    <p className="text-xs text-orange-500 mt-1">
                      ¡Solo quedan {pin.stock}!
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de detalle */}
        <Dialog open={!!selectedPin} onOpenChange={() => setSelectedPin(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedPin?.name}</DialogTitle>
            </DialogHeader>
            {selectedPin && (
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={selectedPin.image_url}
                    alt={selectedPin.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {selectedPin.sale_price ? (
                      <>
                        <span className="text-2xl font-bold text-primary">
                          ${selectedPin.sale_price.toFixed(2)}
                        </span>
                        <span className="text-lg text-muted-foreground line-through">
                          ${selectedPin.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold">
                        ${selectedPin.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {(selectedPin.stock ?? 0) <= 0 ? (
                    <p className="text-red-500 font-medium">Producto agotado</p>
                  ) : (selectedPin.stock ?? 0) <= 5 ? (
                    <p className="text-orange-500 text-sm">
                      ¡Solo quedan {selectedPin.stock} disponibles!
                    </p>
                  ) : (
                    <p className="text-green-600 text-sm">
                      {selectedPin.stock} en stock
                    </p>
                  )}
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleAddToCart(selectedPin)}
                  disabled={(selectedPin.stock ?? 0) <= 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {(selectedPin.stock ?? 0) <= 0 ? 'Agotado' : 'Agregar al Carrito'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Pines;
