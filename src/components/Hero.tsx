import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
      <div className="absolute inset-0">
        <iframe
          className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
          src="https://www.youtube.com/embed/fe5xdrw6TtI?autoplay=1&mute=1&loop=1&playlist=fe5xdrw6TtI&controls=0&showinfo=0&rel=0&modestbranding=1"
          title="Hero Video"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
      </div>
      
      <div className="relative container h-full flex items-center px-4 md:px-8">
        <div className="max-w-xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Estilo Urbano,{" "}
            <span className="text-primary">Calidad Premium</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Descubre nuestra colección exclusiva de gorras diseñadas para quienes buscan destacar con autenticidad y estilo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="group">
              Ver Colección
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="secondary">
              Explorar Productos
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
