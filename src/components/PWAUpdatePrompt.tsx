import { useState, useEffect, useCallback } from "react";
import { RefreshCw, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PWAUpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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
          setShowPrompt(true);
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  // New content is available
                  setWaitingWorker(newWorker);
                  setShowPrompt(true);
                  toast.info("¡Nueva actualización disponible!", {
                    duration: 5000,
                    action: {
                      label: "Actualizar",
                      onClick: () => handleUpdate(),
                    },
                  });
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
    if (waitingWorker) {
      setIsUpdating(true);
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      // Fallback reload if controllerchange doesn't fire
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, [waitingWorker]);

  const handleDismiss = () => {
    setShowPrompt(false);
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
          <span>Instalar Actualización</span>
        </>
      )}
    </button>
  );
};

export default PWAUpdatePrompt;
