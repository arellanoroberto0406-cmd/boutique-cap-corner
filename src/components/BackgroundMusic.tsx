import { useEffect, useRef } from "react";
import backgroundMusic from "@/assets/background-music.mp4";

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.15; // Volumen suave (15%)
      audioRef.current.play().catch(() => {
        // El navegador puede bloquear autoplay, se reproducirá con la primera interacción
      });
    }
  }, []);

  return (
    <audio
      ref={audioRef}
      src={backgroundMusic}
      loop
      preload="auto"
      className="hidden"
    />
  );
};

export default BackgroundMusic;
