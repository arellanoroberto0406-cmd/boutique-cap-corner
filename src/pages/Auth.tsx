import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Mail, Lock, ShieldCheck } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'credentials' | 'code'>('credentials');
  const [loading, setLoading] = useState(false);
  const [tempUserId, setTempUserId] = useState<string>('');
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

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Log attempt
      await supabase.from('security_logs').insert({
        email,
        action: 'login_attempt',
        success: false,
        details: 'Credentials verification started',
      });

      // Verify credentials first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Log failed login
        await supabase.from('security_logs').insert({
          email,
          action: 'login_failed',
          success: false,
          details: error.message,
        });

        // Si las credenciales son incorrectas, redirigir a la tienda
        toast.error('Acceso solo para administradores');
        setTimeout(() => {
          navigate('/');
        }, 1500);
        return;
      }
      
      // Sign out immediately to prevent auto-login
      await supabase.auth.signOut();
      
      // Store user ID temporarily
      setTempUserId(data.user.id);
      
      // Send 2FA code
      const { error: codeError } = await supabase.functions.invoke('send-2fa-code', {
        body: { email, userId: data.user.id }
      });

      if (codeError) {
        // Handle rate limiting
        if (codeError.message?.includes('Too many')) {
          toast.error('Demasiados intentos. Intenta más tarde.');
          return;
        }
        throw codeError;
      }

      toast.success('Código enviado a tu email');
      setStep('code');
    } catch (error: any) {
      await supabase.from('security_logs').insert({
        email,
        action: 'login_error',
        success: false,
        details: error.message,
      });

      toast.error('Acceso solo para administradores');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify the code in database
      const { data: authCode, error: fetchError } = await supabase
        .from('auth_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('verified', false)
        .maybeSingle();

      if (fetchError || !authCode) {
        // Log failed attempt
        await supabase.from('security_logs').insert({
          email,
          action: 'code_verify_failed',
          success: false,
          details: 'Invalid code provided',
        });

        throw new Error('Código inválido o expirado');
      }

      // Check if code has expired
      if (new Date(authCode.expires_at) < new Date()) {
        await supabase.from('security_logs').insert({
          email,
          action: 'code_verify_expired',
          success: false,
          details: 'Code has expired',
        });

        throw new Error('El código ha expirado');
      }

      // Check failed attempts
      if (authCode.failed_attempts >= 3) {
        await supabase.from('security_logs').insert({
          email,
          action: 'code_verify_blocked',
          success: false,
          details: 'Too many failed attempts',
        });

        throw new Error('Demasiados intentos fallidos. Solicita un nuevo código.');
      }

      // Mark code as verified
      await supabase
        .from('auth_codes')
        .update({ verified: true })
        .eq('id', authCode.id);

      // Now actually sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        await supabase.from('security_logs').insert({
          email,
          action: 'login_failed_after_2fa',
          success: false,
          details: signInError.message,
        });

        throw signInError;
      }

      // Log successful login
      await supabase.from('security_logs').insert({
        email,
        action: 'login_success',
        success: true,
        details: '2FA authentication completed',
      });

      toast.success('¡Autenticación exitosa!');
    } catch (error: any) {
      // Increment failed attempts
      const { data: existingCode } = await supabase
        .from('auth_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .maybeSingle();

      if (existingCode) {
        await supabase
          .from('auth_codes')
          .update({ failed_attempts: existingCode.failed_attempts + 1 })
          .eq('id', existingCode.id);
      }

      toast.error(error.message || 'Error al verificar código');
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
            Ingresa tus credenciales
          </p>
        </div>

        {step === 'credentials' ? (
          <form onSubmit={handleCredentials} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
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
              {loading ? 'Verificando...' : 'Continuar'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              
              <div className="text-center space-y-1">
                <h2 className="text-xl font-semibold">Verificación de Seguridad</h2>
                <p className="text-sm text-muted-foreground">
                  Ingresa el código de 6 dígitos enviado a
                </p>
                <p className="text-sm font-medium text-foreground">{email}</p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <Label htmlFor="code" className="sr-only">Código de Verificación</Label>
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => setCode(value)}
                id="code"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              
              <p className="text-xs text-muted-foreground text-center">
                El código expira en 10 minutos • Máximo 3 intentos
              </p>
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={loading || code.length !== 6}
              >
                {loading ? 'Verificando...' : 'Verificar Código'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('credentials');
                  setCode('');
                }}
              >
                ← Volver
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default Auth;
