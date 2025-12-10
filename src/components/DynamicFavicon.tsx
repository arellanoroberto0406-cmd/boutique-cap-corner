import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const DynamicFavicon = () => {
  const { settings, isLoading } = useSiteSettings();

  useEffect(() => {
    if (isLoading) return;
    
    const logoUrl = settings.company_logo;
    
    if (!logoUrl) return;

    // Remove ALL existing favicon links
    const existingFavicons = document.querySelectorAll('link[rel*="icon"], link[rel="shortcut icon"]');
    existingFavicons.forEach(el => el.remove());

    // Determine image type from URL
    const getImageType = (url: string) => {
      if (url.includes('.png')) return 'image/png';
      if (url.includes('.jpg') || url.includes('.jpeg')) return 'image/jpeg';
      if (url.includes('.webp')) return 'image/webp';
      if (url.includes('.svg')) return 'image/svg+xml';
      if (url.includes('.ico')) return 'image/x-icon';
      return 'image/png'; // default
    };

    // Add cache buster to force refresh
    const faviconUrl = logoUrl.includes('?') 
      ? `${logoUrl}&v=${Date.now()}` 
      : `${logoUrl}?v=${Date.now()}`;

    // Create new favicon link
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = getImageType(logoUrl);
    link.href = faviconUrl;
    document.head.appendChild(link);

    // Also set shortcut icon for older browsers
    const shortcutLink = document.createElement('link');
    shortcutLink.rel = 'shortcut icon';
    shortcutLink.href = faviconUrl;
    document.head.appendChild(shortcutLink);

    // Also set apple-touch-icon
    const appleLink = document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    appleLink.href = faviconUrl;
    document.head.appendChild(appleLink);

    // Update document title meta if needed
    const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon-precomposed"]');
    if (existingAppleIcon) existingAppleIcon.remove();

  }, [settings.company_logo, isLoading]);

  return null;
};

export default DynamicFavicon;
