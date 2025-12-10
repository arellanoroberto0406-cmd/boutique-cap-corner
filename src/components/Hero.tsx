import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroVideoDefault from "@/assets/hero-background.mov";
import { useEffect, useRef, useState } from "react";
import BrandsModal from "./BrandsModal";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [showBrandsModal, setShowBrandsModal] = useState(false);
  const { settings } = useSiteSettings();

  // Use custom video from settings or fallback to default
  const videoSrc = settings.hero_video || heroVideoDefault;

  useEffect(() => {
    // Cargar video inmediatamente para mejor experiencia
    setShouldLoadVideo(true);
    
    // Asegurar que el video esté completamente silenciado
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
    }
  }, []);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('header');
      if (header) setHeaderHeight(header.getBoundingClientRect().height);
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  // Reload video when source changes
  useEffect(() => {
    if (videoRef.current && shouldLoadVideo) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [videoSrc, shouldLoadVideo]);

  return (
    <>
      <section
        className="relative w-full overflow-hidden"
        style={{ height: headerHeight ? `calc(100vh - ${headerHeight}px)` : '100vh' }}
      >
        <div className="absolute inset-0 bg-muted">
          {shouldLoadVideo && (
            <video
              ref={videoRef}
              key={videoSrc}
              className="absolute inset-0 w-full h-full object-cover"
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.muted = true;
                  videoRef.current.volume = 0;
                }
              }}
              onPlay={() => {
                if (videoRef.current) {
                  videoRef.current.muted = true;
                  videoRef.current.volume = 0;
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
              <Button 
                size="lg" 
                className="group"
                onClick={() => setShowBrandsModal(true)}
              >
                Ver Colección
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explorar Productos
              </Button>
            </div>
          </div>
        </div>
      </section>

      <BrandsModal isOpen={showBrandsModal} onClose={() => setShowBrandsModal(false)} />
    </>
  );
};

export default Hero;