import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const GalloFino = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Gallo Fino</h1>
        <div className="prose max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Explora la colección Gallo Fino, gorras con estilo y personalidad única.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Colección Gallo Fino</h3>
              <p className="text-muted-foreground">Gorras con diseño auténtico y elegante</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default GalloFino;
