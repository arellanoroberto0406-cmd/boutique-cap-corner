import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Phone, Lock } from 'lucide-react';

// Número de celular autorizado para acceso de administrador
const ADMIN_PHONE = '6692646083';

const Auth = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/admin');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/admin');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validar que el número sea exactamente el autorizado
    const cleanPhone = phone.replace(/\D/g, ''); // Remover caracteres no numéricos
    
    if (cleanPhone !== ADMIN_PHONE) {
      toast.error('Acceso denegado. Solo administradores autorizados.');
      setTimeout(() => {
        navigate('/');
      }, 1500);
      setLoading(false);
      return;
    }

    try {
      // Usar el número como parte del email para Supabase Auth
      const adminEmail = `admin@proveedorboutique.com`;
      
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password,
      });

      if (error) {
        toast.error('Contraseña incorrecta');
        return;
      }

      toast.success('¡Bienvenido, Administrador!');
    } catch (error: any) {
      toast.error('Error al iniciar sesión');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground">
            Ingresa tus credenciales de administrador
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Número de Celular
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="6691234567"
              maxLength={10}
              className="text-lg tracking-wide"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Acceder'}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Acceso exclusivo para administradores autorizados
        </p>
      </Card>
    </div>
  );
};

export default Auth;
