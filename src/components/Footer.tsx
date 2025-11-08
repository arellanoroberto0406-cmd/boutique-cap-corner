import { Instagram, Facebook } from "lucide-react";

const TikTokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="h-8 w-8 transition-all duration-300 hover:scale-110"
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
    className="h-8 w-8"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">
              Proveedor Boutique <span className="text-primary">AR</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Gorras premium con diseños exclusivos para quienes buscan destacar con estilo auténtico.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#productos" className="hover:text-primary transition-colors">
                  Productos
                </a>
              </li>
              <li>
                <a href="#colecciones" className="hover:text-primary transition-colors">
                  Colecciones
                </a>
              </li>
              <li>
                <a href="#nosotros" className="hover:text-primary transition-colors">
                  Nosotros
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#contacto" className="hover:text-primary transition-colors">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#envios" className="hover:text-primary transition-colors">
                  Envíos
                </a>
              </li>
              <li>
                <a href="#devoluciones" className="hover:text-primary transition-colors">
                  Devoluciones
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg">Síguenos</h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/proveedor_de_gorras_oficial?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
                style={{ color: '#E4405F' }}
              >
                <Instagram className="h-8 w-8" />
              </a>
              <a
                href="https://www.facebook.com/share/15WSXVXivP/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
                style={{ color: '#1877F2' }}
              >
                <Facebook className="h-8 w-8" />
              </a>
              <a
                href="https://www.tiktok.com/@proveedores__09?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
              >
                <TikTokIcon />
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=523251120730&text&type=phone_number&app_absent=0&wame_ctl=1"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
                style={{ color: '#25D366' }}
              >
                <WhatsAppIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2024 Proveedor Boutique AR. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
