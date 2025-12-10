import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const DynamicFavicon = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    const logoUrl = settings.company_logo;
    
    if (!logoUrl) return;

    // Remove existing favicon links
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(el => el.remove());

    // Create new favicon link
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = logoUrl;
    document.head.appendChild(link);

    // Also set apple-touch-icon
    const appleLink = document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    appleLink.href = logoUrl;
    document.head.appendChild(appleLink);

    return () => {
      // Cleanup on unmount (optional, favicon persists)
    };
  }, [settings.company_logo]);

  return null;
};

export default DynamicFavicon;
