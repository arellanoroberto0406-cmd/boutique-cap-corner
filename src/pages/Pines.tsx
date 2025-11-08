import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Pines = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Pines</h1>
        <div className="prose max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Descubre nuestra colección de pines de alta calidad para personalizar tus gorras.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {/* Aquí se pueden agregar los productos de pines */}
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Pines Premium</h3>
              <p className="text-muted-foreground">Pines de diseño exclusivo para tus gorras</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Pines;
