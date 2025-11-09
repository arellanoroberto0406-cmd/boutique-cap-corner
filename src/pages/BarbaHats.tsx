import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const BarbaHats = () => {
  const [activeText, setActiveText] = useState<string | null>(null);

  const handleTextClick = (id: string) => {
    setActiveText(activeText === id ? null : id);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 
          className={`text-4xl font-bold mb-8 relative inline-block cursor-pointer md:cursor-default ${activeText === 'title' ? 'md:after:hidden after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:animate-[slideIn_0.3s_ease-out] before:content-[""] before:absolute before:top-0 before:left-0 before:w-full before:h-0.5 before:bg-white before:animate-[slideIn_0.3s_ease-out]' : ''}`}
          onClick={() => handleTextClick('title')}
        >
          Barba Hats
        </h1>
        <div className="prose max-w-none">
          <p 
            className={`text-lg text-muted-foreground mb-8 relative inline-block cursor-pointer md:cursor-default ${activeText === 'desc' ? 'md:after:hidden after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:animate-[slideIn_0.3s_ease-out] before:content-[""] before:absolute before:top-0 before:left-0 before:w-full before:h-0.5 before:bg-white before:animate-[slideIn_0.3s_ease-out]' : ''}`}
            onClick={() => handleTextClick('desc')}
          >
            Conoce la marca Barba Hats, gorras con carácter y estilo inconfundible.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="border rounded-lg p-6">
              <h3 
                className={`text-xl font-semibold mb-2 relative inline-block cursor-pointer md:cursor-default ${activeText === 'collection' ? 'md:after:hidden after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:animate-[slideIn_0.3s_ease-out] before:content-[""] before:absolute before:top-0 before:left-0 before:w-full before:h-0.5 before:bg-white before:animate-[slideIn_0.3s_ease-out]' : ''}`}
                onClick={() => handleTextClick('collection')}
              >
                Colección Barba Hats
              </h3>
              <p 
                className={`text-muted-foreground relative inline-block cursor-pointer md:cursor-default ${activeText === 'collectionDesc' ? 'md:after:hidden after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:animate-[slideIn_0.3s_ease-out] before:content-[""] before:absolute before:top-0 before:left-0 before:w-full before:h-0.5 before:bg-white before:animate-[slideIn_0.3s_ease-out]' : ''}`}
                onClick={() => handleTextClick('collectionDesc')}
              >
                Gorras con diseño distintivo y calidad superior
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default BarbaHats;
