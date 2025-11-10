import { useEffect } from "react";
import backgroundMusic from "@/assets/background-music.mov";

declare global {
  interface Window {
    __bgMusicEl?: HTMLAudioElement;
  }
}

const BackgroundMusic = () => {
  useEffect(() => {
    // PRIMERO: Eliminar TODAS las instancias de audio de fondo que puedan existir
    const allBgMusic = Array.from(document.querySelectorAll('[data-background-music]')) as HTMLMediaElement[];
    allBgMusic.forEach(el => {
      try { 
        el.pause(); 
        el.currentTime = 0;
      } catch {}
      el.remove();
    });
    
    // Limpiar la referencia global
    if (window.__bgMusicEl) {
      try {
        window.__bgMusicEl.pause();
        window.__bgMusicEl.currentTime = 0;
      } catch {}
      window.__bgMusicEl = undefined;
    }

    // Silenciar todos los otros elementos de audio/video que no sean background music
    document.querySelectorAll('video,audio').forEach((el) => {
      if (el instanceof HTMLMediaElement && !el.hasAttribute('data-background-music')) {
        el.muted = true;
        try { el.volume = 0; } catch {}
        if (el.tagName.toLowerCase() === 'audio') { 
          try { el.pause(); } catch {} 
        }
      }
    });

    // AHORA: Crear UNA SOLA instancia nueva del audio
    const audio = document.createElement("audio");
    audio.src = backgroundMusic;
    audio.loop = true;
    audio.volume = 0.25;
    audio.preload = "auto";
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("data-background-music", "true");

    // Añadir al documento
    document.body.appendChild(audio);
    window.__bgMusicEl = audio;

    // Intentar reproducir automáticamente
    const tryPlay = () => audio.play().catch(() => {});
    tryPlay();

    // Vigilar cualquier nuevo audio que se agregue al documento
    const onAnyPlay = (e: Event) => {
      const el = e.target as Element | null;
      if (el instanceof HTMLMediaElement && el !== audio && !el.hasAttribute('data-background-music')) {
        el.muted = true;
        try { (el as HTMLMediaElement).volume = 0; } catch {}
        if (el.tagName.toLowerCase() === 'audio') {
          try { (el as HTMLMediaElement).pause(); } catch {}
        }
      }
    };
    document.addEventListener('play', onAnyPlay, true);

    // En móviles, activar con primer gesto del usuario
    const unlock = () => {
      tryPlay();
      removeUnlockers();
    };
    const removeUnlockers = () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
    };

    document.addEventListener("pointerdown", unlock, { once: true, passive: true });
    document.addEventListener("touchstart", unlock, { once: true, passive: true });
    document.addEventListener("click", unlock, { once: true, passive: true });
    document.addEventListener("keydown", unlock, { once: true });

    // Limpiar al desmontar
    return () => {
      removeUnlockers();
      document.removeEventListener('play', onAnyPlay, true);
      // Pausar y limpiar el audio al desmontar
      if (audio) {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {}
        audio.remove();
      }
      if (window.__bgMusicEl === audio) {
        window.__bgMusicEl = undefined;
      }
    };
  }, []);

  return null;
};

export default BackgroundMusic;
