import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentMethod {
  id: string;
  method_key: string;
  method_name: string;
  is_enabled: boolean;
  config: Record<string, any>;
  display_order: number;
}

export interface PaymentSecuritySetting {
  id: string;
  setting_key: string;
  setting_value: string;
  is_enabled: boolean;
}

export const usePaymentSettings = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [security, setSecurity] = useState<PaymentSecuritySetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const [methodsRes, securityRes] = await Promise.all([
      supabase.from('payment_settings').select('*').order('display_order'),
      supabase.from('payment_security_settings').select('*'),
    ]);
    if (methodsRes.data) setMethods(methodsRes.data as unknown as PaymentMethod[]);
    if (securityRes.data) setSecurity(securityRes.data as unknown as PaymentSecuritySetting[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const updateMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    const { error } = await supabase
      .from('payment_settings')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const updateSecurity = async (id: string, updates: Partial<PaymentSecuritySetting>) => {
    const { error } = await supabase
      .from('payment_security_settings')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const getSecurityValue = (key: string) => {
    const s = security.find(s => s.setting_key === key);
    return s ? { value: s.setting_value, enabled: s.is_enabled, id: s.id } : null;
  };

  const getEnabledMethods = () => methods.filter(m => m.is_enabled);

  return { methods, security, loading, updateMethod, updateSecurity, getSecurityValue, getEnabledMethods, refetch: fetchAll };
};
