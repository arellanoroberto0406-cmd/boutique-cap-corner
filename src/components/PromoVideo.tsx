import { useRef, useEffect, useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Play, Volume2, VolumeX, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

const PromoVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const { settings } = useSiteSettings();

  const mediaSrc = settings.promo_video || "";
  
  // Detect if it's a video or image
  const isVideo = mediaSrc && (
    mediaSrc.endsWith('.mp4') || 
    mediaSrc.endsWith('.mov') || 
    mediaSrc.endsWith('.webm') ||
    mediaSrc.includes('video')
  );

  // Intersection Observer for auto-play when visible (only for videos)
  useEffect(() => {
    if (!isVideo) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play().catch(() => {});
          setIsPlaying(true);
        } else if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isVideo]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Don't render if no media is configured
  if (!mediaSrc) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container px-4">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 border border-primary/20">
            {isVideo ? 'VIDEO PROMOCIONAL' : 'IMAGEN PROMOCIONAL'}
          </span>
          <h2 className="font-display text-4xl md:text-6xl tracking-wide mb-4">
            DESCUBRE NUESTRO <span className="gradient-text">ESTILO</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Mira cómo nuestras gorras premium transforman tu look y elevan tu estilo al siguiente nivel
          </p>
        </div>

        {/* Media Container */}
        <div 
          ref={containerRef}
          className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/50 group"
        >
          {/* Decorative gradients */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/30 rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gold/30 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          {isVideo ? (
            /* Video */
            <div className="relative aspect-video bg-muted">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                src={mediaSrc}
                muted={isMuted}
                loop
                playsInline
                preload="metadata"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={togglePlay}
                  className="gap-2 bg-background/80 backdrop-blur-md border-border/50 hover:bg-background"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-5 w-5" />
                      <span className="hidden sm:inline">Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      <span className="hidden sm:inline">Reproducir</span>
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                  className="bg-background/80 backdrop-blur-md border-border/50 hover:bg-background"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </div>

              {/* Play button overlay when paused */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center group/play"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-primary/30 transition-transform group-hover/play:scale-110">
                    <Play className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground ml-1" />
                  </div>
                </button>
              )}
            </div>
          ) : (
            /* Image */
            <div className="relative aspect-video bg-muted">
              <img
                src={mediaSrc}
                alt="Imagen promocional"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}
        </div>

        {/* Bottom decoration */}
        <div className="flex justify-center mt-8 gap-2">
          <div className="w-12 h-1 rounded-full bg-primary" />
          <div className="w-4 h-1 rounded-full bg-primary/50" />
          <div className="w-2 h-1 rounded-full bg-primary/30" />
        </div>
      </div>
    </section>
  );
};

export default PromoVideo;
