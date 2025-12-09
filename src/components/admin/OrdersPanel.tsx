import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Package,
  Truck,
  Eye,
  Bell,
  RefreshCw,
  History,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string | null;
  shipping_zip: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  notes: string | null;
  tracking_number: string | null;
  spei_reference: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_option: string | null;
  selected_color: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface StatusHistoryEntry {
  id: string;
  status_type: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  notes: string | null;
  created_at: string;
}

const paymentStatusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30', icon: Clock },
  paid: { label: 'Pagado', color: 'bg-green-500/20 text-green-600 border-green-500/30', icon: CheckCircle2 },
  failed: { label: 'Rechazado', color: 'bg-red-500/20 text-red-600 border-red-500/30', icon: XCircle },
  refunded: { label: 'Reembolsado', color: 'bg-gray-500/20 text-gray-600 border-gray-500/30', icon: RefreshCw },
};

const orderStatusConfig = {
  pending: { label: 'Nuevo', color: 'bg-blue-500/20 text-blue-600 border-blue-500/30', icon: Package },
  processing: { label: 'En proceso', color: 'bg-purple-500/20 text-purple-600 border-purple-500/30', icon: Package },
  shipped: { label: 'Enviado', color: 'bg-cyan-500/20 text-cyan-600 border-cyan-500/30', icon: Truck },
  delivered: { label: 'Entregado', color: 'bg-green-500/20 text-green-600 border-green-500/30', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-600 border-red-500/30', icon: XCircle },
};

const paymentMethodLabels: Record<string, string> = {
  transfer: 'Transferencia',
  oxxo: 'OXXO',
  kiosko: 'Kiosco',
  stripe: 'Tarjeta',
};

export const OrdersPanel: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const fetchStatusHistory = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStatusHistory(data || []);
    } catch (error) {
      console.error('Error fetching status history:', error);
    }
  };

  const recordStatusChange = async (
    orderId: string, 
    statusType: 'payment' | 'order', 
    oldStatus: string, 
    newStatus: string
  ) => {
    try {
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status_type: statusType,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by: 'admin'
        });
    } catch (error) {
      console.error('Error recording status change:', error);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Suscripción en tiempo real para nuevos pedidos
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Nuevo pedido recibido:', payload);
          const newOrder = payload.new as Order;
          setOrders(prev => [newOrder, ...prev]);
          setNewOrdersCount(prev => prev + 1);
          
          // Notificación visual y sonora
          toast.success(`¡Nuevo pedido de ${newOrder.customer_name}!`, {
            description: `Total: $${newOrder.total.toFixed(2)} - ${paymentMethodLabels[newOrder.payment_method] || newOrder.payment_method}`,
            duration: 10000,
          });
          
          // Sonido de notificación
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVxnucrCn15BOpixyL+IdVuJkqOfmYWCpL3LuJV0XWx+hYF0aGVpcHdvX0g3SlxkZWJfaHCBi4yCd25ye4WNj4V3aWVrd4GEfHJnZG56hImEd2hha3eAhH5yZmVsenSBhoCFf3t2c3V4dnV0c3N0dnh8f4KEgoB+fHt7e3t8fX5/gIGCgoKCgYGAgICAgICAgIGBgYGBgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKC');
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } catch (e) {}
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          const updatedOrder = payload.new as Order;
          const oldOrder = payload.old as Partial<Order>;
          
          // Detectar si se subió un nuevo comprobante
          if (updatedOrder.receipt_url && !oldOrder.receipt_url) {
            // Notificación visual
            toast.success(`📎 ¡Comprobante recibido!`, {
              description: `${updatedOrder.customer_name} subió su comprobante - Pedido #${updatedOrder.id.slice(0, 8).toUpperCase()}`,
              duration: 15000,
              action: {
                label: 'Ver comprobante',
                onClick: () => window.open(updatedOrder.receipt_url!, '_blank'),
              },
            });
            
            // Sonido de notificación diferente para comprobantes
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRl9vT19teleVxnucrCn15BOpixyL+IdVuJkqOfmYWCpL3LuJV0XWx+hYF0aGVpcHdvX0g3SlxkZWJfaHCBi4yCd25ye4WNj4V3aWVrd4GEfHJnZG56hImEd2hha3eAhH5yZmVsenSBhoCFf3t2c3V4dnV0c3N0dnh8f4KEgoB+fHt7e3t8fX5/gIGCgoKCgYGAgICAgICAgIGBgYGBgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKC');
              audio.volume = 0.6;
              audio.play().catch(() => {});
              // Segundo sonido para mayor alerta
              setTimeout(() => {
                const audio2 = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVxnucrCn15BOpixyL+IdVuJkqOfmYWCpL3LuJV0XWx+hYF0aGVpcHdvX0g3SlxkZWJfaHCBi4yCd25ye4WNj4V3aWVrd4GEfHJnZG56hImEd2hha3eAhH5yZmVsenSBhoCFf3t2c3V4dnV0c3N0dnh8f4KEgoB+fHt7e3t8fX5/gIGCgoKCgYGAgICAgICAgIGBgYGBgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKC');
                audio2.volume = 0.5;
                audio2.play().catch(() => {});
              }, 300);
            } catch (e) {}
          }
          
          setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getWhatsAppMessageForPayment = (order: Order, status: string) => {
    const orderId = order.id.slice(0, 8).toUpperCase();
    const messages: Record<string, string> = {
      paid: `¡Hola ${order.customer_name}! 🎉 Te confirmamos que hemos recibido tu pago para el pedido #${orderId}. Pronto lo prepararemos para envío. ¡Gracias por tu compra!`,
      failed: `Hola ${order.customer_name}, lamentamos informarte que hubo un problema con el pago de tu pedido #${orderId}. Por favor contáctanos para resolverlo.`,
      refunded: `Hola ${order.customer_name}, te confirmamos que hemos procesado el reembolso de tu pedido #${orderId}. El dinero se reflejará en tu cuenta en los próximos días.`,
      pending: `Hola ${order.customer_name}, tu pedido #${orderId} está pendiente de pago. ¿Necesitas ayuda para completar tu compra?`,
    };
    return messages[status] || `Hola ${order.customer_name}, sobre tu pedido #${orderId}...`;
  };

  const getWhatsAppMessageForOrder = (order: Order, status: string) => {
    const orderId = order.id.slice(0, 8).toUpperCase();
    const trackingInfo = order.tracking_number 
      ? `\n\n📍 Número de guía: ${order.tracking_number}` 
      : '';
    
    const messages: Record<string, string> = {
      processing: `¡Hola ${order.customer_name}! 📦 Tu pedido #${orderId} ya está siendo preparado. Te avisaremos cuando sea enviado.`,
      shipped: `¡Hola ${order.customer_name}! 🚚 Tu pedido #${orderId} ha sido enviado.${trackingInfo}\n\n¡Gracias por tu compra!`,
      delivered: `¡Hola ${order.customer_name}! ✅ Tu pedido #${orderId} ha sido entregado. ¡Esperamos que lo disfrutes! ¿Nos compartes tu opinión?`,
      cancelled: `Hola ${order.customer_name}, lamentamos informarte que tu pedido #${orderId} ha sido cancelado. Contáctanos si tienes dudas.`,
      pending: `Hola ${order.customer_name}, tu pedido #${orderId} está siendo revisado. Te contactaremos pronto.`,
    };
    return messages[status] || `Hola ${order.customer_name}, sobre tu pedido #${orderId}...`;
  };

  const openWhatsAppForPayment = (order: Order, status: string) => {
    const message = getWhatsAppMessageForPayment(order, status);
    const phone = order.customer_phone.replace(/\D/g, '');
    const fullPhone = phone.startsWith('52') ? phone : `52${phone}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const openWhatsAppForOrder = (order: Order, status: string) => {
    const message = getWhatsAppMessageForOrder(order, status);
    const phone = order.customer_phone.replace(/\D/g, '');
    const fullPhone = phone.startsWith('52') ? phone : `52${phone}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const sendPaymentConfirmationWhatsApp = async (order: Order) => {
    try {
      // Fetch order items
      const { data: items } = await supabase
        .from('order_items')
        .select('product_name, quantity, selected_color')
        .eq('order_id', order.id);

      const formattedItems = items?.map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        color: item.selected_color,
      })) || [];

      const { data, error } = await supabase.functions.invoke('send-order-whatsapp', {
        body: {
          type: 'payment_confirmed',
          orderId: order.id,
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          speiReference: order.spei_reference,
          total: order.total,
          items: formattedItems,
        },
      });

      if (error) {
        console.error('Error sending payment confirmation WhatsApp:', error);
        return false;
      }

      console.log('Payment confirmation WhatsApp sent:', data);
      return data?.success || false;
    } catch (error) {
      console.error('Error invoking send-order-whatsapp:', error);
      return false;
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    const oldStatus = order?.payment_status || 'pending';
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      
      // Registrar en historial
      await recordStatusChange(orderId, 'payment', oldStatus, newStatus);
      
      // Si el pago fue confirmado, enviar automáticamente WhatsApp al cliente
      if (newStatus === 'paid' && order) {
        toast.loading('Enviando notificación al cliente...', { id: 'whatsapp-notification' });
        
        const whatsappSent = await sendPaymentConfirmationWhatsApp(order);
        
        if (whatsappSent) {
          toast.success('Pago confirmado y cliente notificado por WhatsApp', { 
            id: 'whatsapp-notification',
            duration: 5000,
          });
        } else {
          toast.success('Pago confirmado', { 
            id: 'whatsapp-notification',
            action: {
              label: 'Notificar manualmente',
              onClick: () => openWhatsAppForPayment(order, newStatus),
            },
            duration: 8000,
          });
        }
      } else if (order) {
        toast.success('Estado de pago actualizado', {
          action: {
            label: 'Notificar por WhatsApp',
            onClick: () => openWhatsAppForPayment(order, newStatus),
          },
          duration: 8000,
        });
      } else {
        toast.success('Estado de pago actualizado');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const sendOrderShippedWhatsApp = async (order: Order) => {
    try {
      // Fetch order items
      const { data: items } = await supabase
        .from('order_items')
        .select('product_name, quantity, selected_color')
        .eq('order_id', order.id);

      const formattedItems = items?.map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        color: item.selected_color,
      })) || [];

      const { data, error } = await supabase.functions.invoke('send-order-whatsapp', {
        body: {
          type: 'order_shipped',
          orderId: order.id,
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          trackingNumber: order.tracking_number,
          shippingCity: order.shipping_city,
          shippingState: order.shipping_state,
          items: formattedItems,
        },
      });

      if (error) {
        console.error('Error sending order shipped WhatsApp:', error);
        return false;
      }

      console.log('Order shipped WhatsApp sent:', data);
      return data?.success || false;
    } catch (error) {
      console.error('Error invoking send-order-whatsapp:', error);
      return false;
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    const oldStatus = order?.order_status || 'pending';
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      
      // Registrar en historial
      await recordStatusChange(orderId, 'order', oldStatus, newStatus);
      
      // Si el pedido fue enviado, enviar automáticamente WhatsApp al cliente
      if (newStatus === 'shipped' && order) {
        toast.loading('Enviando notificación de envío al cliente...', { id: 'whatsapp-shipped' });
        
        const whatsappSent = await sendOrderShippedWhatsApp(order);
        
        if (whatsappSent) {
          toast.success('Pedido marcado como enviado y cliente notificado', { 
            id: 'whatsapp-shipped',
            duration: 5000,
          });
        } else {
          toast.success('Pedido marcado como enviado', { 
            id: 'whatsapp-shipped',
            action: {
              label: 'Notificar manualmente',
              onClick: () => openWhatsAppForOrder(order, newStatus),
            },
            duration: 8000,
          });
        }
      } else if (order) {
        toast.success('Estado del pedido actualizado', {
          action: {
            label: 'Notificar por WhatsApp',
            onClick: () => openWhatsAppForOrder(order, newStatus),
          },
          duration: 8000,
        });
      } else {
        toast.success('Estado del pedido actualizado');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const openOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    await Promise.all([
      fetchOrderItems(order.id),
      fetchStatusHistory(order.id)
    ]);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.spei_reference && order.spei_reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
    const matchesOrder = orderFilter === 'all' || order.order_status === orderFilter;
    
    return matchesSearch && matchesPayment && matchesOrder;
  });

  const pendingPayments = orders.filter(o => o.payment_status === 'pending');
  const urgentOrders = pendingPayments.filter(o => differenceInHours(new Date(), new Date(o.created_at)) > 24);
  const paidOrders = orders.filter(o => o.payment_status === 'paid');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pedidos</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pago Pendiente</p>
              <p className="text-2xl font-bold">{pendingPayments.length}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
        
        <Card className={`${urgentOrders.length > 0 ? 'bg-red-500/10 border-red-500/30 animate-pulse' : 'bg-orange-500/10 border-orange-500/30'}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Urgentes (+24h)</p>
              <p className="text-2xl font-bold">{urgentOrders.length}</p>
            </div>
            <AlertTriangle className={`h-8 w-8 ${urgentOrders.length > 0 ? 'text-red-500' : 'text-orange-500'}`} />
          </CardContent>
        </Card>
        
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pagados</p>
              <p className="text-2xl font-bold">{paidOrders.length}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
      </div>

      {/* Alerta de nuevos pedidos */}
      {newOrdersCount > 0 && (
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary animate-bounce" />
              <span className="font-medium">
                {newOrdersCount} nuevo{newOrdersCount > 1 ? 's' : ''} pedido{newOrdersCount > 1 ? 's' : ''} recibido{newOrdersCount > 1 ? 's' : ''}
              </span>
            </div>
            <Button size="sm" onClick={() => setNewOrdersCount(0)}>
              Marcar como visto
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, teléfono o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los pagos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="failed">Rechazado</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={orderFilter} onValueChange={setOrderFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado del pedido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Nuevo</SelectItem>
                <SelectItem value="processing">En proceso</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchOrders}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID / Ref. SPEI</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const isUrgent = order.payment_status === 'pending' && 
                    differenceInHours(new Date(), new Date(order.created_at)) > 24;
                  const paymentConfig = paymentStatusConfig[order.payment_status as keyof typeof paymentStatusConfig] || paymentStatusConfig.pending;
                  const orderConfig = orderStatusConfig[order.order_status as keyof typeof orderStatusConfig] || orderStatusConfig.pending;
                  
                  return (
                    <TableRow key={order.id} className={isUrgent ? 'bg-red-500/5' : ''}>
                      <TableCell className="font-mono text-sm">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {isUrgent && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            {order.id.slice(0, 8).toUpperCase()}
                          </div>
                          {order.spei_reference && (
                            <span className="text-xs text-primary font-semibold">{order.spei_reference}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {paymentMethodLabels[order.payment_method] || order.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.payment_status}
                          onValueChange={(value) => updatePaymentStatus(order.id, value)}
                        >
                          <SelectTrigger className={`w-32 h-8 text-xs ${paymentConfig.color}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="paid">Pagado</SelectItem>
                            <SelectItem value="failed">Rechazado</SelectItem>
                            <SelectItem value="refunded">Reembolsado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.order_status}
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className={`w-32 h-8 text-xs ${orderConfig.color}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Nuevo</SelectItem>
                            <SelectItem value="processing">En proceso</SelectItem>
                            <SelectItem value="shipped">Enviado</SelectItem>
                            <SelectItem value="delivered">Entregado</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(order.created_at), 'dd/MM/yyyy', { locale: es })}</p>
                          <p className="text-muted-foreground text-xs">
                            {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {/* Botón rápido para confirmar pago */}
                          {order.payment_status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                              onClick={() => updatePaymentStatus(order.id, 'paid')}
                              title="Confirmar pago"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Confirmar
                            </Button>
                          )}
                          {/* Indicador de comprobante */}
                          {order.receipt_url && (
                            <a
                              href={order.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              title="Ver comprobante"
                            >
                              <Button variant="ghost" size="sm" className="h-8">
                                <ImageIcon className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => openOrderDetails(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron pedidos
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalles del pedido */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Pedido #{selectedOrder?.id.slice(0, 8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Info del cliente */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Cliente</h4>
                  <p>{selectedOrder.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_phone}</p>
                  {selectedOrder.customer_email && (
                    <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>
                  )}
              </div>

              {/* Referencia SPEI */}
              {selectedOrder.spei_reference && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-1">Referencia SPEI</h4>
                  <p className="font-mono text-lg text-primary">{selectedOrder.spei_reference}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    El cliente debe incluir esta referencia en el concepto de su transferencia.
                  </p>
                </div>
              )}

              {/* Comprobante de pago */}
              {selectedOrder.receipt_url && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-green-600" />
                    Comprobante de Pago
                  </h4>
                  <div className="relative">
                    <img 
                      src={selectedOrder.receipt_url} 
                      alt="Comprobante de pago" 
                      className="max-h-64 w-auto rounded-lg border border-green-300 cursor-pointer hover:opacity-90"
                      onClick={() => window.open(selectedOrder.receipt_url!, '_blank')}
                    />
                    <a 
                      href={selectedOrder.receipt_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-sm hover:bg-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  {selectedOrder.payment_status === 'pending' && (
                    <Button
                      className="w-full mt-3 bg-green-600 hover:bg-green-700"
                      onClick={() => updatePaymentStatus(selectedOrder.id, 'paid')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Confirmar Pago Recibido
                    </Button>
                  )}
                </div>
              )}
                <div>
                  <h4 className="font-semibold mb-2">Envío</h4>
                  <p className="text-sm">{selectedOrder.shipping_address}</p>
                  <p className="text-sm">{selectedOrder.shipping_city}, {selectedOrder.shipping_state}</p>
                  <p className="text-sm">CP: {selectedOrder.shipping_zip}</p>
                </div>
              </div>

              {/* Número de guía */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Número de Guía
                </h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ingresa el número de guía..."
                    value={selectedOrder.tracking_number || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedOrder({ ...selectedOrder, tracking_number: value });
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from('orders')
                          .update({ 
                            tracking_number: selectedOrder.tracking_number,
                            updated_at: new Date().toISOString()
                          })
                          .eq('id', selectedOrder.id);
                        
                        if (error) throw error;
                        
                        // Update local state
                        setOrders(prev => prev.map(o => 
                          o.id === selectedOrder.id 
                            ? { ...o, tracking_number: selectedOrder.tracking_number }
                            : o
                        ));
                        
                        toast.success('Número de guía guardado', {
                          action: {
                            label: 'Notificar cliente',
                            onClick: () => {
                              const phone = selectedOrder.customer_phone.replace(/\D/g, '');
                              const fullPhone = phone.startsWith('52') ? phone : `52${phone}`;
                              const message = `¡Hola ${selectedOrder.customer_name}! 🚚 Tu pedido #${selectedOrder.id.slice(0, 8).toUpperCase()} ha sido enviado.\n\n📍 Número de guía: ${selectedOrder.tracking_number}\n\n¡Gracias por tu compra!`;
                              window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
                            },
                          },
                          duration: 8000,
                        });
                      } catch (error) {
                        console.error('Error saving tracking number:', error);
                        toast.error('Error al guardar número de guía');
                      }
                    }}
                  >
                    Guardar
                  </Button>
                </div>
                {selectedOrder.tracking_number && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Guía registrada: {selectedOrder.tracking_number}
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Productos</h4>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        {item.product_option && (
                          <p className="text-sm text-muted-foreground">{item.product_option}</p>
                        )}
                        {item.selected_color && (
                          <p className="text-sm text-muted-foreground">Color: {item.selected_color}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.total_price.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x ${item.unit_price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Envío:</span>
                  <span>${selectedOrder.shipping_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Historial de estados */}
              {statusHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Historial de Cambios
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {statusHistory.map((entry) => {
                      const isPayment = entry.status_type === 'payment';
                      const config = isPayment 
                        ? paymentStatusConfig[entry.new_status as keyof typeof paymentStatusConfig]
                        : orderStatusConfig[entry.new_status as keyof typeof orderStatusConfig];
                      const oldConfig = entry.old_status 
                        ? (isPayment 
                            ? paymentStatusConfig[entry.old_status as keyof typeof paymentStatusConfig]
                            : orderStatusConfig[entry.old_status as keyof typeof orderStatusConfig])
                        : null;
                      
                      return (
                        <div 
                          key={entry.id} 
                          className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg text-sm"
                        >
                          <div className="flex-shrink-0 w-16 text-xs text-muted-foreground">
                            {format(new Date(entry.created_at), 'dd/MM HH:mm', { locale: es })}
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <Badge variant="outline" className="text-xs">
                              {isPayment ? 'Pago' : 'Pedido'}
                            </Badge>
                            {oldConfig && (
                              <>
                                <span className={`px-2 py-0.5 rounded text-xs ${oldConfig.color}`}>
                                  {oldConfig.label}
                                </span>
                                <span className="text-muted-foreground">→</span>
                              </>
                            )}
                            <span className={`px-2 py-0.5 rounded text-xs ${config?.color || 'bg-gray-500/20'}`}>
                              {config?.label || entry.new_status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notas */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notas</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Botón WhatsApp */}
              <a
                href={`https://wa.me/52${selectedOrder.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${selectedOrder.customer_name}! Sobre tu pedido #${selectedOrder.id.slice(0, 8).toUpperCase()}...`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Contactar por WhatsApp
                </Button>
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
