import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular suscripción
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
    <section className="py-16 md:py-24 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent/80" />
      <div className="container px-4 md:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-foreground/10 backdrop-blur-sm mb-4 animate-scale-in">
            <Mail className="h-8 w-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            Suscríbete a Nuestro Newsletter
          </h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Recibe ofertas exclusivas, lanzamientos de nuevas colecciones y contenido especial directamente en tu correo.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto animate-fade-in-up animation-delay-200">
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-12 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:border-primary-foreground transition-all duration-300"
            />
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all duration-300 hover:scale-105 h-12 px-8"
            >
              {isLoading ? "Suscribiendo..." : "Suscribirse"}
            </Button>
          </form>
          <p className="text-sm text-primary-foreground/70">
            No compartiremos tu información. Cancela cuando quieras.
          </p>
        </div>
      </div>
    </section>
  );
};
