import { useState, useEffect } from "react";
import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MusicControl = () => {
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('bg-music-volume');
    return saved ? parseFloat(saved) : 0.25;
  });
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('bg-music-muted') === 'true';
  });

  useEffect(() => {
    const audio = window.__bgMusicEl;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
    localStorage.setItem('bg-music-volume', volume.toString());
    localStorage.setItem('bg-music-muted', isMuted.toString());
  }, [volume, isMuted]);

  // Sync with audio element when it's created
  useEffect(() => {
    const interval = setInterval(() => {
      const audio = window.__bgMusicEl;
      if (audio) {
        audio.volume = isMuted ? 0 : volume;
      }
    }, 500);
    return () => clearInterval(interval);
  }, [volume, isMuted]);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-20 right-4 z-40 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg hover:bg-card"
        >
          <VolumeIcon className="h-5 w-5 text-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        align="end" 
        className="w-48 p-4"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Música</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleMute}
            >
              <VolumeIcon className="h-4 w-4" />
            </Button>
          </div>
          <Slider
            value={[isMuted ? 0 : volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>{Math.round((isMuted ? 0 : volume) * 100)}%</span>
            <span>100%</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MusicControl;
