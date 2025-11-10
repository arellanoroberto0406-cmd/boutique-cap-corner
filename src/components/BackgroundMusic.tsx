import { useEffect } from "react";
import backgroundMusic from "@/assets/background-music.mp4";

// Garantiza una sola instancia global del audio en toda la app
const BackgroundMusic = () => {
  useEffect(() => {
    // Eliminar duplicados si los hubiera por HMR o montajes accidentales
    const dupes = document.querySelectorAll<HTMLAudioElement>("audio#bg-music");
    dupes.forEach((el, idx) => {
      if (idx > 0) el.parentElement?.removeChild(el);
    });

    let audioEl = document.getElementById("bg-music") as HTMLAudioElement | null;

    if (!audioEl) {
      audioEl = new Audio(backgroundMusic);
      audioEl.id = "bg-music";
      audioEl.loop = true;
      audioEl.preload = "auto";
      audioEl.volume = 0.15; // Volumen suave
      audioEl.setAttribute("playsinline", "true");
      audioEl.style.display = "none"; // oculto
      document.body.appendChild(audioEl);
    } else {
      // Asegurar configuración consistente si ya existía
      audioEl.loop = true;
      audioEl.preload = "auto";
      audioEl.volume = 0.15;
      if (audioEl.src.endsWith("background-music.mp4") === false) {
        audioEl.src = backgroundMusic;
      }
    }

    audioEl
      .play()
      .catch(() => {
        // Autoplay puede bloquearse; se reproducirá tras la primera interacción del usuario
      });

    // No desmontamos el elemento para mantener música continua entre rutas
    return () => {
      // Intencionalmente vacío: mantener audio global
    };
  }, []);

  return null;
};

export default BackgroundMusic;
