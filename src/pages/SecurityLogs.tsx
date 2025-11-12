import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface SecurityLog {
  id: string;
  email: string;
  action: string;
  success: boolean;
  details: string | null;
  created_at: string;
}

const SecurityLogs = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error('No tienes permisos de administrador');
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
  }, [isAdmin]);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast.error('Error al cargar logs de seguridad');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'login_attempt': 'Intento de Login',
      'login_success': 'Login Exitoso',
      'login_failed': 'Login Fallido',
      '2fa_code_sent': 'Código 2FA Enviado',
      '2fa_request_unauthorized': 'Solicitud 2FA No Autorizada',
      '2fa_request_blocked': 'Solicitud 2FA Bloqueada',
      '2fa_request_rate_limit': 'Límite de Rate 2FA',
      'code_verify_failed': 'Verificación de Código Fallida',
      'code_verify_expired': 'Código Expirado',
      'code_verify_blocked': 'Verificación Bloqueada',
      'login_error': 'Error de Login',
    };
    return labels[action] || action;
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">Cargando logs de seguridad...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Logs de Seguridad
            </h1>
          </div>
          <Button onClick={fetchLogs} variant="outline">
            Actualizar
          </Button>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No hay logs de seguridad</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="mt-1">
                      {log.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={log.success ? 'default' : 'destructive'}>
                          {getActionLabel(log.action)}
                        </Badge>
                        <span className="text-sm font-medium">{log.email}</span>
                      </div>
                      {log.details && (
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('es-MX', {
                          dateStyle: 'medium',
                          timeStyle: 'medium',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SecurityLogs;
