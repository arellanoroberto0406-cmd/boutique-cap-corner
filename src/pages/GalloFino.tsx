import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { BrandProducts } from "@/components/BrandProducts";
import brandFino from "@/assets/brand-fino-new.png";

const GalloFino = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Gallo Fino
        </h1>
        <BrandProducts brandPath="/gallo-fino" brandImage={brandFino} />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default GalloFino;
