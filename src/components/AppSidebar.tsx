import { Home, ShoppingBag, Heart, Phone, Package } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

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
  const { open } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar className={open ? "w-64" : "w-0"} collapsible="offcanvas">
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
