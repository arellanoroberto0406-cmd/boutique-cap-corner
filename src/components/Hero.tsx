import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroVideo from "@/assets/hero-background.mov";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    __heroVideoUnlocked?: boolean;
  }
}

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    // Cargar video inmediatamente para mejor experiencia
    setShouldLoadVideo(true);

    // Desbloquear audio en móvil con primer toque
    if (window.__heroVideoUnlocked) return;

    const unlockAudio = () => {
      const vid = videoRef.current;
      if (vid) {
        vid.muted = false;
        try { vid.volume = 0.3; } catch {}
        vid.play().catch(() => {});
        window.__heroVideoUnlocked = true;
      }
    };

    const events = ['touchstart', 'click', 'pointerdown', 'keydown'];
    events.forEach(ev => document.addEventListener(ev, unlockAudio, { once: true, passive: true }));

    return () => {
      events.forEach(ev => document.removeEventListener(ev, unlockAudio));
    };
  }, []);

  return (
    <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
      <div className="absolute inset-0 bg-muted">
        {shouldLoadVideo && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={heroVideo}
            autoPlay
            muted={true}
            loop
            playsInline
            preload="none"
            onLoadedMetadata={() => {
              if (videoRef.current) {
                try { videoRef.current.volume = 0.3; } catch {}
              }
            }}
          />
        )}
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
