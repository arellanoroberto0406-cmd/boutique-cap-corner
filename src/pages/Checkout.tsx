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
import oxxoQrCode from "@/assets/oxxo-qr.png";

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
  const [savedOrderTotals, setSavedOrderTotals] = useState<{
    subtotal: number;
    shipping: number;
    total: number;
  } | null>(null);

  const shippingCost = totalPrice >= 500 ? 0 : 99;
  const finalTotal = totalPrice + shippingCost;
  
  // Use saved totals after order is complete (cart is cleared)
  const displaySubtotal = savedOrderTotals?.subtotal ?? totalPrice;
  const displayShipping = savedOrderTotals?.shipping ?? shippingCost;
  const displayTotal = savedOrderTotals?.total ?? finalTotal;

  const bankInfo = {
    bank: "KLAR",
    accountName: "GABRIEL ARELLANO",
    clabe: "661610006945761800",
  };

  const kioskoInfo = {
    cardNumber: "5401040143621084",
    clabe: "661610006945761800",
    stores: ["7-Eleven", "Walmart", "Walmart Express", "Bodega Aurrera", "Kiosko", "Farmapronto", "X24", "Airpak", "Soriana"],
  };

  const oxxoInfo = {
    referenceCode: "2242 1705 6014 0578",
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

      // Save order totals before clearing cart
      setSavedOrderTotals({
        subtotal: totalPrice,
        shipping: shippingCost,
        total: finalTotal,
      });
      
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
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>${displaySubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Envío:</span>
                      <span className={displayShipping === 0 ? "text-green-500 font-semibold" : ""}>
                        {displayShipping === 0 ? "GRATIS" : `$${displayShipping.toFixed(2)}`}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold">Total a pagar:</span>
                      <span className="font-bold text-primary">${displayTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <a
                      href={`https://wa.me/526692646083?text=${encodeURIComponent(`¡Hola! Acabo de realizar un pedido con número ${orderId.slice(0, 8).toUpperCase()}. Adjunto mi comprobante de pago.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Enviar comprobante por WhatsApp
                      </Button>
                    </a>
                  </div>
                  <div className="mt-4 p-3 bg-background rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      📦 Una vez recibido tu pago, te enviaremos el número de seguimiento de tu pedido por WhatsApp.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === "oxxo" && (
                <div className="bg-secondary rounded-lg p-6 text-left mb-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 justify-center">
                    <Store className="h-5 w-5 text-red-600" />
                    Pago en OXXO
                  </h3>
                  
                  <div className="bg-background rounded-lg p-6 text-center mb-4">
                    <img 
                      src={oxxoQrCode} 
                      alt="Código QR para pago en OXXO" 
                      className="w-64 h-64 md:w-80 md:h-80 mx-auto object-contain"
                    />
                    <p className="text-muted-foreground text-sm mt-4 mb-2">
                      Si es necesario, dicta este código numérico para hacer tu depósito en caja.
                    </p>
                    <span className="font-mono text-muted-foreground text-lg tracking-wider">
                      2242 1705 6014 0578
                    </span>
                  </div>

                  <div className="bg-background rounded-lg p-4 space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Beneficiario:</span>
                      <span className="font-medium">{bankInfo.accountName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tu pedido:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{orderId.slice(0, 8).toUpperCase()}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(orderId.slice(0, 8).toUpperCase())}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>${displaySubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Envío:</span>
                      <span className={displayShipping === 0 ? "text-green-500 font-semibold" : ""}>
                        {displayShipping === 0 ? "GRATIS" : `$${displayShipping.toFixed(2)}`}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold">Total a pagar:</span>
                      <span className="font-bold text-primary">${displayTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <a
                      href={`https://wa.me/526692646083?text=${encodeURIComponent(`¡Hola! Acabo de realizar un pedido con número ${orderId.slice(0, 8).toUpperCase()}. Adjunto mi comprobante de pago en OXXO.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Enviar comprobante por WhatsApp
                      </Button>
                    </a>
                  </div>
                  <div className="mt-4 p-3 bg-background rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      📦 Una vez recibido tu pago, te enviaremos el número de seguimiento de tu pedido por WhatsApp.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === "kiosko" && (
                <div className="bg-secondary rounded-lg p-6 text-left mb-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Pago en Kiosco
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Realiza un depósito a la siguiente tarjeta en cualquiera de estas tiendas:
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {kioskoInfo.stores.map((store) => (
                      <span key={store} className="bg-background px-3 py-1 rounded-full text-sm">
                        {store}
                      </span>
                    ))}
                  </div>
                  <div className="bg-background rounded p-4 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Número de tarjeta:</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg font-bold">{kioskoInfo.cardNumber}</span>
                        <Button size="icon" variant="ghost" onClick={() => copyToClipboard(kioskoInfo.cardNumber)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">CLABE (alternativa):</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">{kioskoInfo.clabe}</span>
                        <Button size="icon" variant="ghost" onClick={() => copyToClipboard(kioskoInfo.clabe)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>${displaySubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Envío:</span>
                      <span className={displayShipping === 0 ? "text-green-500 font-semibold" : ""}>
                        {displayShipping === 0 ? "GRATIS" : `$${displayShipping.toFixed(2)}`}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold">Total a pagar:</span>
                      <span className="font-bold text-primary">${displayTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <a
                      href={`https://wa.me/526692646083?text=${encodeURIComponent(`¡Hola! Acabo de realizar un pedido con número ${orderId.slice(0, 8).toUpperCase()}. Adjunto mi comprobante de pago.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Enviar comprobante por WhatsApp
                      </Button>
                    </a>
                  </div>
                  <div className="mt-4 p-3 bg-background rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      📦 Una vez recibido tu pago, te enviaremos el número de seguimiento de tu pedido por WhatsApp.
                    </p>
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
                      htmlFor="oxxo"
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        paymentMethod === "oxxo" ? "border-orange-500 bg-orange-500/10" : "border-border hover:border-orange-400"
                      }`}
                    >
                      <RadioGroupItem value="oxxo" id="oxxo" />
                      <Store className="h-6 w-6 text-red-600" />
                      <div className="flex-1">
                        <p className="font-medium">Pago en OXXO</p>
                        <p className="text-sm text-muted-foreground">Paga en efectivo en cualquier OXXO</p>
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
                        <p className="font-medium">Otro Kiosco</p>
                        <p className="text-sm text-muted-foreground">7-Eleven, Farmacias y más</p>
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
