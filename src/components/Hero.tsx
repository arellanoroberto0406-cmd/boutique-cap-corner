import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroVideo from "@/assets/hero-video.mov";

const Hero = () => {
  return (
    <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
      <div className="absolute inset-0">
        <video
          className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
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
