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
    <div className="fixed top-4 left-4 right-4 z-[100] animate-slide-down">
      <div className="bg-primary text-primary-foreground rounded-2xl p-4 shadow-2xl shadow-black/30 max-w-md mx-auto relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-4">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
            {isUpdating ? (
              <RefreshCw className="h-6 w-6 animate-spin" />
            ) : (
              <Download className="h-6 w-6" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm">
              ¡Nueva versión disponible!
            </h3>
            <p className="text-xs opacity-90 mt-0.5">
              Hay nuevos productos y mejoras
            </p>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleUpdate}
            disabled={isUpdating}
            className="shrink-0 rounded-xl font-semibold"
          >
            {isUpdating ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
