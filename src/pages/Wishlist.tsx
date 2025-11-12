import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FreeShippingBanner } from "@/components/FreeShippingBanner";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <FreeShippingBanner />
      <Header />
      
      <main className="container px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Heart className="h-10 w-10 text-primary fill-current" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Mi Lista de Deseos</h1>
          <p className="text-muted-foreground text-lg">
            {wishlist.length > 0 
              ? `Tienes ${wishlist.length} ${wishlist.length === 1 ? 'producto' : 'productos'} guardados`
              : 'Aún no has guardado ningún producto'}
          </p>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-6">
              Explora nuestra colección y guarda tus gorras favoritas
            </p>
            <Button size="lg" onClick={() => navigate("/")}>
              Ver Productos
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
