import { useSearchParams, Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Legal = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'terminos';
  const { settings, isLoading } = useSiteSettings();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-8">Información Legal</h1>
        
        <Tabs defaultValue={tab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="terminos">Términos y Condiciones</TabsTrigger>
            <TabsTrigger value="privacidad">Política de Privacidad</TabsTrigger>
            <TabsTrigger value="cookies">Política de Cookies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="terminos" className="prose prose-sm max-w-none dark:prose-invert">
            <h2 className="text-2xl font-semibold mb-4">Términos y Condiciones</h2>
            <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {settings.terms_conditions}
            </div>
          </TabsContent>
          
          <TabsContent value="privacidad" className="prose prose-sm max-w-none dark:prose-invert">
            <h2 className="text-2xl font-semibold mb-4">Política de Privacidad</h2>
            <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {settings.privacy_policy}
            </div>
          </TabsContent>
          
          <TabsContent value="cookies" className="prose prose-sm max-w-none dark:prose-invert">
            <h2 className="text-2xl font-semibold mb-4">Política de Cookies</h2>
            <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {settings.cookies_policy}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Legal;
