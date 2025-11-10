import { useEffect } from "react";
import backgroundMusic from "@/assets/background-music.mov";

const BackgroundMusic = () => {
  useEffect(() => {
    // Limpiar cualquier audio previo
    const existingAudios = document.querySelectorAll('audio[data-background-music]');
    existingAudios.forEach(el => {
      const audio = el as HTMLAudioElement;
      audio.pause();
      audio.remove();
    });

    // Crear UN SOLO elemento de audio
    const audio = new Audio(backgroundMusic);
    audio.setAttribute('data-background-music', 'true');
    audio.loop = true;
    audio.volume = 0.15; // Volumen suave al 15%
    
    // Reproducir automáticamente
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Auto-play bloqueado, el usuario debe interactuar primero:", error);
      });
    }

    // Cleanup: pausar al desmontar
    return () => {
      audio.pause();
      audio.remove();
    };
  }, []);

  return null;
};

export default BackgroundMusic;
