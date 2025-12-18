import { Shield, Truck, CreditCard, HeadphonesIcon, Star } from "lucide-react";

export const TrustBadges = () => {
  const badges = [
    {
      icon: Truck,
      title: "Envío Express",
      description: "En toda la República",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: Shield,
      title: "Compra Segura",
      description: "100% protegido",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: CreditCard,
      title: "Pago Flexible",
      description: "Múltiples métodos",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: HeadphonesIcon,
      title: "Soporte 24/7",
      description: "Siempre disponibles",
      gradient: "from-primary to-orange-600",
    },
  ];

  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="absolute inset-0 pattern-grid opacity-[0.02]" />
      
      <div className="container px-6 md:px-8 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {badges.map((badge, index) => (
            <div
              key={badge.title}
              className="group relative p-6 md:p-8 rounded-2xl glass-card hover:border-primary/30 transition-all duration-500 hover-lift animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
            >
              {/* Icon container */}
              <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto rounded-2xl bg-gradient-to-br ${badge.gradient} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}>
                <badge.icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              
              {/* Content */}
              <div className="text-center">
                <h3 className="font-heading text-base md:text-lg font-semibold tracking-wide group-hover:text-primary transition-colors duration-300">
                  {badge.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {badge.description}
                </p>
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
