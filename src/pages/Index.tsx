import { lazy, Suspense, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { TrustBadges } from "@/components/TrustBadges";
import { Newsletter } from "@/components/Newsletter";

// Lazy load heavy components
const ProductGrid = lazy(() => import("@/components/ProductGrid"));
const AriaChatButton = lazy(() => import("@/components/AriaChatButton"));
const FeaturedProducts = lazy(() => import("@/components/FeaturedProducts"));
const PromoVideo = lazy(() => import("@/components/PromoVideo"));

// Loading skeleton component
const SectionSkeleton = ({ height = "400px" }: { height?: string }) => (
  <div className={`flex items-center justify-center bg-muted/20`} style={{ minHeight: height }}>
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-muted-foreground">Cargando...</span>
    </div>
  </div>
);

const Index = () => {
  // Preload critical resources
  useEffect(() => {
    // Preload FeaturedProducts module
    import("@/components/FeaturedProducts");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner */}
      <PromoBanner />
      
      {/* Navigation */}
      <Header />
      
      <main className="flex flex-col">
        {/* Hero Section - Above the fold */}
        <section id="hero">
          <Hero />
        </section>

        {/* Trust Indicators */}
        <section id="trust" className="py-8 sm:py-12 bg-muted/30">
          <TrustBadges />
        </section>

        {/* Featured Products - Primary content */}
        <section id="featured" className="py-12 sm:py-16">
          <Suspense fallback={<SectionSkeleton height="500px" />}>
            <FeaturedProducts />
          </Suspense>
        </section>

        {/* Promo Video */}
        <section id="video" className="py-8 sm:py-12 bg-muted/20">
          <Suspense fallback={null}>
            <PromoVideo />
          </Suspense>
        </section>

        {/* All Products Catalog */}
        <section id="catalog" className="py-12 sm:py-16">
          <Suspense fallback={<SectionSkeleton height="600px" />}>
            <ProductGrid />
          </Suspense>
        </section>

        {/* Newsletter Signup */}
        <section id="newsletter" className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/30">
          <Newsletter />
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Chat Button */}
      <Suspense fallback={null}>
        <AriaChatButton />
      </Suspense>
    </div>
  );
};

export default Index;
