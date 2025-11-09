import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const BarbaHats = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Barba Hats</h1>
        <div className="prose max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Conoce la marca Barba Hats, gorras con carácter y estilo inconfundible.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Colección Barba Hats</h3>
              <p className="text-muted-foreground">Gorras con diseño distintivo y calidad superior</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default BarbaHats;
