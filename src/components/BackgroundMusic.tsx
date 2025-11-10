/*
  BackgroundMusic: garantiza una sola instancia global del audio
  - Elimina duplicados por ID y por SRC (útil tras HMR o montajes previos)
  - Reinicia la canción al montar (pedido del usuario)
*/
import { useEffect } from "react";
import backgroundMusic from "@/assets/background-music.mp4";

declare global {
  interface Window {
    __bgMusicEl?: HTMLAudioElement;
  }
}

const AUDIO_ID = "bg-music";
const FILE_HINT = "background-music.mp4"; // utilizado para detectar duplicados por src

const ensureSingleAudioInstance = () => {
  // 1) Intentar reutilizar instancia global si existe
  let keep = window.__bgMusicEl ?? null;

  // 2) Buscar elementos <audio> con el mismo ID o con el mismo src
  const byId = document.getElementById(AUDIO_ID) as HTMLAudioElement | null;
  const bySrc = Array.from(document.querySelectorAll<HTMLAudioElement>("audio"))
    .filter((a) => (a.currentSrc || a.src || "").includes(FILE_HINT));

  if (!keep && byId) keep = byId;
  if (!keep && bySrc.length > 0) keep = bySrc[0];

  // 3) Si no hay ninguno a conservar, creamos uno nuevo
  if (!keep) {
    keep = new Audio(backgroundMusic);
    keep.id = AUDIO_ID;
    keep.loop = true;
    keep.preload = "auto";
    keep.volume = 0.15; // volumen suave
    keep.setAttribute("playsinline", "true");
    keep.style.display = "none"; // oculto
    document.body.appendChild(keep);
  } else {
    // Asegurar configuración y adjuntar al DOM si hiciera falta
    if (!keep.isConnected) document.body.appendChild(keep);
    keep.loop = true;
    keep.preload = "auto";
    keep.volume = 0.15;
    // Si por alguna razón el src no corresponde, lo reestablecemos
    const srcUrl = keep.currentSrc || keep.src || "";
    if (!srcUrl.includes(FILE_HINT)) {
      keep.src = backgroundMusic;
    }
  }

  // 4) Eliminar duplicados sobrantes (mismo ID o mismo SRC)
  const duplicates = new Set<HTMLElement>();
  if (byId && byId !== keep) duplicates.add(byId);
  bySrc.forEach((el) => {
    if (el !== keep) duplicates.add(el);
  });
  // También eliminar si por error hubiese más de uno con el mismo ID
  const allWithId = document.querySelectorAll(`#${CSS.escape(AUDIO_ID)}`);
  allWithId.forEach((el) => {
    if (el !== keep) duplicates.add(el as HTMLElement);
  });
  duplicates.forEach((el) => {
    try {
      (el as HTMLAudioElement).pause?.();
      (el as HTMLAudioElement).src = "";
      el.remove();
    } catch {}
  });

  // 5) Guardar como singleton global
  window.__bgMusicEl = keep;

  return keep;
};

const BackgroundMusic = () => {
  useEffect(() => {
    const audio = ensureSingleAudioInstance();

    // Reiniciar la canción (pedido del usuario) y reproducir
    try {
      audio.currentTime = 0;
    } catch {}
    audio
      .play()
      .catch(() => {
        // El navegador puede bloquear autoplay; se reproducirá tras la primera interacción
      });

    // No desmontamos el elemento para mantener la reproducción entre rutas
    return () => {
      // Intencionalmente vacío
    };
  }, []);

  return null;
};

export default BackgroundMusic;
