import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check, Share, MoreVertical } from "lucide-react";
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
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12 mt-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Smartphone className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
              Instala Nuestra App
            </h1>
            <p className="text-muted-foreground">
              Accede rápidamente desde tu pantalla de inicio
            </p>
          </div>

          {isInstalled ? (
            <Card className="border-green-500/50 bg-green-500/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3 text-green-500">
                  <Check className="w-8 h-8" />
                  <span className="text-xl font-semibold">¡App ya instalada!</span>
                </div>
                <p className="text-center mt-4 text-muted-foreground">
                  Busca "Boutique AR" en tu pantalla de inicio
                </p>
              </CardContent>
            </Card>
          ) : isIOS ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share className="w-5 h-5" />
                  Instrucciones para iPhone/iPad
                </CardTitle>
                <CardDescription>
                  Sigue estos pasos para instalar la app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Toca el botón Compartir</p>
                    <p className="text-sm text-muted-foreground">
                      En Safari, busca el ícono <Share className="w-4 h-4 inline" /> en la barra inferior
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Selecciona "Agregar a Inicio"</p>
                    <p className="text-sm text-muted-foreground">
                      Desliza hacia abajo y busca esta opción
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Confirma tocando "Agregar"</p>
                    <p className="text-sm text-muted-foreground">
                      ¡Listo! La app aparecerá en tu pantalla de inicio
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : deferredPrompt ? (
            <Card>
              <CardHeader>
                <CardTitle>Instalar App</CardTitle>
                <CardDescription>
                  Instala nuestra app para acceso rápido y experiencia offline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleInstallClick} size="lg" className="w-full gap-2">
                  <Download className="w-5 h-5" />
                  Instalar Ahora
                </Button>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    Sin tiendas de apps - instalación directa
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    Acceso rápido desde tu pantalla de inicio
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    Funciona sin conexión
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MoreVertical className="w-5 h-5" />
                  Instrucciones para Android
                </CardTitle>
                <CardDescription>
                  Sigue estos pasos para instalar la app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Abre el menú de Chrome</p>
                    <p className="text-sm text-muted-foreground">
                      Toca los tres puntos <MoreVertical className="w-4 h-4 inline" /> en la esquina superior
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Selecciona "Instalar app" o "Agregar a pantalla de inicio"</p>
                    <p className="text-sm text-muted-foreground">
                      Busca esta opción en el menú
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Confirma la instalación</p>
                    <p className="text-sm text-muted-foreground">
                      ¡Listo! La app aparecerá en tu pantalla de inicio
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              La app es gratuita y no ocupa casi espacio en tu dispositivo
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InstallApp;
