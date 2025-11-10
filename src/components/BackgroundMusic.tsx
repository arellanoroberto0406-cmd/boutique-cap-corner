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
    // Eliminar duplicados visibles (si los hubiera)
    if (existing.length > 1) {
      existing.slice(1).forEach((a) => { try { a.pause(); } catch {} a.remove(); });
    }

    if (!window.__bgMusicEl || !document.body.contains(window.__bgMusicEl)) {
      // Crear o reanclar la instancia única
      const audio = window.__bgMusicEl ?? new Audio(backgroundMusic);
      audio.setAttribute('data-background-music', 'true');
      audio.loop = true;
      try { audio.volume = 0.25; } catch {}
      if (!window.__bgMusicEl) {
        window.__bgMusicEl = audio;
      }
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Silenciar error si el navegador requiere interacción del usuario
        });
      }
    } else {
      // Alinear configuración de la instancia existente
      window.__bgMusicEl.loop = true;
      try { window.__bgMusicEl.volume = 0.25; } catch {}
    }

    // No desmontamos para evitar duplicados por StrictMode/HMR
    return () => {};
  }, []);


  return null;
};

export default BackgroundMusic;
