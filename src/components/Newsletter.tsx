import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Sparkles } from "lucide-react";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      toast({
        title: "¡Suscripción exitosa!",
        description: "Gracias por suscribirte. Recibirás nuestras novedades.",
      });
      setEmail("");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent/90" />
      <div className="absolute inset-0 pattern-dots opacity-10" />
      
      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold/20 rounded-full blur-[120px]" />
      
      <div className="container px-6 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4 animate-scale-in shadow-2xl">
            <Mail className="h-10 w-10 text-white" />
          </div>
          
          {/* Title */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-white/80 text-sm font-medium tracking-widest uppercase">
              <Sparkles className="h-4 w-4" />
              Newsletter Exclusivo
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display tracking-wide text-white">
              ÚNETE A LA COMUNIDAD
            </h2>
          </div>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            Recibe ofertas exclusivas, lanzamientos de nuevas colecciones y contenido especial directamente en tu correo.
          </p>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto animate-fade-in-up animation-delay-200">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/50 focus:bg-white/15 transition-all duration-300 rounded-xl text-lg"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="bg-white text-primary hover:bg-white/95 transition-all duration-300 hover:scale-105 h-14 px-10 rounded-xl font-heading tracking-wide text-lg shadow-2xl"
            >
              {isLoading ? (
                "Suscribiendo..."
              ) : (
                <>
                  Suscribirse
                  <Send className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
          
          {/* Trust text */}
          <p className="text-sm text-white/60 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            No compartiremos tu información. Cancela cuando quieras.
          </p>
        </div>
      </div>
    </section>
  );
};
