import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import defaultBackgroundMusic from "@/assets/background-music.mov";

declare global {
  interface Window {
    __bgMusicEl?: HTMLAudioElement;
  }
}

const BackgroundMusic = () => {
  const { settings } = useSiteSettings();
  
  // Use uploaded music or fallback to default
  const musicSource = settings.background_music || defaultBackgroundMusic;

  useEffect(() => {
    // Asegurar una sola instancia y silenciar cualquier otro medio
    const existingEls = Array.from(document.querySelectorAll('[data-background-music]')) as HTMLAudioElement[];
    let audio: HTMLAudioElement | undefined = (window.__bgMusicEl && document.body.contains(window.__bgMusicEl))
      ? window.__bgMusicEl
      : existingEls[0];

    // Eliminar duplicados dejando solo la instancia elegida
    existingEls.forEach((el) => {
      if (audio && el !== audio) {
        try { el.pause(); el.currentTime = 0; } catch {}
        el.remove();
      }
    });

    // Si no hay instancia o la fuente cambió, crear una nueva
    if (!audio || audio.src !== musicSource) {
      if (audio) {
        try { audio.pause(); audio.currentTime = 0; } catch {}
        audio.remove();
      }
      audio = document.createElement("audio");
      audio.src = musicSource;
      audio.loop = true;
      audio.volume = 0.25;
      audio.preload = "metadata";
      audio.setAttribute("playsinline", "true");
      audio.setAttribute("data-background-music", "true");
      document.body.appendChild(audio);
    }

    // Guardar referencia global
    window.__bgMusicEl = audio;

    // Silenciar todos los otros elementos de audio/video que no sean background music
    document.querySelectorAll('video,audio').forEach((el) => {
      if (el instanceof HTMLMediaElement && el !== audio && !el.hasAttribute('data-background-music')) {
        el.muted = true;
        try { el.volume = 0; } catch {}
        if (el.tagName.toLowerCase() === 'audio') { 
          try { el.pause(); } catch {} 
        }
      }
    });

    // Intentar reproducir automáticamente
    const tryPlay = () => audio!.play().catch(() => {});
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
  }, [musicSource]);

  return null;
};

export default BackgroundMusic;
