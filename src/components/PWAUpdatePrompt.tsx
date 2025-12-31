import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";

// Function to play notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a pleasant notification sound
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // First tone
    oscillator1.frequency.setValueAtTime(880, audioContext.currentTime); // A5
    oscillator1.type = 'sine';
    
    // Second tone (harmony)
    oscillator2.frequency.setValueAtTime(1108.73, audioContext.currentTime); // C#6
    oscillator2.type = 'sine';
    
    // Envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.2);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.25);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
    
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.5);
    oscillator2.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log("Could not play notification sound:", error);
  }
};

const PWAUpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [testMode, setTestMode] = useState(false);

  const showUpdateNotification = useCallback(() => {
    setShowPrompt(true);
    playNotificationSound();
    
    // Vibrate phone if supported (pattern: vibrate 200ms, pause 100ms, vibrate 200ms)
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    toast.info("¡Nueva actualización disponible!", {
      duration: 5000,
    });
  }, []);

  // Test function - expose to window for testing
  useEffect(() => {
    (window as any).testUpdateNotification = () => {
      setTestMode(true);
      showUpdateNotification();
    };
    return () => {
      delete (window as any).testUpdateNotification;
    };
  }, [showUpdateNotification]);

  const checkForUpdates = useCallback(async (registration: ServiceWorkerRegistration) => {
    try {
      await registration.update();
    } catch (error) {
      console.log("Error checking for updates:", error);
    }
  }, []);

  const registerSW = useCallback(async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Check for updates every 30 seconds (more frequent)
        const updateInterval = setInterval(() => {
          checkForUpdates(registration);
        }, 30 * 1000);

        // Initial update check
        checkForUpdates(registration);

        // Check if there's already a waiting worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          showUpdateNotification();
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  // New content is available
                  setWaitingWorker(newWorker);
                  showUpdateNotification();
                }
              }
            });
          }
        });

        // Handle controller change
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });

        // Check for updates when page becomes visible
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            checkForUpdates(registration);
          }
        });

        // Check for updates on focus
        window.addEventListener("focus", () => {
          checkForUpdates(registration);
        });

        return () => {
          clearInterval(updateInterval);
        };

      } catch (error) {
        console.error("SW registration failed:", error);
      }
    }
  }, [checkForUpdates]);

  useEffect(() => {
    registerSW();
  }, [registerSW]);

  const handleUpdate = useCallback(() => {
    if (testMode) {
      // In test mode, just hide the prompt
      setShowPrompt(false);
      setTestMode(false);
      toast.success("¡Prueba completada!");
      return;
    }
    
    if (waitingWorker) {
      setIsUpdating(true);
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      // Fallback reload if controllerchange doesn't fire
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, [waitingWorker, testMode]);

  const handleDismiss = () => {
    setShowPrompt(false);
    setTestMode(false);
  };

  if (!showPrompt) return null;

  return (
    <button
      onClick={handleUpdate}
      disabled={isUpdating}
      className="fixed bottom-24 right-4 z-[100] animate-bounce bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-full shadow-2xl shadow-black/40 flex items-center gap-2 font-bold text-sm hover:scale-105 transition-all duration-300 border-2 border-white/30"
    >
      {isUpdating ? (
        <>
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Actualizando...</span>
        </>
      ) : (
        <>
          <Download className="h-5 w-5" />
          <span>{testMode ? "Cerrar Prueba" : "Instalar Actualización"}</span>
        </>
      )}
    </button>
  );
};

export default PWAUpdatePrompt;
