import { useEffect, useRef } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

declare global {
  interface Window {
    __bgMusicEl?: HTMLAudioElement | HTMLVideoElement;
  }
}

const BackgroundMusic = () => {
  const { settings } = useSiteSettings();
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
  
  // Only play music if admin has uploaded one - no default music
  const musicSource = settings.background_music || null;
  
  // Detect if source is a video file (check URL for video extensions)
  const isVideo = musicSource ? /\.(mp4|mov|webm|avi|mkv|m4v)/i.test(musicSource) : false;

  useEffect(() => {
    // If no music is configured, clean up any existing media and exit
    if (!musicSource) {
      const existingEls = Array.from(document.querySelectorAll('[data-background-music]')) as HTMLMediaElement[];
      existingEls.forEach((el) => {
        try { el.pause(); el.currentTime = 0; } catch {}
        el.remove();
      });
      if (window.__bgMusicEl) {
        try { window.__bgMusicEl.pause(); window.__bgMusicEl.currentTime = 0; } catch {}
        window.__bgMusicEl.remove();
        window.__bgMusicEl = undefined;
      }
      mediaRef.current = null;
      return;
    }

    // Find existing background music element
    const existingEls = Array.from(document.querySelectorAll('[data-background-music]')) as HTMLMediaElement[];
    let media: HTMLMediaElement | undefined = (window.__bgMusicEl && document.body.contains(window.__bgMusicEl))
      ? window.__bgMusicEl
      : existingEls[0];

    // Remove duplicates
    existingEls.forEach((el) => {
      if (media && el !== media) {
        try { el.pause(); el.currentTime = 0; } catch {}
        el.remove();
      }
    });

    // Check if we need to create a new element (source changed or type changed)
    const currentSrc = media?.src || '';
    const sourceChanged = !currentSrc.includes(musicSource.split('/').pop() || '');
    const needsNewElement = !media || 
      sourceChanged || 
      (isVideo && media.tagName.toLowerCase() !== 'video') ||
      (!isVideo && media.tagName.toLowerCase() !== 'audio');

    if (needsNewElement) {
      if (media) {
        try { media.pause(); media.currentTime = 0; } catch {}
        media.remove();
      }
      
      // Create appropriate element based on file type
      if (isVideo) {
        console.log('[BackgroundMusic] Creating video element for:', musicSource);
        const video = document.createElement("video");
        video.src = musicSource;
        video.loop = true;
        video.volume = 0.25;
        video.muted = false;
        video.autoplay = true;
        video.preload = "auto";
        video.setAttribute("playsinline", "true");
        video.setAttribute("data-background-music", "true");
        // Hide video visually but keep audio
        video.style.position = "fixed";
        video.style.top = "-9999px";
        video.style.left = "-9999px";
        video.style.width = "1px";
        video.style.height = "1px";
        video.style.opacity = "0";
        video.style.pointerEvents = "none";
        video.style.zIndex = "-1";
        document.body.appendChild(video);
        media = video;
      } else {
        console.log('[BackgroundMusic] Creating audio element for:', musicSource);
        const audio = document.createElement("audio");
        audio.src = musicSource;
        audio.loop = true;
        audio.volume = 0.25;
        audio.autoplay = true;
        audio.preload = "auto";
        audio.setAttribute("playsinline", "true");
        audio.setAttribute("data-background-music", "true");
        document.body.appendChild(audio);
        media = audio;
      }
    }

    // Store references
    window.__bgMusicEl = media;
    mediaRef.current = media;

    // Mute all other audio/video elements
    document.querySelectorAll('video,audio').forEach((el) => {
      if (el instanceof HTMLMediaElement && el !== media && !el.hasAttribute('data-background-music')) {
        el.muted = true;
        try { el.volume = 0; } catch {}
        if (el.tagName.toLowerCase() === 'audio') { 
          try { el.pause(); } catch {} 
        }
      }
    });

    // Try to play automatically
    const tryPlay = () => {
      if (!media) return;
      const playPromise = media.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log('[BackgroundMusic] Autoplay blocked, waiting for user interaction:', err.message);
        });
      }
    };
    
    // Wait for media to be ready before playing
    if (media.readyState >= 2) {
      tryPlay();
    } else {
      media.addEventListener('canplay', tryPlay, { once: true });
    }

    // Watch for new audio elements
    const onAnyPlay = (e: Event) => {
      const el = e.target as Element | null;
      if (el instanceof HTMLMediaElement && el !== media && !el.hasAttribute('data-background-music')) {
        el.muted = true;
        try { (el as HTMLMediaElement).volume = 0; } catch {}
        if (el.tagName.toLowerCase() === 'audio') {
          try { (el as HTMLMediaElement).pause(); } catch {}
        }
      }
    };
    document.addEventListener('play', onAnyPlay, true);

    // Unlock on mobile with user gesture
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

    // Pause when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden && media) {
        try { media.pause(); } catch {}
      } else if (!document.hidden && media) {
        tryPlay();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Stop music when leaving page
    const handleBeforeUnload = () => {
      if (media) {
        try {
          media.pause();
          media.currentTime = 0;
        } catch {}
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      removeUnlockers();
      document.removeEventListener('play', onAnyPlay, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      
      // Pause and cleanup media on unmount
      if (media) {
        try {
          media.pause();
          media.currentTime = 0;
        } catch {}
        media.remove();
      }
      if (window.__bgMusicEl === media) {
        window.__bgMusicEl = undefined;
      }
      mediaRef.current = null;
    };
  }, [musicSource, isVideo]);

  return null;
};

export default BackgroundMusic;
