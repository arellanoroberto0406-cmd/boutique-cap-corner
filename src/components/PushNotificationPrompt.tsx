import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const PROMPT_DISMISSED_KEY = "push_prompt_dismissed";
const PROMPT_DELAY = 5000; // Show after 5 seconds

export const PushNotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { isSupported, isSubscribed, permission, subscribe, unsubscribe } = usePushNotifications();

  useEffect(() => {
    // Don't show if not supported, already subscribed, or already dismissed
    if (!isSupported || isSubscribed || permission === 'denied') {
      return;
    }

    const dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Show prompt after delay
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, PROMPT_DELAY);

    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, permission]);

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, new Date().toISOString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground text-sm">
              ¿Quieres saber cuando lleguen nuevos productos?
            </h4>
            <p className="text-muted-foreground text-xs mt-1">
              Activa las notificaciones y te avisaremos cuando subamos nuevas gorras y accesorios.
            </p>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                onClick={handleSubscribe}
                className="flex-1"
              >
                <Bell className="w-4 h-4 mr-1" />
                Activar
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleDismiss}
              >
                Ahora no
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Settings toggle component for use in settings/profile pages
export const NotificationToggle = () => {
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="text-sm text-muted-foreground">
        Tu navegador no soporta notificaciones push
      </div>
    );
  }

  return (
    <Button
      variant={isSubscribed ? "outline" : "default"}
      size="sm"
      onClick={isSubscribed ? unsubscribe : subscribe}
    >
      {isSubscribed ? (
        <>
          <BellOff className="w-4 h-4 mr-2" />
          Desactivar notificaciones
        </>
      ) : (
        <>
          <Bell className="w-4 h-4 mr-2" />
          Activar notificaciones
        </>
      )}
    </Button>
  );
};
