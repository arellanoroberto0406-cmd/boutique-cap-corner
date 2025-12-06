import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { BrandProducts } from "@/components/BrandProducts";
import brand31 from "@/assets/brand-31-new.png";

const Marca31 = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Marca 31
        </h1>
        <BrandProducts brandPath="/marca-31" brandImage={brand31} />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Marca31;
