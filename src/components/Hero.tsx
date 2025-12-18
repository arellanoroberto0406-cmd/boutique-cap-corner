import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Crown, Star } from "lucide-react";
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
        <div className="absolute inset-0 bg-background">
          {shouldLoadVideo && (
            <video
              ref={videoRef}
              key={videoSrc}
              className="absolute inset-0 w-full h-full object-cover scale-110"
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
          {/* Multi-layer overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-gold/5" />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-float opacity-50" />
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-gold/15 rounded-full blur-[80px] animate-float-delayed opacity-40" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[60px] animate-float opacity-30" />
        
        {/* Geometric patterns */}
        <div className="absolute inset-0 pattern-dots opacity-[0.03]" />
        
        {/* Content */}
        <div className="relative container h-full flex items-center px-6 md:px-12">
          <div className="max-w-4xl space-y-10">
            {/* Premium Badge */}
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <span className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 via-gold/15 to-primary/20 border border-primary/30 backdrop-blur-xl shadow-2xl shadow-primary/10">
                <Crown className="h-5 w-5 text-gold animate-bounce-soft" />
                <span className="font-heading text-sm tracking-[0.2em] text-foreground/90">COLECCIÓN PREMIUM 2024</span>
                <Sparkles className="h-4 w-4 text-primary" />
              </span>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="font-display text-7xl md:text-9xl lg:text-[10rem] tracking-wide animate-slide-in-left opacity-0 leading-[0.9]" 
                  style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                ESTILO
              </h1>
              <h2 className="font-display text-5xl md:text-7xl lg:text-[7rem] tracking-wide gradient-text animate-slide-in-left opacity-0 leading-[0.9]" 
                  style={{ animationDelay: '0.55s', animationFillMode: 'forwards' }}>
                URBANO
              </h2>
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl animate-fade-in-up opacity-0 font-light leading-relaxed tracking-wide" 
               style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
              Descubre nuestra colección exclusiva de gorras diseñadas para quienes buscan destacar con <span className="text-primary font-medium">autenticidad</span> y <span className="text-gold font-medium">estilo premium</span>.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 animate-fade-in-up opacity-0" style={{ animationDelay: '0.85s', animationFillMode: 'forwards' }}>
              <Button 
                size="lg" 
                className="group relative overflow-hidden hover-shine text-lg px-12 py-8 font-heading tracking-[0.15em] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-2xl shadow-primary/30 border-0"
                onClick={() => setShowBrandsModal(true)}
              >
                <span className="relative z-10 flex items-center">
                  VER COLECCIÓN
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
                </span>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-12 py-8 font-heading tracking-[0.15em] border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 backdrop-blur-sm"
                onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                EXPLORAR
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-12 pt-8 animate-fade-in-up opacity-0" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
              {[
                { value: '500+', label: 'Productos' },
                { value: '10+', label: 'Marcas' },
                { value: '5K+', label: 'Clientes' },
              ].map((stat, index) => (
                <div key={stat.label} className="text-center group cursor-default">
                  <p className="font-display text-5xl md:text-6xl text-foreground group-hover:text-primary transition-colors duration-300">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.2em] mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Side decoration */}
          <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col gap-4 items-center">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="w-2 h-2 rounded-full bg-primary/40 animate-bounce-soft"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-soft">
          <div className="w-7 h-12 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-3">
            <div className="w-1.5 h-3 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      </section>

      <BrandsModal isOpen={showBrandsModal} onClose={() => setShowBrandsModal(false)} />
    </>
  );
};

export default Hero;
