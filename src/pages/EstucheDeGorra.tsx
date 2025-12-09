import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useEstuches } from "@/hooks/useEstuches";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Truck, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const EstucheDeGorra = () => {
  const { estuches, loading } = useEstuches();
  const { addItem } = useCart();

  const handleAddToCart = (estuche: any) => {
    const product = {
      id: estuche.id,
      name: estuche.name,
      price: estuche.sale_price || estuche.price,
      originalPrice: estuche.sale_price ? estuche.price : undefined,
      image: estuche.image_url,
      images: estuche.images || [],
      colors: [],
      collection: 'Estuches',
      stock: estuche.stock || 10,
      description: estuche.description || '',
      isOnSale: !!estuche.sale_price
    };
    addItem(product);
    toast.success(`${estuche.name} agregado al carrito`);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">Estuche De Gorra</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Protege y transporta tus gorras con nuestros estuches de alta calidad.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando estuches...</span>
          </div>
        ) : estuches.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No hay estuches disponibles en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {estuches.map((estuche) => (
              <Card key={estuche.id} className="overflow-hidden group">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={estuche.image_url}
                    alt={estuche.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {estuche.sale_price && (
                    <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                      OFERTA
                    </span>
                  )}
                  {estuche.free_shipping && (
                    <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      ENVÍO GRATIS
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-foreground">{estuche.name}</h3>
                  {estuche.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{estuche.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    {estuche.sale_price ? (
                      <>
                        <span className="text-xl font-bold text-primary">${estuche.sale_price}</span>
                        <span className="text-sm text-muted-foreground line-through">${estuche.price}</span>
                      </>
                    ) : (
                      <span className="text-xl font-bold text-foreground">${estuche.price}</span>
                    )}
                  </div>
                  {!estuche.free_shipping && estuche.shipping_cost > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">+ ${estuche.shipping_cost} envío</p>
                  )}
                  <Button 
                    className="w-full mt-4 gap-2" 
                    onClick={() => handleAddToCart(estuche)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Agregar al Carrito
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default EstucheDeGorra;
