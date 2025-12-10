import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Smartphone, Check, Share, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // For iOS, we can't trigger install, just show instructions briefly
      return;
    }

    if (deferredPrompt) {
      setIsInstalling(true);
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setIsInstalling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12 mt-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Smartphone className="w-12 h-12 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
              Boutique AR
            </h1>
            <p className="text-muted-foreground text-lg">
              Tu tienda de gorras premium
            </p>
          </div>

          {isInstalled ? (
            <Card className="border-green-500/50 bg-green-500/10">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-green-500 mb-2">¡App Instalada!</h2>
                    <p className="text-muted-foreground">
                      Busca "Boutique AR" en tu pantalla de inicio
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : isIOS ? (
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Share className="w-8 h-8 text-primary" />
                  </div>
                  
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-foreground mb-2">Instalar en iPhone</h2>
                    <p className="text-muted-foreground text-sm mb-4">
                      Toca el botón de compartir y selecciona "Agregar a Inicio"
                    </p>
                  </div>

                  <div className="w-full space-y-3 text-sm">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
                      <span>Toca <Share className="w-4 h-4 inline mx-1" /> en Safari</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">2</div>
                      <span>Selecciona "Agregar a Inicio"</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">3</div>
                      <span>Toca "Agregar"</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center gap-6">
                  <Button 
                    onClick={handleInstallClick} 
                    size="lg" 
                    className="w-full h-14 text-lg gap-3 rounded-xl"
                    disabled={isInstalling || !deferredPrompt}
                  >
                    {isInstalling ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Instalando...
                      </>
                    ) : (
                      <>
                        <Download className="w-6 h-6" />
                        Instalar App
                      </>
                    )}
                  </Button>

                  {!deferredPrompt && (
                    <p className="text-sm text-muted-foreground text-center">
                      Abre esta página en Chrome desde tu celular para instalar
                    </p>
                  )}
                  
                  <div className="w-full space-y-2 pt-2">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Check className="w-5 h-5 text-green-500 shrink-0" />
                      <span>Instalación directa, sin tiendas</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Check className="w-5 h-5 text-green-500 shrink-0" />
                      <span>Acceso rápido desde tu inicio</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Check className="w-5 h-5 text-green-500 shrink-0" />
                      <span>Gratis y sin ocupar espacio</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InstallApp;
