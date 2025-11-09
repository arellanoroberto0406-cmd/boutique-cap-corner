import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { lazy, Suspense } from "react";

const AriaChatButton = lazy(() => import("@/components/AriaChatButton"));

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ProductGrid />
      </main>
      <Footer />
      <Suspense fallback={null}>
        <AriaChatButton />
      </Suspense>
    </div>
  );
};

export default Index;
