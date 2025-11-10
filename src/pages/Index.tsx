import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { Newsletter } from "@/components/Newsletter";
import { TrustBadges } from "@/components/TrustBadges";
import { lazy, Suspense } from "react";

const AriaChatButton = lazy(() => import("@/components/AriaChatButton"));

const Index = () => {
  return (
    <div className="min-h-screen">
      <PromoBanner />
      <Header />
      <main>
        <Hero />
        <TrustBadges />
        <ProductGrid />
        <Newsletter />
      </main>
      <Footer />
      <Suspense fallback={null}>
        <AriaChatButton />
      </Suspense>
    </div>
  );
};

export default Index;
