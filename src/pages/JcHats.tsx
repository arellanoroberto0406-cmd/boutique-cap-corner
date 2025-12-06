import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { BrandProducts } from "@/components/BrandProducts";
import brandJC from "@/assets/brand-jc-new.png";

const JcHats = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          JC Solo los Mejores
        </h1>
        <BrandProducts brandPath="/jc-hats" brandImage={brandJC} />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default JcHats;
