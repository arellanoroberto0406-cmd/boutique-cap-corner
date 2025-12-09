import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    const root = document.documentElement;
    
    // Primary colors
    if (settings.theme_primary) {
      root.style.setProperty('--primary', settings.theme_primary);
      root.style.setProperty('--ring', settings.theme_primary);
      root.style.setProperty('--sidebar-primary', settings.theme_primary);
      root.style.setProperty('--sidebar-ring', settings.theme_primary);
    }
    
    // Secondary colors
    if (settings.theme_secondary) {
      root.style.setProperty('--secondary', settings.theme_secondary);
      root.style.setProperty('--sidebar-accent', settings.theme_secondary);
    }
    
    // Accent colors
    if (settings.theme_accent) {
      root.style.setProperty('--accent', settings.theme_accent);
    }
    
    // Background colors
    if (settings.theme_background) {
      root.style.setProperty('--background', settings.theme_background);
      root.style.setProperty('--sidebar-background', settings.theme_background);
    }
    
    // Foreground (text) colors
    if (settings.theme_foreground) {
      root.style.setProperty('--foreground', settings.theme_foreground);
      root.style.setProperty('--primary-foreground', settings.theme_foreground);
      root.style.setProperty('--secondary-foreground', settings.theme_foreground);
      root.style.setProperty('--accent-foreground', settings.theme_foreground);
      root.style.setProperty('--card-foreground', settings.theme_foreground);
      root.style.setProperty('--popover-foreground', settings.theme_foreground);
      root.style.setProperty('--sidebar-foreground', settings.theme_foreground);
    }
    
    // Card colors
    if (settings.theme_card) {
      root.style.setProperty('--card', settings.theme_card);
      root.style.setProperty('--popover', settings.theme_card);
    }
    
    // Muted colors
    if (settings.theme_muted) {
      root.style.setProperty('--muted', settings.theme_muted);
      root.style.setProperty('--border', settings.theme_muted);
      root.style.setProperty('--input', settings.theme_muted);
      root.style.setProperty('--sidebar-border', settings.theme_muted);
    }
  }, [
    settings.theme_primary, 
    settings.theme_secondary, 
    settings.theme_accent,
    settings.theme_background,
    settings.theme_foreground,
    settings.theme_card,
    settings.theme_muted
  ]);

  return <>{children}</>;
};

export default ThemeProvider;
