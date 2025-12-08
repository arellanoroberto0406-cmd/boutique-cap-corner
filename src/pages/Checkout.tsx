import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  Building2, 
  Store, 
  Truck, 
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  Copy
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { z } from "zod";

const checkoutSchema = z.object({
  name: z.string().min(2, "Nombre muy corto").max(100),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(10, "Teléfono debe tener al menos 10 dígitos").max(15),
  address: z.string().min(5, "Dirección muy corta").max(200),
  city: z.string().min(2, "Ciudad muy corta").max(100),
  state: z.string().max(100).optional(),
  zip: z.string().min(4, "Código postal muy corto").max(10),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
  });
  
  const [paymentMethod, setPaymentMethod] = useState<string>("transfer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shippingCost = totalPrice >= 500 ? 0 : 99;
  const finalTotal = totalPrice + shippingCost;

  const bankInfo = {
    bank: "BBVA",
    accountName: "Gorras Premium MX",
    clabe: "012180001234567890",
    account: "1234567890",
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    try {
      checkoutSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Error en el formulario",
        description: "Por favor corrige los campos marcados",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de continuar",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Crear la orden
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: formData.name,
          customer_email: formData.email || null,
          customer_phone: formData.phone,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_state: formData.state || null,
          shipping_zip: formData.zip,
          payment_method: paymentMethod,
          subtotal: totalPrice,
          shipping_cost: shippingCost,
          total: finalTotal,
          notes: formData.notes || null,
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      // Crear los items de la orden
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_name: item.name,
        product_option: item.selectedColor ? "con color" : undefined,
        selected_color: item.selectedColor || null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderId(orderData.id);
      setOrderComplete(true);
      clearCart();

      toast({
        title: "¡Pedido realizado!",
        description: "Te contactaremos pronto para confirmar tu pedido",
      });

    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error al procesar el pedido",
        description: "Por favor intenta de nuevo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Información copiada al portapapeles",
    });
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-8 text-center">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4">¡Pedido Confirmado!</h1>
              <p className="text-muted-foreground mb-6">
                Tu número de pedido es: <span className="font-mono font-bold text-primary">{orderId.slice(0, 8).toUpperCase()}</span>
              </p>
              
              {paymentMethod === "transfer" && (
                <div className="bg-secondary rounded-lg p-6 text-left mb-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Datos para Transferencia
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Banco:</span>
                      <span className="font-medium">{bankInfo.bank}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Beneficiario:</span>
                      <span className="font-medium">{bankInfo.accountName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">CLABE:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{bankInfo.clabe}</span>
                        <Button size="icon" variant="ghost" onClick={() => copyToClipboard(bankInfo.clabe)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cuenta:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{bankInfo.account}</span>
                        <Button size="icon" variant="ghost" onClick={() => copyToClipboard(bankInfo.account)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold">Total a pagar:</span>
                      <span className="font-bold text-primary">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Envía el comprobante de pago por WhatsApp para confirmar tu pedido.
                  </p>
                </div>
              )}

              {paymentMethod === "kiosko" && (
                <div className="bg-secondary rounded-lg p-6 text-left mb-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Pago en Kiosco
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Realiza tu pago en cualquier tienda OXXO, 7-Eleven o establecimiento con servicios de pago.
                  </p>
                  <div className="bg-background rounded p-4">
                    <p className="text-sm mb-2">Referencia de pago:</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xl font-bold">{orderId.slice(0, 8).toUpperCase()}</span>
                      <Button size="icon" variant="ghost" onClick={() => copyToClipboard(orderId.slice(0, 8).toUpperCase())}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">Total a pagar:</span>
                    <span className="font-bold text-primary">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {paymentMethod === "stripe" && (
                <div className="bg-secondary rounded-lg p-6 text-left mb-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Pago con Tarjeta
                  </h3>
                  <p className="text-muted-foreground">
                    Te contactaremos pronto para procesar tu pago con tarjeta de forma segura.
                  </p>
                </div>
              )}

              <Button onClick={() => navigate("/")} className="w-full">
                Volver a la tienda
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <ShoppingBag className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-6">Agrega productos antes de proceder al pago</p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la tienda
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulario de envío */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Datos de Envío
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Juan Pérez"
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="5512345678"
                        className={errors.phone ? "border-destructive" : ""}
                      />
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (opcional)</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="correo@ejemplo.com"
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Calle, número, colonia"
                      className={errors.address ? "border-destructive" : ""}
                    />
                    {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Ciudad de México"
                        className={errors.city ? "border-destructive" : ""}
                      />
                      {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="CDMX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">Código Postal *</Label>
                      <Input
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        placeholder="01234"
                        className={errors.zip ? "border-destructive" : ""}
                      />
                      {errors.zip && <p className="text-sm text-destructive">{errors.zip}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Instrucciones especiales de entrega..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Métodos de pago */}
              <Card>
                <CardHeader>
                  <CardTitle>Método de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <label
                      htmlFor="stripe"
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        paymentMethod === "stripe" ? "border-orange-500 bg-orange-500/10" : "border-border hover:border-orange-400"
                      }`}
                    >
                      <RadioGroupItem value="stripe" id="stripe" />
                      <CreditCard className="h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Tarjeta de Crédito/Débito</p>
                        <p className="text-sm text-muted-foreground">Pago seguro con Stripe</p>
                      </div>
                    </label>

                    <label
                      htmlFor="transfer"
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        paymentMethod === "transfer" ? "border-orange-500 bg-orange-500/10" : "border-border hover:border-orange-400"
                      }`}
                    >
                      <RadioGroupItem value="transfer" id="transfer" />
                      <Building2 className="h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Transferencia Bancaria</p>
                        <p className="text-sm text-muted-foreground">SPEI o transferencia tradicional</p>
                      </div>
                    </label>

                    <label
                      htmlFor="kiosko"
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        paymentMethod === "kiosko" ? "border-orange-500 bg-orange-500/10" : "border-border hover:border-orange-400"
                      }`}
                    >
                      <RadioGroupItem value="kiosko" id="kiosko" />
                      <Store className="h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Pago en Kiosco</p>
                        <p className="text-sm text-muted-foreground">OXXO, 7-Eleven y más</p>
                      </div>
                    </label>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Resumen del Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground">
                            {item.selectedColor && `Color: ${item.selectedColor} • `}
                            Cant: {item.quantity}
                          </p>
                        </div>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Envío</span>
                      <span className={shippingCost === 0 ? "text-green-500 font-medium" : ""}>
                        {shippingCost === 0 ? "GRATIS" : `$${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                    {shippingCost > 0 && (
                      <p className="text-xs text-muted-foreground">
                        ¡Envío gratis en compras mayores a $500!
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">${finalTotal.toFixed(2)}</span>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Procesando..." : "Confirmar Pedido"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
