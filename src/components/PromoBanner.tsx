export const PromoBanner = () => {
  return (
    <div className="bg-red-600 py-3 overflow-hidden" style={{ perspective: "1000px" }}>
      <div className="flex justify-center items-center">
        <p className="text-sm md:text-base font-bold uppercase tracking-wide px-8 text-white [text-shadow:0_0_10px_rgba(255,255,255,0.8),0_0_20px_rgba(255,255,255,0.5)] scale-105 animate-[rotateText_15s_linear_infinite]" style={{ transformStyle: "preserve-3d" }}>
          ÚNETE A NUESTRO GRUPOS DE WHATSAPP Y INSTAGRAM PARA ESTAR AL TANTO DE NUESTRAS PROMOCIONES
        </p>
      </div>
    </div>
  );
};
