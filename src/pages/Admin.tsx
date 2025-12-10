import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, ShoppingBag, Clock, Tag, BarChart3, Store, Package, Menu, Settings, Briefcase, Pin } from 'lucide-react';
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

const Admin = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'pending-payments' | 'discounts' | 'analytics' | 'brands' | 'estuches' | 'pines' | 'menu' | 'products' | 'settings'>('orders');

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth !== 'true') {
      toast.error('Acceso denegado');
      navigate('/auth');
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header mejorado */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Settings className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Panel de Administración</h1>
              <p className="text-xs text-muted-foreground">Gestiona tu tienda</p>
            </div>
          </div>
          <div className="flex gap-3">
            {activeTab === 'products' && !showForm && (
              <Button onClick={() => setShowForm(true)} className="gap-2 shadow-md hover:shadow-lg transition-shadow">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Agregar Producto</span>
              </Button>
            )}
            <Button onClick={handleLogout} variant="outline" className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Mensaje de bienvenida mejorado */}
        <section className="mb-6">
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r from-primary/10 via-card to-primary/5 p-6 shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                  ¡Bienvenido, Administrador!
                </h2>
                <p className="text-muted-foreground mt-1">Aquí puedes gestionar todos los aspectos de tu tienda</p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-background/50 px-4 py-2 rounded-full border border-border/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Sistema activo
              </div>
            </div>
          </div>
        </section>

        {/* Tabs de navegación mejorados */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 p-1.5 bg-muted/50 rounded-xl border border-border/50">
            <Button 
              variant={activeTab === 'orders' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('orders')}
              className={`gap-2 rounded-lg transition-all ${activeTab === 'orders' ? 'shadow-md' : 'hover:bg-background/80'}`}
              size="sm"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </Button>
            <Button 
              variant={activeTab === 'pending-payments' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('pending-payments')}
              className={`gap-2 rounded-lg transition-all ${activeTab === 'pending-payments' ? 'shadow-md' : 'hover:bg-background/80'}`}
              size="sm"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Pagos Pendientes</span>
            </Button>
            <Button 
              variant={activeTab === 'discounts' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('discounts')}
              className={`gap-2 rounded-lg transition-all ${activeTab === 'discounts' ? 'shadow-md' : 'hover:bg-background/80'}`}
              size="sm"
            >
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Cupones</span>
            </Button>
            <Button 
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('analytics')}
              className={`gap-2 rounded-lg transition-all ${activeTab === 'analytics' ? 'shadow-md' : 'hover:bg-background/80'}`}
              size="sm"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>
            <Button 
              variant={activeTab === 'brands' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('brands')}
              className={`gap-2 rounded-lg transition-all ${activeTab === 'brands' ? 'shadow-md' : 'hover:bg-background/80'}`}
              size="sm"
            >
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Marcas</span>
            </Button>
            <Button 
              variant={activeTab === 'estuches' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('estuches')}
              className={`gap-2 rounded-lg transition-all ${activeTab === 'estuches' ? 'shadow-md' : 'hover:bg-background/80'}`}
              size="sm"
            >
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Estuches</span>
            </Button>
            <Button 
              variant={activeTab === 'pines' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('pines')}
              className={`gap-2 rounded-lg transition-all ${activeTab === 'pines' ? 'shadow-md' : 'hover:bg-background/80'}`}
              size="sm"
            >
              <Pin className="h-4 w-4" />
              <span className="hidden sm:inline">Pines</span>
            </Button>
            <Button
              variant={activeTab === 'menu' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('menu')}
              className={`gap-2 rounded-lg transition-all ${activeTab === 'menu' ? 'shadow-md' : 'hover:bg-background/80'}`}
              size="sm"
            >
              <Menu className="h-4 w-4" />
              <span className="hidden sm:inline">Menú</span>
            </Button>
            <Button 
              variant={activeTab === 'products' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('products')}
              className={`gap-2 rounded-lg transition-all ${activeTab === 'products' ? 'shadow-md' : 'hover:bg-background/80'}`}
              size="sm"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Productos</span>
            </Button>
            <Button 
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('settings')}
              className={`gap-2 rounded-lg transition-all ${activeTab === 'settings' ? 'shadow-md' : 'hover:bg-background/80'}`}
              size="sm"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configuración</span>
            </Button>
          </div>
        </div>

        {/* Contenedor del panel activo */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-4 md:p-6 shadow-sm">

          {activeTab === 'orders' && <OrdersPanel />}
          
          {activeTab === 'pending-payments' && <PendingPaymentsReport />}

          {activeTab === 'discounts' && <DiscountCodesPanel />}

          {activeTab === 'analytics' && <SalesAnalyticsPanel />}

          {activeTab === 'brands' && <BrandsManagementPanel />}

          {activeTab === 'estuches' && <EstuchesManagementPanel />}

          {activeTab === 'pines' && <PinesManagementPanel />}

          {activeTab === 'menu' && <MenuCategoriesPanel />}

          {activeTab === 'settings' && <SiteSettingsPanel />}

          {activeTab === 'products' && (
            showForm ? (
              <ProductForm
                product={editingProduct}
                onClose={handleCloseForm}
              />
            ) : (
              <ProductList onEdit={handleEdit} />
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
