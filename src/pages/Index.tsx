import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { TrustBadges } from "@/components/TrustBadges";
import { Newsletter } from "@/components/Newsletter";
import SectionDivider from "@/components/SectionDivider";
import SectionHeader from "@/components/SectionHeader";
import { Sparkles, Flame, Grid3x3 } from "lucide-react";
import { lazy, Suspense } from "react";

const ProductGrid = lazy(() => import("@/components/ProductGrid"));
const AriaChatButton = lazy(() => import("@/components/AriaChatButton"));
const FeaturedProducts = lazy(() => import("@/components/FeaturedProducts"));
const PromoVideo = lazy(() => import("@/components/PromoVideo"));

const SectionLoader = ({ minHeight = "400px" }: { minHeight?: string }) => (
  <div className="flex items-center justify-center" style={{ minHeight }}>
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <PromoBanner />
      <Header />

      <main className="relative">
        {/* HERO */}
        <Hero />

        {/* TRUST BADGES */}
        <TrustBadges />

        <SectionDivider variant="diamond" />

        {/* FEATURED PRODUCTS */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4">
            <SectionHeader
              eyebrow="Lo más destacado"
              title="Productos Destacados"
              description="Descubre nuestra selección curada de las gorras y accesorios más populares del momento."
              icon={<Sparkles className="h-3.5 w-3.5" />}
            />
          </div>
          <Suspense fallback={<SectionLoader />}>
            <FeaturedProducts />
          </Suspense>
        </section>

        <SectionDivider variant="line" />

        {/* PROMO VIDEO */}
        <section className="py-12 md:py-20">
          <Suspense fallback={null}>
            <PromoVideo />
          </Suspense>
        </section>

        <SectionDivider variant="diamond" />

        {/* PRODUCT GRID — full catalog */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4">
            <SectionHeader
              eyebrow="Catálogo completo"
              title="Explora Nuestra Colección"
              description="Filtra por marca, talla y precio para encontrar la pieza perfecta para tu estilo."
              icon={<Grid3x3 className="h-3.5 w-3.5" />}
            />
          </div>
          <Suspense fallback={<SectionLoader minHeight="600px" />}>
            <ProductGrid />
          </Suspense>
        </section>

        <SectionDivider variant="wave" />

        {/* NEWSLETTER */}
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
