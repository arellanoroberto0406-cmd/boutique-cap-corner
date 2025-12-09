import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, ShoppingBag, Clock, Tag, BarChart3, Store, Package } from 'lucide-react';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductList } from '@/components/admin/ProductList';
import { toast } from 'sonner';
import { OrdersPanel } from '@/components/admin/OrdersPanel';
import { PendingPaymentsReport } from '@/components/admin/PendingPaymentsReport';
import { DiscountCodesPanel } from '@/components/admin/DiscountCodesPanel';
import { SalesAnalyticsPanel } from '@/components/admin/SalesAnalyticsPanel';
import BrandsManagementPanel from '@/components/admin/BrandsManagementPanel';

const Admin = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'pending-payments' | 'discounts' | 'analytics' | 'brands' | 'products'>('orders');

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
          <div className="flex gap-2">
            {activeTab === 'products' && !showForm && (
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Agregar Producto
              </Button>
            )}
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Mensaje de bienvenida */}
        <section className="mb-8">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-3xl font-extrabold tracking-tight text-center text-foreground">
              BIENVENIDO ADMINISTRADOR
            </h2>
          </div>
        </section>

        {/* Tabs de navegación */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant={activeTab === 'orders' ? 'default' : 'outline'}
            onClick={() => setActiveTab('orders')}
            className="gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Pedidos
          </Button>
          <Button 
            variant={activeTab === 'pending-payments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pending-payments')}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            Pagos Pendientes
          </Button>
          <Button 
            variant={activeTab === 'discounts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('discounts')}
            className="gap-2"
          >
            <Tag className="h-4 w-4" />
            Cupones
          </Button>
          <Button 
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analytics')}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button 
            variant={activeTab === 'brands' ? 'default' : 'outline'}
            onClick={() => setActiveTab('brands')}
            className="gap-2"
          >
            <Store className="h-4 w-4" />
            Marcas
          </Button>
          <Button 
            variant={activeTab === 'products' ? 'default' : 'outline'}
            onClick={() => setActiveTab('products')}
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            Todos los Productos
          </Button>
        </div>

        {activeTab === 'orders' && <OrdersPanel />}
        
        {activeTab === 'pending-payments' && <PendingPaymentsReport />}

        {activeTab === 'discounts' && <DiscountCodesPanel />}

        {activeTab === 'analytics' && <SalesAnalyticsPanel />}

        {activeTab === 'brands' && <BrandsManagementPanel />}

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
      </main>
    </div>
  );
};

export default Admin;
