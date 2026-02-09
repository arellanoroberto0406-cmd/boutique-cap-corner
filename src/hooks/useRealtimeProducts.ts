import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const sendBrowserNotification = (title: string, body: string, url: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        tag: 'new-product',
      });
      notification.onclick = () => {
        window.focus();
        window.location.href = url;
        notification.close();
      };
    } catch {
      // Fallback: use service worker notification if available
      navigator.serviceWorker?.ready?.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          tag: 'new-product',
          data: { url },
        } as NotificationOptions);
      }).catch(() => {});
    }
  }
};

export const useRealtimeProducts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for new brand products
    const brandProductsChannel = supabase
      .channel('new-brand-products')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'brand_products'
        },
        (payload) => {
          console.log('New brand product:', payload);
          const product = payload.new as { name: string };
          
          toast.success(`¡Nuevo producto!`, {
            description: product.name,
            action: {
              label: "Ver",
              onClick: () => navigate('/lo-nuevo')
            },
            duration: 8000
          });

          sendBrowserNotification(
            '¡Nuevo producto disponible!',
            product.name,
            '/lo-nuevo'
          );
        }
      )
      .subscribe();

    // Listen for new estuches
    const estuchesChannel = supabase
      .channel('new-estuches')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'estuches'
        },
        (payload) => {
          console.log('New estuche:', payload);
          const product = payload.new as { name: string };
          
          toast.success(`¡Nuevo estuche!`, {
            description: product.name,
            action: {
              label: "Ver",
              onClick: () => navigate('/estuche-de-gorra')
            },
            duration: 8000
          });

          sendBrowserNotification(
            '¡Nuevo estuche disponible!',
            product.name,
            '/estuche-de-gorra'
          );
        }
      )
      .subscribe();

    // Listen for new pines
    const pinesChannel = supabase
      .channel('new-pines')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pines'
        },
        (payload) => {
          console.log('New pin:', payload);
          const product = payload.new as { name: string };
          
          toast.success(`¡Nuevo pin!`, {
            description: product.name,
            action: {
              label: "Ver",
              onClick: () => navigate('/pines')
            },
            duration: 8000
          });

          sendBrowserNotification(
            '¡Nuevo pin disponible!',
            product.name,
            '/pines'
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(brandProductsChannel);
      supabase.removeChannel(estuchesChannel);
      supabase.removeChannel(pinesChannel);
    };
  }, [navigate]);
};
