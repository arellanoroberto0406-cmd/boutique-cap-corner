import { useState, useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const { settings } = useSiteSettings();

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

    // Start animation after a brief delay
    const animTimer = setTimeout(() => {
      setIsAnimating(true);
    }, 100);

    // Hide splash after 2.5 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("splash-shown", "true");
    }, 2500);

    return () => {
      clearTimeout(animTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  const logoUrl = settings.company_logo || "/pwa-512x512.png";

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
      
      {/* Shiny line animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute top-0 left-0 w-full h-full ${isAnimating ? 'animate-shine-sweep' : ''}`}
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 55%, transparent 60%)',
            transform: 'translateX(-100%)',
          }}
        />
      </div>

      {/* Logo container with shine effect */}
      <div className={`relative flex flex-col items-center gap-6 ${isAnimating ? 'animate-scale-in' : 'opacity-0'}`}>
        {/* Logo with shine overlay */}
        <div className="relative w-32 h-32 md:w-40 md:h-40">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm" />
          <img
            src={logoUrl}
            alt="Logo"
            className="relative w-full h-full object-contain rounded-3xl p-2"
          />
          {/* Continuous shine effect on logo */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <div 
              className="absolute inset-0 animate-logo-shine"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.2) 55%, transparent 60%)',
              }}
            />
          </div>
        </div>

        {/* App name */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            {settings.company_name || "Boutique AR"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gorras Premium
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-1.5 mt-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
