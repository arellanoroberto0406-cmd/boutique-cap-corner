import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import backgroundMusic from "@/assets/background-music.mov";

declare global {
  interface Window {
    __bgMusicEl?: HTMLAudioElement;
  }
}

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Asegurar una sola instancia global
    const existing = Array.from(document.querySelectorAll('audio[data-background-music]')) as HTMLAudioElement[];
    if (existing.length > 1) {
      existing.slice(1).forEach((a) => { try { a.pause(); } catch {} a.remove(); });
    }

    if (!window.__bgMusicEl || !document.body.contains(window.__bgMusicEl)) {
      const audio = window.__bgMusicEl ?? new Audio(backgroundMusic);
      audio.setAttribute('data-background-music', 'true');
      audio.preload = 'auto';
      audio.loop = true;
      try { audio.volume = 0.25; } catch {}
      
      if (!window.__bgMusicEl) {
        window.__bgMusicEl = audio;
      }
      
      // Intentar autoplay (funciona en desktop)
      const playPromise = audio.play();
      if (playPromise) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Autoplay bloqueado (móvil) - mostrar botón
            setShowButton(true);
          });
      }
    } else {
      window.__bgMusicEl.loop = true;
      try { window.__bgMusicEl.volume = 0.25; } catch {}
      if (!window.__bgMusicEl.paused) {
        setIsPlaying(true);
      } else {
        setShowButton(true);
      }
    }

    return () => {};
  }, []);

  const toggleMusic = () => {
    if (!window.__bgMusicEl) return;
    
    if (window.__bgMusicEl.paused) {
      window.__bgMusicEl.play().then(() => {
        setIsPlaying(true);
        setShowButton(true);
      });
    } else {
      window.__bgMusicEl.pause();
      setIsPlaying(false);
    }
  };

  if (!showButton) return null;

  return (
    <button
      onClick={toggleMusic}
      className="fixed bottom-24 right-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
      aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
    >
      {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </button>
  );
};

export default BackgroundMusic;
