import { Shield, Truck, CreditCard, HeadphonesIcon } from "lucide-react";

export const TrustBadges = () => {
  const badges = [
    {
      icon: Truck,
      title: "Envío Gratis",
      description: "En todas tus compras",
    },
    {
      icon: Shield,
      title: "Compra Segura",
      description: "Protección garantizada",
    },
    {
      icon: CreditCard,
      title: "Pago Fácil",
      description: "Múltiples métodos",
    },
    {
      icon: HeadphonesIcon,
      title: "Soporte 24/7",
      description: "Siempre disponibles",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="container px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {badges.map((badge, index) => (
            <div
              key={badge.title}
              className="flex flex-col items-center text-center space-y-3 p-4 rounded-lg hover:bg-secondary/50 transition-all duration-300 animate-fade-in-up group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <badge.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm md:text-base group-hover:text-primary transition-colors duration-300">
                  {badge.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
