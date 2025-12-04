import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductList } from '@/components/admin/ProductList';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

// Importar imágenes de marcas
import brandBassPro from '@/assets/brand-bass-pro-new.png';
import brandJC from '@/assets/brand-jc-new.png';
import brandRanchCorral from '@/assets/brand-ranch-corral-new.png';
import brandBarba from '@/assets/brand-barba-new.png';
import brandFino from '@/assets/brand-fino-new.png';
import brand31 from '@/assets/brand-31-new.png';
import brandDandy from '@/assets/brand-dandy.png';

// Importar imágenes de gorras
import capDiamondM from '@/assets/cap-diamond-m.jpg';
import capFino from '@/assets/cap-fino.jpg';
import capMtlt27 from '@/assets/cap-mtlt-27.jpg';
import capThreeStars from '@/assets/cap-three-stars.jpg';
import capGraffiti from '@/assets/cap-graffiti.jpg';
import capBlack from '@/assets/cap-black.jpg';
import capNavy from '@/assets/cap-navy.jpg';
import capRed from '@/assets/cap-red.jpg';
import capWhite from '@/assets/cap-white.jpg';

// Datos de marcas con sus productos
const brands = [
  {
    id: 'bass-pro',
    name: 'Bass Pro Shops',
    logo: brandBassPro,
    path: '/bass-pro-shops',
    products: [
      { id: 'bp1', name: 'Gorra Bass Pro Classic', image: capNavy, price: 899 },
      { id: 'bp2', name: 'Gorra Bass Pro Camo', image: capBlack, price: 799 },
      { id: 'bp3', name: 'Gorra Bass Pro Sport', image: capRed, price: 749 },
    ]
  },
  {
    id: 'jc-hats',
    name: 'JC Hats',
    logo: brandJC,
    path: '/jc-hats',
    products: [
      { id: 'jc1', name: 'JC Premium Edition', image: capDiamondM, price: 999 },
      { id: 'jc2', name: 'JC Classic Black', image: capBlack, price: 849 },
      { id: 'jc3', name: 'JC Urban Style', image: capGraffiti, price: 899 },
    ]
  },
  {
    id: 'ranch-corral',
    name: 'Ranch Corral',
    logo: brandRanchCorral,
    path: '/ranch-corral',
    products: [
      { id: 'rc1', name: 'Ranch Corral Vaquero', image: capThreeStars, price: 1099 },
      { id: 'rc2', name: 'Ranch Corral Classic', image: capNavy, price: 949 },
      { id: 'rc3', name: 'Ranch Corral Premium', image: capWhite, price: 1199 },
    ]
  },
  {
    id: 'barba-hats',
    name: 'Barba Hats',
    logo: brandBarba,
    path: '/barba-hats',
    products: [
      { id: 'bh1', name: 'Barba Premium', image: capDiamondM, price: 899 },
      { id: 'bh2', name: 'Barba Classic', image: capBlack, price: 749 },
      { id: 'bh3', name: 'Barba Sport', image: capRed, price: 699 },
    ]
  },
  {
    id: 'gallo-fino',
    name: 'Gallo Fino',
    logo: brandFino,
    path: '/gallo-fino',
    products: [
      { id: 'gf1', name: 'Gallo Fino Edition', image: capFino, price: 899 },
      { id: 'gf2', name: 'Gallo Fino Black', image: capBlack, price: 849 },
      { id: 'gf3', name: 'Gallo Fino Premium', image: capMtlt27, price: 999 },
    ]
  },
  {
    id: 'marca-31',
    name: 'Marca 31',
    logo: brand31,
    path: '/marca-31',
    products: [
      { id: 'm31-1', name: 'Marca 31 Original', image: capThreeStars, price: 799 },
      { id: 'm31-2', name: 'Marca 31 Premium', image: capDiamondM, price: 899 },
      { id: 'm31-3', name: 'Marca 31 Sport', image: capRed, price: 749 },
    ]
  },
  {
    id: 'dandy-hats',
    name: 'Dandy Hats',
    logo: brandDandy,
    path: '/dandy-hats',
    products: [
      { id: 'dh1', name: 'Dandy Classic', image: capNavy, price: 849 },
      { id: 'dh2', name: 'Dandy Premium', image: capWhite, price: 949 },
      { id: 'dh3', name: 'Dandy Urban', image: capGraffiti, price: 799 },
    ]
  },
];

const Admin = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedBrands, setExpandedBrands] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'brands' | 'products'>('brands');

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

  const toggleBrand = (brandId: string) => {
    setExpandedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
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
        <div className="flex gap-4 mb-6">
          <Button 
            variant={activeTab === 'brands' ? 'default' : 'outline'}
            onClick={() => setActiveTab('brands')}
          >
            Marcas
          </Button>
          <Button 
            variant={activeTab === 'products' ? 'default' : 'outline'}
            onClick={() => setActiveTab('products')}
          >
            Todos los Productos
          </Button>
        </div>

        {activeTab === 'brands' ? (
          /* Sección de Marcas */
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Marcas de la Tienda</h3>
            
            {brands.map((brand) => (
              <Card key={brand.id} className="overflow-hidden">
                {/* Header de la marca */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleBrand(brand.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-black rounded-lg flex items-center justify-center p-2">
                      <img 
                        src={brand.logo} 
                        alt={brand.name} 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground">{brand.name}</h4>
                      <p className="text-sm text-muted-foreground">{brand.products.length} productos</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    {expandedBrands.includes(brand.id) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {/* Productos de la marca */}
                {expandedBrands.includes(brand.id) && (
                  <div className="border-t border-border p-4 bg-muted/30">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {brand.products.map((product) => (
                        <div 
                          key={product.id} 
                          className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow"
                        >
                          <div className="aspect-square bg-muted">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <h5 className="font-medium text-sm text-foreground truncate">{product.name}</h5>
                            <p className="text-primary font-bold">${product.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          /* Sección de Productos */
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
