import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, ShoppingBag, Clock, Tag, BarChart3, Store, Package, Menu, Settings, Briefcase, Pin, Sparkles, Users, ChevronLeft, ChevronRight, LayoutDashboard, Loader2 } from 'lucide-react';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductList } from '@/components/admin/ProductList';
import { toast } from 'sonner';
import { OrdersPanel } from '@/components/admin/OrdersPanel';
import { PendingPaymentsReport } from '@/components/admin/PendingPaymentsReport';
import { DiscountCodesPanel } from '@/components/admin/DiscountCodesPanel';
import { SalesAnalyticsPanel } from '@/components/admin/SalesAnalyticsPanel';
import BrandsManagementPanel from '@/components/admin/BrandsManagementPanel';
import MenuCategoriesPanel from '@/components/admin/MenuCategoriesPanel';
import SiteSettingsPanel from '@/components/admin/SiteSettingsPanel';
import EstuchesManagementPanel from '@/components/admin/EstuchesManagementPanel';
import PinesManagementPanel from '@/components/admin/PinesManagementPanel';
import SponsorsManagementPanel from '@/components/admin/SponsorsManagementPanel';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';

type TabKey = 'orders' | 'pending-payments' | 'discounts' | 'analytics' | 'brands' | 'estuches' | 'pines' | 'menu' | 'products' | 'settings' | 'lo-nuevo' | 'patrocinadores';

interface NavItem {
  key: TabKey;
  label: string;
  icon: React.ElementType;
  group: string;
}

const navItems: NavItem[] = [
  { key: 'orders', label: 'Pedidos', icon: ShoppingBag, group: 'Ventas' },
  { key: 'pending-payments', label: 'Pagos Pendientes', icon: Clock, group: 'Ventas' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, group: 'Ventas' },
  { key: 'discounts', label: 'Descuentos', icon: Tag, group: 'Ventas' },
  { key: 'brands', label: 'Marcas', icon: Store, group: 'Catálogo' },
  { key: 'products', label: 'Productos', icon: Package, group: 'Catálogo' },
  { key: 'estuches', label: 'Estuches', icon: Briefcase, group: 'Catálogo' },
  { key: 'pines', label: 'Pines', icon: Pin, group: 'Catálogo' },
  { key: 'lo-nuevo', label: 'Lo Nuevo', icon: Sparkles, group: 'Catálogo' },
  { key: 'patrocinadores', label: 'Patrocinadores', icon: Users, group: 'Sitio' },
  { key: 'menu', label: 'Menú', icon: Menu, group: 'Sitio' },
  { key: 'settings', label: 'Configuración', icon: Settings, group: 'Sitio' },
];

const groups = ['Ventas', 'Catálogo', 'Sitio'];

