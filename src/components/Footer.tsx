import { Link } from "react-router-dom";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { useBrands } from "@/hooks/useBrands";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const TikTokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="h-5 w-5"
  >
    <defs>
      <linearGradient id="tiktokGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#00f2ea', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#ff0050', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#00f2ea', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path
      fill="url(#tiktokGradient)"
      d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
    />
  </svg>
);

const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const Footer = () => {
  const { brands } = useBrands();
  const { settings } = useSiteSettings();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Columna 1: Sobre Nosotros */}
          <div className="space-y-4 animate-fade-in-up">
            {settings.company_logo ? (
              <img 
                src={settings.company_logo} 
                alt={settings.company_name} 
                className="h-12 w-auto object-contain"
              />
            ) : (
              <h3 className="text-lg font-bold uppercase tracking-wide">{settings.company_name}</h3>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {settings.about_us}
            </p>
            <div className="flex gap-3 pt-2">
              {settings.social_instagram && (
                <a 
                  href={settings.social_instagram}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                  style={{ color: '#E4405F' }}
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings.social_facebook && (
                <a 
                  href={settings.social_facebook}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all duration-300 hover:scale-110"
                  aria-label="Facebook"
                  style={{ color: '#1877F2' }}
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings.social_tiktok && (
                <a 
                  href={settings.social_tiktok}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:scale-110 transition-all duration-300"
                  aria-label="TikTok"
                >
                  <TikTokIcon />
                </a>
              )}
              {settings.contact_whatsapp && (
                <a 
                  href={`https://wa.me/${settings.contact_whatsapp}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all duration-300 hover:scale-110"
                  aria-label="WhatsApp"
                  style={{ color: '#25D366' }}
                >
                  <WhatsAppIcon />
                </a>
              )}
            </div>
          </div>
          
          {/* Columna 2: Marcas - Dinámico desde DB */}
          <div className="space-y-4 animate-fade-in-up animation-delay-100">
            <h4 className="font-bold uppercase tracking-wide text-sm">Nuestras Marcas</h4>
            <ul className="space-y-3 text-sm">
              {brands.slice(0, 6).map((brand) => (
                <li key={brand.id}>
                  <Link 
                    to={brand.path} 
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Ayuda & Soporte - Dinámico desde DB */}
          <div className="space-y-4 animate-fade-in-up animation-delay-200">
            <h4 className="font-bold uppercase tracking-wide text-sm">Ayuda & Soporte</h4>
            <ul className="space-y-3 text-sm">
              {settings.help_links?.map((link, index) => (
                <li key={index}>
                  {link.url.startsWith('/') ? (
                    <Link 
                      to={link.url} 
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a 
                      href={link.url} 
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Contacto - Dinámico desde DB */}
          <div className="space-y-4 animate-fade-in-up animation-delay-300">
            <h4 className="font-bold uppercase tracking-wide text-sm">Contacto</h4>
            <ul className="space-y-3 text-sm">
              {settings.contact_location && (
                <li className="flex items-start gap-3 text-muted-foreground group">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors duration-300" />
                  <span className="group-hover:text-primary transition-colors duration-300">
                    {settings.contact_location}
                  </span>
                </li>
              )}
              {settings.contact_email && (
                <li className="flex items-start gap-3 text-muted-foreground group">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors duration-300" />
                  <a href={`mailto:${settings.contact_email}`} className="group-hover:text-primary transition-colors duration-300">
                    {settings.contact_email}
                  </a>
                </li>
              )}
              {settings.contact_phone && (
                <li className="flex items-start gap-3 text-muted-foreground group">
                  <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors duration-300" />
                  <a href={`https://wa.me/${settings.contact_whatsapp}`} className="group-hover:text-primary transition-colors duration-300">
                    {settings.contact_phone}
                  </a>
                </li>
              )}
              {settings.contact_phone_2 && (
                <li className="flex items-start gap-3 text-muted-foreground group">
                  <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors duration-300" />
                  <a href={`tel:${settings.contact_phone_2.replace(/\s/g, '')}`} className="group-hover:text-primary transition-colors duration-300">
                    {settings.contact_phone_2}
                  </a>
                </li>
              )}
            </ul>
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">Horario de Atención:</p>
              {settings.hours_weekdays && <p className="text-sm font-medium">{settings.hours_weekdays}</p>}
              {settings.hours_saturday && <p className="text-sm font-medium">{settings.hours_saturday}</p>}
            </div>
          </div>
        </div>
        
        {/* Línea divisoria */}
        <div className="border-t border-border my-8" />
        
        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="animate-fade-in-up">
            &copy; {new Date().getFullYear()} {settings.company_name}. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 animate-fade-in-up animation-delay-100">
            <Link to="/legal?tab=terminos" className="hover:text-primary transition-colors duration-300">
              Términos
            </Link>
            <Link to="/legal?tab=privacidad" className="hover:text-primary transition-colors duration-300">
              Privacidad
            </Link>
            <Link to="/legal?tab=cookies" className="hover:text-primary transition-colors duration-300">
              Cookies
            </Link>
            <Link to="/auth" className="hover:text-primary transition-colors duration-300 opacity-50">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
