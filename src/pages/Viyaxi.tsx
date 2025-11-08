import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Viyaxi = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Viyaxi</h1>
        <div className="prose max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Conoce a nuestro patrocinador Viyaxi, innovación y calidad en servicios.
          </p>
          <div className="border rounded-lg p-6 mt-12">
            <h3 className="text-xl font-semibold mb-2">Acerca de Viyaxi</h3>
            <p className="text-muted-foreground">Patrocinador oficial con soluciones innovadoras</p>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Viyaxi;