const tabTitles: Record<TabKey, string> = {
  orders: 'Gestión de Pedidos',
  'pending-payments': 'Pagos Pendientes',
  discounts: 'Códigos de Descuento',
  analytics: 'Analíticas de Ventas',
  brands: 'Gestión de Marcas',
  products: 'Gestión de Productos',
  estuches: 'Gestión de Estuches',
  pines: 'Gestión de Pines',
  'lo-nuevo': 'Lo Nuevo',
  patrocinadores: 'Patrocinadores',
  menu: 'Menú de Categorías',
  settings: 'Configuración del Sitio',
};

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading, user } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('orders');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect if not admin after loading
  if (!loading && (!user || !isAdmin)) {
    toast.error('Acceso denegado');
    navigate('/auth');
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeItem = navItems.find(i => i.key === activeTab);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-background flex">
        {/* ===== SIDEBAR ===== */}
        <aside className={cn(
          "hidden md:flex flex-col border-r border-border/50 bg-card/60 backdrop-blur-xl transition-all duration-300 sticky top-0 h-screen z-20",
          sidebarCollapsed ? "w-[68px]" : "w-[240px]"
        )}>
          {/* Sidebar Header */}
          <div className={cn(
            "flex items-center gap-3 p-4 border-b border-border/50",
            sidebarCollapsed ? "justify-center" : ""
          )}>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
              <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-sm font-bold text-foreground truncate">Admin Panel</h1>
                <p className="text-[10px] text-muted-foreground truncate">Proveedor Boutique</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-2">
            <nav className="space-y-1 px-2">
              {groups.map((group) => (
                <div key={group} className="mb-3">
                  {!sidebarCollapsed && (
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-1.5">
                      {group}
                    </p>
                  )}
                  {sidebarCollapsed && <Separator className="my-2 mx-auto w-8" />}
                  {navItems
                    .filter(item => item.group === group)
                    .map((item) => {
                      const isActive = activeTab === item.key;
                      const Icon = item.icon;
                      
                      const button = (
                        <button
                          key={item.key}
                          onClick={() => handleTabChange(item.key)}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
                            sidebarCollapsed ? "justify-center p-2.5" : "px-3 py-2",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          <Icon className={cn("h-4 w-4 flex-shrink-0", isActive && "drop-shadow-sm")} />
                          {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                        </button>
                      );

                      if (sidebarCollapsed) {
                        return (
                          <Tooltip key={item.key}>
                            <TooltipTrigger asChild>{button}</TooltipTrigger>
                            <TooltipContent side="right" className="font-medium">
                              {item.label}
                            </TooltipContent>
                          </Tooltip>
                        );
                      }

                      return button;
                    })}
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="border-t border-border/50 p-2 space-y-1">
            {sidebarCollapsed ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center p-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Cerrar Sesión</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSidebarCollapsed(false)}
                      className="w-full flex items-center justify-center p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Expandir</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Colapsar</span>
                </button>
              </>
            )}
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          {/* Top Bar */}
          <header className="sticky top-0 z-10 border-b border-border/50 bg-card/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 md:px-6 h-14">
              <div className="flex items-center gap-3">
                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"
                >
                  <Menu className="h-5 w-5" />
                </button>
                
                <div className="flex items-center gap-2">
                  {activeItem && <activeItem.icon className="h-5 w-5 text-primary" />}
                  <h2 className="text-lg font-bold text-foreground">{tabTitles[activeTab]}</h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeTab === 'products' && !showForm && (
                  <Button onClick={() => setShowForm(true)} size="sm" className="gap-2 shadow-md">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Nuevo Producto</span>
                  </Button>
                )}
                <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Activo
                </div>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <>
              <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
              <div className="fixed top-0 left-0 bottom-0 w-[260px] bg-card border-r border-border z-40 md:hidden animate-fade-in-up">
                <div className="flex items-center gap-3 p-4 border-b border-border/50">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                    <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-foreground">Admin Panel</h1>
                    <p className="text-[10px] text-muted-foreground">Proveedor Boutique</p>
                  </div>
                </div>
                <ScrollArea className="flex-1 py-2">
                  <nav className="space-y-1 px-2">
                    {groups.map((group) => (
                      <div key={group} className="mb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-1.5">
                          {group}
                        </p>
                        {navItems
                          .filter(item => item.group === group)
                          .map((item) => {
                            const isActive = activeTab === item.key;
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.key}
                                onClick={() => handleTabChange(item.key)}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                  isActive
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                              >
                                <Icon className="h-4 w-4 flex-shrink-0" />
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                      </div>
                    ))}
                  </nav>
                </ScrollArea>
                <div className="border-t border-border/50 p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Content Area */}
          <main className="flex-1 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {activeTab === 'orders' && <OrdersPanel />}
              {activeTab === 'pending-payments' && <PendingPaymentsReport />}
              {activeTab === 'discounts' && <DiscountCodesPanel />}
              {activeTab === 'analytics' && <SalesAnalyticsPanel />}
              {activeTab === 'brands' && <BrandsManagementPanel />}
              {activeTab === 'estuches' && <EstuchesManagementPanel />}
              {activeTab === 'pines' && <PinesManagementPanel />}
              {activeTab === 'lo-nuevo' && (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Lo Nuevo</h3>
                  <p className="text-muted-foreground">Panel de gestión de productos nuevos próximamente</p>
                </div>
              )}
              {activeTab === 'patrocinadores' && <SponsorsManagementPanel />}
              {activeTab === 'menu' && <MenuCategoriesPanel />}
              {activeTab === 'settings' && <SiteSettingsPanel />}
              {activeTab === 'products' && (
                showForm ? (
                  <ProductForm product={editingProduct} onClose={handleCloseForm} />
                ) : (
                  <ProductList onEdit={handleEdit} />
                )
              )}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Admin;
