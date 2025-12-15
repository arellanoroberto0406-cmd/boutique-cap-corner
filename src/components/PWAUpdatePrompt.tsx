import { useState, useEffect, useCallback } from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PWAUpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  const registerSW = useCallback(async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update();
        }, 60 * 1000);

        // Initial update check
        registration.update();

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New content is available
                setWaitingWorker(newWorker);
                setShowPrompt(true);
                toast.info("¡Nueva actualización disponible!", {
                  duration: 5000,
                });
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

      } catch (error) {
        console.error("SW registration failed:", error);
      }
    }
  }, []);

  useEffect(() => {
    registerSW();
  }, [registerSW]);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-slide-down">
      <div className="bg-primary text-primary-foreground rounded-2xl p-4 shadow-2xl shadow-black/30 max-w-md mx-auto">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-4">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm">
              ¡Nueva versión disponible!
            </h3>
            <p className="text-xs opacity-90 mt-0.5">
              Actualiza para obtener las últimas mejoras
            </p>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleUpdate}
            className="shrink-0 rounded-xl font-semibold"
          >
            Actualizar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
