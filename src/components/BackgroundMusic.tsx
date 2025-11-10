import { useEffect } from "react";
import backgroundMusic from "@/assets/background-music.mov";

declare global {
  interface Window {
    __bgMusicEl?: HTMLAudioElement;
  }
}

const BackgroundMusic = () => {
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
      
      // Intentar autoplay
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Autoplay bloqueado: reproducir en el primer toque
          const onFirst = () => {
            audio.play().catch(() => {});
          };
          document.addEventListener('pointerdown', onFirst, { once: true, passive: true });
          document.addEventListener('touchstart', onFirst, { once: true, passive: true });
          document.addEventListener('click', onFirst, { once: true, passive: true });
        });
      }
    } else {
      window.__bgMusicEl.loop = true;
      try { window.__bgMusicEl.volume = 0.25; } catch {}
    }

    return () => {};
  }, []);

  return null;
};

export default BackgroundMusic;
