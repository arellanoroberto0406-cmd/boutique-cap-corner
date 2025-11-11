import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CollectionProducts } from "@/components/CollectionProducts";
import brandRanchCorral from "@/assets/brand-ranch-corral-new.png";

const RanchCorral = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Ranch & Corral
        </h1>
        <CollectionProducts collection="Sport" brandImage={brandRanchCorral} />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default RanchCorral;
