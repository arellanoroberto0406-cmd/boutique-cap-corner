import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  Clock, 
  AlertCircle,
  MessageCircle,
  RefreshCw,
  TrendingDown,
  Calendar
} from 'lucide-react';
import { format, differenceInHours, differenceInDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface PendingOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  payment_method: string;
  total: number;
  spei_reference: string | null;
  created_at: string;
}

type UrgencyLevel = 'critical' | 'urgent' | 'warning' | 'normal';

const paymentMethodLabels: Record<string, string> = {
  transfer: 'Transferencia',
  oxxo: 'OXXO',
  kiosko: 'Kiosco',
  stripe: 'Tarjeta',
};

const urgencyConfig: Record<UrgencyLevel, { label: string; color: string; icon: React.ElementType; bgColor: string }> = {
  critical: { 
    label: 'Crítico (+72h)', 
    color: 'text-red-600', 
    icon: AlertTriangle,
    bgColor: 'bg-red-500/10 border-red-500/30'
  },
  urgent: { 
    label: 'Urgente (+48h)', 
    color: 'text-orange-600', 
    icon: AlertCircle,
    bgColor: 'bg-orange-500/10 border-orange-500/30'
  },
  warning: { 
    label: 'Atención (+24h)', 
    color: 'text-yellow-600', 
    icon: Clock,
    bgColor: 'bg-yellow-500/10 border-yellow-500/30'
  },
  normal: { 
    label: 'Reciente', 
    color: 'text-blue-600', 
    icon: Clock,
    bgColor: 'bg-blue-500/10 border-blue-500/30'
  },
};

export const PendingPaymentsReport: React.FC = () => {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('id, customer_name, customer_phone, customer_email, payment_method, total, spei_reference, created_at')
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPendingOrders(data || []);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      toast.error('Error al cargar pedidos pendientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();

    // Suscripción en tiempo real
    const channel = supabase
      .channel('pending-orders-report')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchPendingOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getUrgencyLevel = (createdAt: string): UrgencyLevel => {
    const hours = differenceInHours(new Date(), new Date(createdAt));
    if (hours >= 72) return 'critical';
    if (hours >= 48) return 'urgent';
    if (hours >= 24) return 'warning';
    return 'normal';
  };

  const getTimeRemaining = (createdAt: string) => {
    const hours = differenceInHours(new Date(), new Date(createdAt));
    const days = differenceInDays(new Date(), new Date(createdAt));
    
    if (days > 0) {
      return `${days} día${days > 1 ? 's' : ''} ${hours % 24}h`;
    }
    return `${hours}h`;
  };

  const sendPaymentReminder = (order: PendingOrder) => {
    const phone = order.customer_phone.replace(/\D/g, '');
    const fullPhone = phone.startsWith('52') ? phone : `52${phone}`;
    const reference = order.spei_reference ? `\n\nTu referencia de pago: ${order.spei_reference}` : '';
    const message = `Hola ${order.customer_name}, te recordamos que tu pedido #${order.id.slice(0, 8).toUpperCase()} por $${order.total.toFixed(2)} está pendiente de pago.${reference}\n\n¿Necesitas ayuda para completar tu compra?`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const groupedOrders = pendingOrders.reduce((acc, order) => {
    const level = getUrgencyLevel(order.created_at);
    if (!acc[level]) acc[level] = [];
    acc[level].push(order);
    return acc;
  }, {} as Record<UrgencyLevel, PendingOrder[]>);

  const totalPendingAmount = pendingOrders.reduce((sum, order) => sum + order.total, 0);
  const criticalCount = groupedOrders.critical?.length || 0;
  const urgentCount = groupedOrders.urgent?.length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pendiente</p>
                <p className="text-2xl font-bold">${totalPendingAmount.toFixed(2)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Pendientes</p>
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={`${criticalCount > 0 ? 'bg-red-500/10 border-red-500/30 animate-pulse' : 'bg-red-500/10 border-red-500/30'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos (+72h)</p>
                <p className="text-2xl font-bold">{criticalCount}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 text-red-500 ${criticalCount > 0 ? 'animate-bounce' : ''}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgentes (+48h)</p>
                <p className="text-2xl font-bold">{urgentCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón de actualizar */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={fetchPendingOrders}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Alertas críticas */}
      {criticalCount > 0 && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse" />
              <div>
                <p className="font-semibold text-red-600">¡Atención! {criticalCount} pedido{criticalCount > 1 ? 's' : ''} con más de 72 horas sin pagar</p>
                <p className="text-sm text-muted-foreground">Considera contactar a estos clientes o cancelar los pedidos.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista por urgencia */}
      {(['critical', 'urgent', 'warning', 'normal'] as UrgencyLevel[]).map((level) => {
        const orders = groupedOrders[level];
        if (!orders || orders.length === 0) return null;

        const config = urgencyConfig[level];
        const Icon = config.icon;

        return (
          <Card key={level} className={config.bgColor}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 ${config.color}`}>
                <Icon className="h-5 w-5" />
                {config.label} ({orders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-background rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-medium">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        {order.spei_reference && (
                          <Badge variant="outline" className="text-xs">
                            {order.spei_reference}
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium">{order.customer_name}</p>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
                        <span>{order.customer_phone}</span>
                        <span>•</span>
                        <span>{paymentMethodLabels[order.payment_method] || order.payment_method}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                        <p className={`text-sm ${config.color}`}>
                          Hace {getTimeRemaining(order.created_at)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendPaymentReminder(order)}
                        className="shrink-0"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Recordar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {pendingOrders.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No hay pagos pendientes</p>
            <p className="text-muted-foreground">Todos los pedidos están pagados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
