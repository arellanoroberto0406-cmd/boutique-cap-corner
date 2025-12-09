import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_color: string | null;
  product_option: string | null;
}

interface Order {
  id: string;
  spei_reference: string | null;
  customer_name: string;
  payment_status: string;
  order_status: string;
  total: number;
  shipping_city: string;
  shipping_state: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

const paymentStatusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  paid: { label: "Pagado", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

const orderStatusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Package }> = {
  pending: { label: "Pendiente", variant: "secondary", icon: Clock },
  processing: { label: "En proceso", variant: "outline", icon: Package },
  shipped: { label: "Enviado", variant: "default", icon: Truck },
  delivered: { label: "Entregado", variant: "default", icon: CheckCircle },
  cancelled: { label: "Cancelado", variant: "destructive", icon: XCircle },
};

const TrackOrder = () => {
  const [reference, setReference] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reference.trim()) {
      toast.error("Ingresa tu número de referencia");
      return;
    }

    setIsLoading(true);
    setSearched(true);

    try {
      // Search by SPEI reference or order ID
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("id, spei_reference, customer_name, payment_status, order_status, total, shipping_city, shipping_state, tracking_number, created_at, updated_at")
        .or(`spei_reference.ilike.%${reference.trim()}%,id.ilike.%${reference.trim()}%`)
        .maybeSingle();

      if (orderError) throw orderError;

      if (!orderData) {
        setOrder(null);
        setOrderItems([]);
        toast.error("No se encontró ningún pedido con esa referencia");
        return;
      }

      setOrder(orderData);

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("id, product_name, quantity, unit_price, total_price, selected_color, product_option")
        .eq("order_id", orderData.id);

      if (itemsError) throw itemsError;

      setOrderItems(itemsData || []);
    } catch (error) {
      console.error("Error searching order:", error);
      toast.error("Error al buscar el pedido");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    const StatusIcon = orderStatusLabels[status]?.icon || Clock;
    return <StatusIcon className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>
          <h1 className="text-3xl font-bold">Rastrear Pedido</h1>
          <p className="text-primary-foreground/80 mt-2">
            Ingresa tu número de referencia SPEI para consultar el estado de tu pedido
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="max-w-xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Pedido
            </CardTitle>
            <CardDescription>
              Ingresa tu número de referencia (ejemplo: CAP123456XX)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Número de referencia..."
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Buscando..." : "Buscar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Details */}
        {searched && !order && !isLoading && (
          <Card className="max-w-xl mx-auto">
            <CardContent className="py-12 text-center">
              <XCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Pedido no encontrado</h3>
              <p className="text-muted-foreground">
                No encontramos ningún pedido con la referencia "{reference}".
                <br />
                Verifica que el número sea correcto e intenta de nuevo.
              </p>
            </CardContent>
          </Card>
        )}

        {order && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Order Status Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(order.order_status)}
                      Estado del Pedido
                    </CardTitle>
                    <CardDescription>
                      Referencia: {order.spei_reference || order.id.slice(0, 8).toUpperCase()}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={orderStatusLabels[order.order_status]?.variant || "secondary"}>
                      {orderStatusLabels[order.order_status]?.label || order.order_status}
                    </Badge>
                    <Badge variant={paymentStatusLabels[order.payment_status]?.variant || "secondary"}>
                      Pago: {paymentStatusLabels[order.payment_status]?.label || order.payment_status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Timeline */}
                <div className="relative pl-8 space-y-4">
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />
                  
                  <div className="relative">
                    <div className={`absolute -left-5 w-4 h-4 rounded-full border-2 ${order.order_status ? 'bg-primary border-primary' : 'bg-background border-border'}`} />
                    <div>
                      <p className="font-medium">Pedido recibido</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className={`absolute -left-5 w-4 h-4 rounded-full border-2 ${order.payment_status === 'paid' ? 'bg-primary border-primary' : 'bg-background border-border'}`} />
                    <div>
                      <p className="font-medium">Pago confirmado</p>
                      <p className="text-sm text-muted-foreground">
                        {order.payment_status === 'paid' ? 'Completado' : 'Pendiente'}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className={`absolute -left-5 w-4 h-4 rounded-full border-2 ${['shipped', 'delivered'].includes(order.order_status) ? 'bg-primary border-primary' : 'bg-background border-border'}`} />
                    <div>
                      <p className="font-medium">Enviado</p>
                      {order.tracking_number ? (
                        <p className="text-sm text-muted-foreground">
                          Guía: <span className="font-mono font-medium">{order.tracking_number}</span>
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {['shipped', 'delivered'].includes(order.order_status) ? 'En camino' : 'Pendiente'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div className={`absolute -left-5 w-4 h-4 rounded-full border-2 ${order.order_status === 'delivered' ? 'bg-primary border-primary' : 'bg-background border-border'}`} />
                    <div>
                      <p className="font-medium">Entregado</p>
                      <p className="text-sm text-muted-foreground">
                        {order.order_status === 'delivered' ? 'Completado' : 'Pendiente'}
                      </p>
                    </div>
                  </div>
                </div>

                {order.tracking_number && (
                  <>
                    <Separator />
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm font-medium mb-1">Número de guía</p>
                      <p className="font-mono text-lg">{order.tracking_number}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Destino: {order.shipping_city}{order.shipping_state ? `, ${order.shipping_state}` : ''}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Productos del pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {item.quantity}
                          {item.selected_color && ` • Color: ${item.selected_color}`}
                          {item.product_option && ` • ${item.product_option}`}
                        </p>
                      </div>
                      <p className="font-medium">${item.total_price.toFixed(2)}</p>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)} MXN</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card>
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">
                  ¿Tienes dudas sobre tu pedido?{" "}
                  <a
                    href="https://wa.me/5213313686950"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Contáctanos por WhatsApp
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
