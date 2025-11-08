import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AriaChatButton from "@/components/AriaChatButton";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ProductGrid />
      </main>
      <Footer />
      <WhatsAppButton />
      <AriaChatButton />
    </div>
  );
};

export default Index;
