import { Home, ShoppingBag, Heart, Phone, Package } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/logo-proveedor.png";

const menuItems = [
  { title: "Inicio", url: "/", icon: Home },
  { title: "Barba Hats", url: "/barba-hats", icon: Package },
  { title: "Boutique Variedad", url: "/boutique-variedad", icon: Package },
  { title: "Despacho Contable", url: "/despacho-contable", icon: Package },
  { title: "Estuche de Gorra", url: "/estuche-de-gorra", icon: Package },
  { title: "Gallo Fino", url: "/gallo-fino", icon: Package },
  { title: "JC Hats", url: "/jc-hats", icon: Package },
  { title: "Pines", url: "/pines", icon: Package },
  { title: "Viyaxi", url: "/viyaxi", icon: Package },
  { title: "Favoritos", url: "/favoritos", icon: Heart },
];

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
    setOpen(false);
  };

  return (
    <Sidebar className={open ? "w-64" : "w-0"} collapsible="offcanvas">
      <SidebarHeader className="border-b p-4">
        <div 
          className="flex items-center justify-center cursor-pointer hover-scale"
          onClick={handleLogoClick}
        >
          <img 
            src={logo} 
            alt="Proveedor Boutique" 
            className="h-20 w-auto logo-glow" 
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
