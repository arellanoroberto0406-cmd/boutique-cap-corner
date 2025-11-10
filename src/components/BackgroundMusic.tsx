import { useEffect } from "react";
import backgroundMusic from "@/assets/background-music.mov";

declare global {
  interface Window {
    __bgMusicEl?: HTMLMediaElement;
  }
}

const BackgroundMusic = () => {
  useEffect(() => {
    // Eliminar duplicados (audio o video) dejando solo el primero
    const dupes = Array.from(document.querySelectorAll('[data-background-music]')) as HTMLMediaElement[];
    if (dupes.length > 1) {
      dupes.slice(1).forEach(m => { try { m.pause(); } catch {} m.remove(); });
    }

    // Crear instancia única como <video> si es .mov, si no <audio>
    let media = window.__bgMusicEl;
    const isMov = backgroundMusic.endsWith('.mov');

    if (!media || !document.body.contains(media)) {
      media = isMov ? document.createElement('video') : document.createElement('audio');
      media.setAttribute('data-background-music', 'true');
      media.loop = true;
      media.preload = 'auto';
      media.src = backgroundMusic;
      try { media.volume = 0.25; } catch {}
      
      // Ajustes específicos de video para iOS
      if (isMov) {
        (media as HTMLVideoElement).setAttribute('playsinline', 'true');
        (media as HTMLVideoElement).muted = false;
        (media as HTMLVideoElement).style.display = 'none';
      }

      document.body.appendChild(media);
      window.__bgMusicEl = media;
    } else {
      // Reaplicar configuración por si se pierde estado
      media.loop = true;
      media.preload = 'auto';
      try { media.volume = 0.25; } catch {}
    }

    const tryPlay = () => media!.play().catch(() => {});

    // Intentar reproducir cuanto antes
    tryPlay();
    media.addEventListener('canplay', tryPlay, { once: true });
    media.addEventListener('canplaythrough', tryPlay, { once: true });

    // Desbloqueo en móvil: primer gesto de usuario
    const unlock = () => { tryPlay(); removeUnlockers(); };
    const removeUnlockers = () => {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('scroll', unlock);
    };
    document.addEventListener('pointerdown', unlock, { once: true, passive: true });
    document.addEventListener('touchstart', unlock, { once: true, passive: true });
    document.addEventListener('click', unlock, { once: true, passive: true });
    document.addEventListener('keydown', unlock, { once: true });
    document.addEventListener('scroll', unlock, { once: true, passive: true });

    // Silenciar cualquier otro video/audio para evitar doble audio
    const muteOtherMedia = (root: Document | HTMLElement | HTMLMediaElement = document) => {
      const maybeMute = (el: Element) => {
        if (el instanceof HTMLMediaElement && !el.hasAttribute('data-background-music')) {
          el.muted = true;
          el.setAttribute('muted', '');
          try { el.volume = 0; } catch {}
        }
      };

      if (root instanceof HTMLMediaElement) {
        maybeMute(root);
      }

      if ('querySelectorAll' in root) {
        const nodes = (root as Document | HTMLElement).querySelectorAll('video,audio');
        nodes.forEach(maybeMute);
      }
    };

    // Silenciar los ya existentes
    muteOtherMedia();

    // Observar nuevos nodos añadidos dinámicamente y silenciarlos si son medios
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node instanceof HTMLMediaElement) {
            muteOtherMedia(node);
          } else if (node instanceof HTMLElement) {
            muteOtherMedia(node);
          }
        });
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      // No eliminamos la instancia para evitar duplicados con StrictMode/HMR
    };
  }, []);

  return null;
};

export default BackgroundMusic;
