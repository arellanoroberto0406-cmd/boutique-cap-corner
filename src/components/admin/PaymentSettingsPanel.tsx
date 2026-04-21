import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { usePaymentSettings, PaymentMethod } from '@/hooks/usePaymentSettings';
import {
  Building2, Store, CreditCard, Shield, Clock, Bell,
  DollarSign, Save, Loader2, AlertTriangle, CheckCircle
} from 'lucide-react';

const methodIcons: Record<string, React.ReactNode> = {
  transfer: <Building2 className="h-5 w-5" />,
  oxxo: <Store className="h-5 w-5 text-destructive" />,
  kiosko: <Store className="h-5 w-5" />,
  paypal: <CreditCard className="h-5 w-5" />,
  mercadopago: <CreditCard className="h-5 w-5" />,
};

const configFields: Record<string, { label: string; key: string; type?: string }[]> = {
  transfer: [
    { label: 'Banco', key: 'bank' },
    { label: 'Beneficiario', key: 'account_name' },
    { label: 'CLABE', key: 'clabe' },
    { label: 'Descripción', key: 'description' },
  ],
  oxxo: [
    { label: 'Código de referencia', key: 'reference_code' },
    { label: 'Descripción', key: 'description' },
  ],
  kiosko: [
    { label: 'Número de tarjeta', key: 'card_number' },
    { label: 'CLABE', key: 'clabe' },
    { label: 'Descripción', key: 'description' },
  ],
  paypal: [
    { label: 'Email o enlace de PayPal', key: 'email' },
    { label: 'Descripción', key: 'description' },
  ],
  mercadopago: [
    { label: 'Enlace de pago', key: 'link' },
    { label: 'Descripción', key: 'description' },
  ],
};

