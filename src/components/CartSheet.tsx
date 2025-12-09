import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Plus, Minus, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FreeShippingProgress } from "./FreeShippingProgress";
import { SuggestedProducts } from "./SuggestedProducts";

export const CartSheet = () => {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* Agregamos un efecto de sonido visual cuando hay items */}
      <style>
        {`
          @keyframes bounce-in {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          .cart-badge-animate {
            animation: bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
        `}
      </style>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-12 w-12 md:h-10 md:w-10 hover:bg-muted relative group transition-all duration-300" aria-label="Carrito de compras">
          <ShoppingCart className="h-6 w-6 md:h-5 md:w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs cart-badge-animate animate-pulse">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col animate-slide-in-right">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between animate-fade-in-up">
            <span>Carrito ({totalItems})</span>
            {items.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart} className="hover:text-destructive transition-colors duration-300">
                Vaciar
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Tu carrito está vacío</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item, index) => (
                  <div 
                    key={`${item.id}-${item.selectedColor}`} 
                    className="flex gap-4 animate-fade-in-up border border-border/50 rounded-lg p-3 hover:border-primary/30 transition-all duration-300 hover:shadow-md"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md transition-transform duration-300 hover:scale-110"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          {item.selectedColor && (
                            <p className="text-xs text-muted-foreground">
                              Color: {item.selectedColor}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-4 w-4 transition-transform duration-300 hover:rotate-90" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 hover:bg-primary/10 hover:border-primary transition-all duration-300 hover:scale-110"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center transition-all duration-300">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 hover:bg-primary/10 hover:border-primary transition-all duration-300 hover:scale-110"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-bold text-primary transition-all duration-300 hover:scale-110">
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4 animate-fade-in-up">
              <FreeShippingProgress currentTotal={totalPrice} />
              
              <SuggestedProducts 
                excludeIds={items.map(item => item.id)} 
                maxItems={2} 
              />
              
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    Envío:
                  </span>
                  <span className={totalPrice >= 500 ? "text-green-500 font-semibold" : ""}>
                    {totalPrice >= 500 ? "GRATIS" : "$99"}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary text-2xl">
                    ${(totalPrice + (totalPrice >= 500 ? 0 : 99)).toLocaleString()}
                  </span>
                </div>
              </div>
              <Button 
                className="w-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-orange-500 hover:bg-orange-600" 
                size="lg"
                onClick={handleCheckout}
              >
                Proceder al Pago
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
