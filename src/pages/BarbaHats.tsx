import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { BrandProducts } from "@/components/BrandProducts";
import brandBarba from "@/assets/brand-barba-new.png";

const BarbaHats = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Barba Hats
        </h1>
        <BrandProducts brandPath="/barba-hats" brandImage={brandBarba} />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default BarbaHats;