const PaymentSettingsPanel = () => {
  const { methods, security, loading, updateMethod, updateSecurity, getSecurityValue } = usePaymentSettings({ admin: true });
  const [editingConfigs, setEditingConfigs] = useState<Record<string, Record<string, any>>>({});
  const [saving, setSaving] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getConfig = (method: PaymentMethod, key: string) => {
    if (editingConfigs[method.id]?.[key] !== undefined) return editingConfigs[method.id][key];
    return (method.config as Record<string, any>)?.[key] || '';
  };

  const setConfig = (methodId: string, key: string, value: string) => {
    setEditingConfigs(prev => ({
      ...prev,
      [methodId]: { ...(prev[methodId] || {}), [key]: value },
    }));
  };

  const handleToggleMethod = async (method: PaymentMethod) => {
    const { error } = await updateMethod(method.id, { is_enabled: !method.is_enabled } as any);
    if (error) toast.error('Error al actualizar');
    else toast.success(`${method.method_name} ${!method.is_enabled ? 'activado' : 'desactivado'}`);
  };

  const handleSaveConfig = async (method: PaymentMethod) => {
    setSaving(method.id);
    const newConfig = { ...method.config, ...(editingConfigs[method.id] || {}) };
    const { error } = await updateMethod(method.id, { config: newConfig } as any);
    if (error) toast.error('Error al guardar');
    else {
      toast.success('Configuración guardada');
      setEditingConfigs(prev => {
        const copy = { ...prev };
        delete copy[method.id];
        return copy;
      });
    }
    setSaving(null);
  };

  const handleToggleSecurity = async (key: string) => {
    const setting = getSecurityValue(key);
    if (!setting) return;
    const { error } = await updateSecurity(setting.id, { is_enabled: !setting.enabled } as any);
    if (error) toast.error('Error al actualizar');
    else toast.success('Configuración actualizada');
  };

  const handleUpdateSecurityValue = async (key: string, value: string) => {
    const setting = getSecurityValue(key);
    if (!setting) return;
    const { error } = await updateSecurity(setting.id, { setting_value: value } as any);
    if (error) toast.error('Error al guardar');
    else toast.success('Valor actualizado');
  };

  const timeLimitSetting = getSecurityValue('payment_time_limit_hours');
  const minAmountSetting = getSecurityValue('min_order_amount');
  const maxAmountSetting = getSecurityValue('max_order_amount');
  const requireReceiptSetting = getSecurityValue('require_receipt');
  const notifyWhatsappSetting = getSecurityValue('notify_whatsapp');
  const autoCancelSetting = getSecurityValue('auto_cancel_unpaid');

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Métodos de Pago
        </h3>
        <div className="grid gap-4">
          {methods.map(method => (
            <Card key={method.id} className={!method.is_enabled ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {methodIcons[method.method_key] || <CreditCard className="h-5 w-5" />}
                    <CardTitle className="text-base">{method.method_name}</CardTitle>
                    <Badge variant={method.is_enabled ? 'default' : 'secondary'}>
                      {method.is_enabled ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <Switch
                    checked={method.is_enabled}
                    onCheckedChange={() => handleToggleMethod(method)}
                  />
                </div>
              </CardHeader>
              {method.is_enabled && (
                <CardContent className="pt-0 space-y-3">
                  <Separator />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(configFields[method.method_key] || []).map(field => (
                      <div key={field.key} className="space-y-1.5">
                        <Label className="text-xs">{field.label}</Label>
                        <Input
                          value={getConfig(method, field.key)}
                          onChange={e => setConfig(method.id, field.key, e.target.value)}
                          placeholder={field.label}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => handleSaveConfig(method)}
                      disabled={saving === method.id || !editingConfigs[method.id]}
                      className="gap-2"
                    >
                      {saving === method.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                      Guardar
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Security Settings */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Seguridad de Pagos
        </h3>
        <div className="grid gap-4">
          {/* Receipt verification */}
          {requireReceiptSetting && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Verificación de comprobante</p>
                      <p className="text-sm text-muted-foreground">Solicitar foto del comprobante de pago</p>
                    </div>
                  </div>
                  <Switch
                    checked={requireReceiptSetting.enabled}
                    onCheckedChange={() => handleToggleSecurity('require_receipt')}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment time limit */}
          {timeLimitSetting && (
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Tiempo límite de pago</p>
                      <p className="text-sm text-muted-foreground">Horas para completar el pago antes de cancelar</p>
                    </div>
                  </div>
                  <Switch
                    checked={timeLimitSetting.enabled}
                    onCheckedChange={() => handleToggleSecurity('payment_time_limit_hours')}
                  />
                </div>
                {timeLimitSetting.enabled && (
                  <div className="flex items-center gap-2 ml-8">
                    <Input
                      type="number"
                      value={timeLimitSetting.value}
                      onChange={e => handleUpdateSecurityValue('payment_time_limit_hours', e.target.value)}
                      className="w-24 text-sm"
                      min={1}
                      max={168}
                    />
                    <span className="text-sm text-muted-foreground">horas</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Auto cancel unpaid */}
          {autoCancelSetting && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-medium">Cancelar pedidos no pagados</p>
                      <p className="text-sm text-muted-foreground">Cancelar automáticamente al expirar el límite</p>
                    </div>
                  </div>
                  <Switch
                    checked={autoCancelSetting.enabled}
                    onCheckedChange={() => handleToggleSecurity('auto_cancel_unpaid')}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* WhatsApp notifications */}
          {notifyWhatsappSetting && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Notificaciones de pago por WhatsApp</p>
                      <p className="text-sm text-muted-foreground">Recibir alertas al confirmar un pago</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifyWhatsappSetting.enabled}
                    onCheckedChange={() => handleToggleSecurity('notify_whatsapp')}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Min/Max amounts */}
          {minAmountSetting && (
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Monto mínimo de pedido</p>
                      <p className="text-sm text-muted-foreground">Rechazar pedidos menores a este monto</p>
                    </div>
                  </div>
                  <Switch
                    checked={minAmountSetting.enabled}
                    onCheckedChange={() => handleToggleSecurity('min_order_amount')}
                  />
                </div>
                {minAmountSetting.enabled && (
                  <div className="flex items-center gap-2 ml-8">
                    <span className="text-sm">$</span>
                    <Input
                      type="number"
                      value={minAmountSetting.value}
                      onChange={e => handleUpdateSecurityValue('min_order_amount', e.target.value)}
                      className="w-28 text-sm"
                      min={0}
                    />
                    <span className="text-sm text-muted-foreground">MXN</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {maxAmountSetting && (
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Monto máximo de pedido</p>
                      <p className="text-sm text-muted-foreground">Rechazar pedidos mayores a este monto</p>
                    </div>
                  </div>
                  <Switch
                    checked={maxAmountSetting.enabled}
                    onCheckedChange={() => handleToggleSecurity('max_order_amount')}
                  />
                </div>
                {maxAmountSetting.enabled && (
                  <div className="flex items-center gap-2 ml-8">
                    <span className="text-sm">$</span>
                    <Input
                      type="number"
                      value={maxAmountSetting.value}
                      onChange={e => handleUpdateSecurityValue('max_order_amount', e.target.value)}
                      className="w-28 text-sm"
                      min={0}
                    />
                    <span className="text-sm text-muted-foreground">MXN</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsPanel;
