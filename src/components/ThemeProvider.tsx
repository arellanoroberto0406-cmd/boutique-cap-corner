import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme_primary) {
      root.style.setProperty('--primary', settings.theme_primary);
      root.style.setProperty('--ring', settings.theme_primary);
      root.style.setProperty('--sidebar-primary', settings.theme_primary);
      root.style.setProperty('--sidebar-ring', settings.theme_primary);
    }
    
    if (settings.theme_secondary) {
      root.style.setProperty('--secondary', settings.theme_secondary);
      root.style.setProperty('--sidebar-accent', settings.theme_secondary);
    }
    
    if (settings.theme_accent) {
      root.style.setProperty('--accent', settings.theme_accent);
    }
  }, [settings.theme_primary, settings.theme_secondary, settings.theme_accent]);

  return <>{children}</>;
};

export default ThemeProvider;
