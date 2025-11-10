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
      // No removemos el audio del body para evitar duplicados
    };
  }, []);

  return null;
};

export default BackgroundMusic;
