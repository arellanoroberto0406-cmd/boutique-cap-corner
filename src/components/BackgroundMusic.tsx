import { useEffect } from "react";
import backgroundMusic from "@/assets/background-music.mov";

declare global {
  interface Window {
    __bgMusicEl?: HTMLAudioElement;
  }
}

const BackgroundMusic = () => {
  useEffect(() => {
    // Eliminar duplicados
    const existing = window.__bgMusicEl;
    if (existing && document.body.contains(existing)) {
      // Ya existe el audio, solo aseguramos su configuración
      existing.loop = true;
      existing.volume = 0.25;
      existing.preload = "auto";
      try { existing.play().catch(() => {}); } catch {}

      // Eliminar duplicados de fondo si los hay (dejamos solo el primero)
      const dupes = Array.from(document.querySelectorAll('[data-background-music]')) as HTMLMediaElement[];
      if (dupes.length > 1) {
        dupes.slice(1).forEach(d => { try { d.pause(); } catch {} d.remove(); });
      }

      // Asegurar que ningún otro medio suene
      document.querySelectorAll('video,audio').forEach((el) => {
        if (el instanceof HTMLMediaElement && el !== existing && !el.hasAttribute('data-background-music')) {
          el.muted = true;
          try { el.volume = 0; } catch {}
          if (el.tagName.toLowerCase() === 'audio') { try { el.pause(); } catch {} }
        }
      });

      return;
    }

    // Crear una sola instancia global del audio
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

    // Silenciar y/o pausar cualquier otro medio para evitar doble audio
    const ensureOnlyBackgroundPlays = () => {
      document.querySelectorAll('video,audio').forEach((el) => {
        if (el instanceof HTMLMediaElement && el !== audio && !el.hasAttribute('data-background-music')) {
          el.muted = true;
          try { el.volume = 0; } catch {}
          if (el.tagName.toLowerCase() === 'audio') {
            try { el.pause(); } catch {}
          }
        }
      });
    };
    ensureOnlyBackgroundPlays();

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
      // No removemos el audio del body para evitar duplicados
    };
  }, []);

  return null;
};

export default BackgroundMusic;
