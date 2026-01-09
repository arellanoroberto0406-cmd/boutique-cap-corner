import { useState, useEffect, useRef } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import localLogo from "@/assets/logo-proveedor.png";

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'zoom' | 'exit'>('initial');
  const [logoLoaded, setLogoLoaded] = useState(false);
  const { settings, isLoading } = useSiteSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload the logo immediately
  useEffect(() => {
    const logoUrl = settings.company_logo || localLogo;
    const img = new Image();
    img.onload = () => setLogoLoaded(true);
    img.onerror = () => setLogoLoaded(true); // Still show even on error
    img.src = logoUrl;
    
    // If local logo, mark as loaded immediately
    if (!settings.company_logo) {
      setLogoLoaded(true);
    }
  }, [settings.company_logo]);

  useEffect(() => {
    // Check if running as installed app (standalone mode)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    
    if (!isStandalone) {
      setIsVisible(false);
      return;
    }

    // Check if splash was already shown this session
    const splashShown = sessionStorage.getItem("splash-shown");
    if (splashShown) {
      setIsVisible(false);
      return;
    }

    // Play startup sound
    const startupSound = settings.startup_sound;
    if (startupSound) {
      audioRef.current = new Audio(startupSound);
      audioRef.current.volume = 0.6;
      audioRef.current.play().catch(() => {
        const playOnInteraction = () => {
          audioRef.current?.play().catch(() => {});
          document.removeEventListener('touchstart', playOnInteraction);
          document.removeEventListener('click', playOnInteraction);
        };
        document.addEventListener('touchstart', playOnInteraction, { once: true });
        document.addEventListener('click', playOnInteraction, { once: true });
      });
    }

    // Start zoom animation immediately (faster start)
    const zoomTimer = setTimeout(() => {
      setAnimationPhase('zoom');
    }, 50);

    // Start exit animation faster
    const exitTimer = setTimeout(() => {
      setAnimationPhase('exit');
    }, 1800);

    // Hide splash faster
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("splash-shown", "true");
    }, 2100);

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [settings.startup_sound]);

  if (!isVisible) return null;

  // Use local logo as immediate fallback, then remote if available
  const logoUrl = settings.company_logo || localLogo;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-background flex items-center justify-center overflow-hidden transition-opacity duration-300 ${
        animationPhase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ perspective: '1000px' }}
    >
      {/* Animated background with radial gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-background to-background" />
      
      {/* Shiny line animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute top-0 left-0 w-full h-full ${animationPhase !== 'initial' ? 'animate-shine-sweep' : ''}`}
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 55%, transparent 60%)',
            transform: 'translateX(-100%)',
          }}
        />
      </div>

      {/* Logo container with zoom effect */}
      <div 
        className={`relative flex flex-col items-center gap-6 ${
          animationPhase === 'initial' ? 'opacity-0 scale-30' : 
          animationPhase === 'zoom' ? 'animate-zoom-forward' : 
          'animate-zoom-out-fade'
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Logo with glow effect */}
        <div className="relative w-40 h-40 md:w-56 md:h-56">
          {/* Glow behind logo */}
          <div 
            className={`absolute inset-0 rounded-3xl blur-2xl transition-all duration-500 ${
              animationPhase === 'zoom' ? 'bg-primary/40 scale-110' : 'bg-primary/20 scale-100'
            }`} 
          />
          
          {/* Logo background */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/30" />
          
          {/* Logo image */}
          <img
            src={logoUrl}
            alt="Logo"
            className="relative w-full h-full object-contain rounded-3xl p-4 drop-shadow-2xl"
          />
          
          {/* Shine effect on logo */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <div 
              className="absolute inset-0 animate-logo-shine"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 55%, transparent 60%)',
              }}
            />
          </div>
        </div>

        {/* App name with fade in */}
        <div className={`text-center transition-all duration-500 delay-300 ${
          animationPhase === 'zoom' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground drop-shadow-lg">
            {settings.company_name || "Boutique AR"}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2 font-body">
            Gorras Premium
          </p>
        </div>

        {/* Loading indicator */}
        <div className={`flex gap-2 mt-4 transition-all duration-300 delay-500 ${
          animationPhase === 'zoom' ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-[bounce_1s_ease-in-out_infinite] shadow-lg shadow-primary/50" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-[bounce_1s_ease-in-out_infinite] shadow-lg shadow-primary/50" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-[bounce_1s_ease-in-out_infinite] shadow-lg shadow-primary/50" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;