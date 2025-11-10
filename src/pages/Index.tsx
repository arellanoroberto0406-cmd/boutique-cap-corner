import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { TrustBadges } from "@/components/TrustBadges";
import { Newsletter } from "@/components/Newsletter";
import { lazy, Suspense } from "react";

const ProductGrid = lazy(() => import("@/components/ProductGrid"));

const Index = () => {
  return (
    <div className="min-h-screen">
      <PromoBanner />
      <Header />
      <main>
        <Hero />
        <TrustBadges />
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
          <ProductGrid />
        </Suspense>
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
