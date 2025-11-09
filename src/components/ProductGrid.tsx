import { useState } from "react";
import ProductCard from "./ProductCard";
import capDiamondM from "@/assets/cap-diamond-m.jpg";
import capFino from "@/assets/cap-fino.jpg";
import capMtlt27 from "@/assets/cap-mtlt-27.jpg";
import capThreeStars from "@/assets/cap-three-stars.jpg";
import capGraffiti from "@/assets/cap-graffiti.jpg";

const ProductGrid = () => {
  const [activeText, setActiveText] = useState<string | null>(null);

  const handleTextClick = (id: string) => {
    setActiveText(activeText === id ? null : id);
  };

  const products = [
    {
      name: "Gorra Diamond M",
      price: "$999",
      image: capDiamondM,
    },
    {
      name: "Gorra FINO Edition",
      price: "$899",
      image: capFino,
    },
    {
      name: "Gorra MTLT 27",
      price: "$949",
      image: capMtlt27,
    },
    {
      name: "Gorra Three Stars",
      price: "$999",
      image: capThreeStars,
    },
    {
      name: "Gorra Graffiti Style",
      price: "$1099",
      image: capGraffiti,
    },
  ];

  return (
    <section id="productos" className="py-16 md:py-24">
      <div className="container px-4 md:px-8">
        <div className="mb-12 text-center">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4 cursor-pointer md:cursor-default"
            onClick={() => handleTextClick('products-title')}
            style={{
              WebkitTextStroke: activeText === 'products-title' ? '2px white' : 'none',
            }}
          >
            Productos Destacados
          </h2>
          <p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto cursor-pointer md:cursor-default"
            onClick={() => handleTextClick('products-desc')}
            style={{
              WebkitTextStroke: activeText === 'products-desc' ? '1.5px white' : 'none',
            }}
          >
            Cada gorra está diseñada con atención al detalle y fabricada con los mejores materiales para garantizar durabilidad y comodidad.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
