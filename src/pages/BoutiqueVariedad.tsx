import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const BoutiqueVariedad = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Boutique Variedad En Moda</h1>
        <div className="prose max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Conoce a nuestro patrocinador Boutique Variedad En Moda, tu destino de moda.
          </p>
          <div className="border rounded-lg p-6 mt-12">
            <h3 className="text-xl font-semibold mb-2">Acerca de Boutique Variedad En Moda</h3>
            <p className="text-muted-foreground">Patrocinador oficial con productos de moda de calidad</p>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default BoutiqueVariedad;
