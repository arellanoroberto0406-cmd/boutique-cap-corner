import ProductCard from "./ProductCard";
import capBlack from "@/assets/cap-black.jpg";
import capWhite from "@/assets/cap-white.jpg";
import capRed from "@/assets/cap-red.jpg";
import capNavy from "@/assets/cap-navy.jpg";

const ProductGrid = () => {
  const products = [
    {
      name: "Gorra Classic Black",
      price: "$799",
      image: capBlack,
    },
    {
      name: "Gorra Essential White",
      price: "$799",
      image: capWhite,
    },
    {
      name: "Gorra Fire Red",
      price: "$899",
      image: capRed,
    },
    {
      name: "Gorra Navy Edition",
      price: "$899",
      image: capNavy,
    },
  ];

  return (
    <section id="productos" className="py-16 md:py-24">
      <div className="container px-4 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Productos Destacados
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cada gorra está diseñada con atención al detalle y fabricada con los mejores materiales para garantizar durabilidad y comodidad.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
