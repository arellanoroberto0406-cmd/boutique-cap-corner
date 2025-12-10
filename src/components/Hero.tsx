import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
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
    setShouldLoadVideo(true);
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
        {/* Video Background */}
        <div className="absolute inset-0 bg-muted">
          {shouldLoadVideo && (
            <video
              ref={videoRef}
              key={videoSrc}
              className="absolute inset-0 w-full h-full object-cover scale-105"
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
            />
          )}
          {/* Overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float opacity-60" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float animation-delay-500 opacity-40" />
        
        {/* Content */}
        <div className="relative container h-full flex items-center px-4 md:px-8">
          <div className="max-w-2xl space-y-8">
            {/* Badge */}
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium backdrop-blur-sm">
                <Sparkles className="h-4 w-4 animate-bounce-soft" />
                Colección Premium 2024
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-slide-in-left opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              Estilo Urbano,{" "}
              <span className="gradient-text">Calidad Premium</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg animate-fade-in-up opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
              Descubre nuestra colección exclusiva de gorras diseñadas para quienes buscan destacar con autenticidad y estilo.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
              <Button 
                size="lg" 
                className="group relative overflow-hidden hover-shine text-lg px-8 py-6"
                onClick={() => setShowBrandsModal(true)}
              >
                <span className="relative z-10 flex items-center">
                  Ver Colección
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
                </span>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-2 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explorar Productos
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4 animate-fade-in-up opacity-0" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Productos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">10+</p>
                <p className="text-sm text-muted-foreground">Marcas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">5K+</p>
                <p className="text-sm text-muted-foreground">Clientes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-soft">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/50 flex justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-muted-foreground/50 animate-bounce" />
          </div>
        </div>
      </section>

      <BrandsModal isOpen={showBrandsModal} onClose={() => setShowBrandsModal(false)} />
    </>
  );
};

export default Hero;