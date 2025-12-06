import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductList } from '@/components/admin/ProductList';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  getBrands, 
  deleteBrand, 
  deleteProduct, 
  addProduct,
  availableCapImages,
  Brand 
} from '@/data/brandsStore';

const Admin = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedBrands, setExpandedBrands] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'brands' | 'products'>('brands');
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // Estado para formulario de nueva gorra
  const [showCapForm, setShowCapForm] = useState<string | null>(null);
  const [newCapName, setNewCapName] = useState('');
  const [newCapPrice, setNewCapPrice] = useState('');
  const [newCapImage, setNewCapImage] = useState('');

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth !== 'true') {
      toast.error('Acceso denegado');
      navigate('/auth');
    } else {
      setIsAuthenticated(true);
      setBrands(getBrands());
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

  const handleDeleteBrand = (brandId: string, brandName: string) => {
    if (confirm(`¿Estás seguro de eliminar la marca "${brandName}"? Esto también eliminará todos sus productos.`)) {
      const updated = deleteBrand(brandId);
      setBrands(updated);
      toast.success(`Marca "${brandName}" eliminada`);
    }
  };

  const handleDeleteProduct = (brandId: string, productId: string, productName: string) => {
    if (confirm(`¿Estás seguro de eliminar "${productName}"?`)) {
      const updated = deleteProduct(brandId, productId);
      setBrands(updated);
      toast.success(`Producto "${productName}" eliminado`);
    }
  };

  const handleAddCap = (brandId: string) => {
    if (!newCapName.trim() || !newCapPrice || !newCapImage) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const price = parseFloat(newCapPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('El precio debe ser un número válido');
      return;
    }

    const updated = addProduct(brandId, {
      name: newCapName.trim(),
      price: price,
      image: availableCapImages[newCapImage]
    });

    setBrands(updated);
    setShowCapForm(null);
    setNewCapName('');
    setNewCapPrice('');
    setNewCapImage('');
    toast.success('Gorra agregada exitosamente');
  };

  const resetCapForm = () => {
    setShowCapForm(null);
    setNewCapName('');
    setNewCapPrice('');
    setNewCapImage('');
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
            
            {brands.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No hay marcas disponibles</p>
            ) : (
              brands.map((brand) => (
                <Card key={brand.id} className="overflow-hidden">
                  {/* Header de la marca */}
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div 
                      className="flex items-center gap-4 cursor-pointer flex-1"
                      onClick={() => toggleBrand(brand.id)}
                    >
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
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBrand(brand.id, brand.name);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar Marca
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleBrand(brand.id)}
                      >
                        {expandedBrands.includes(brand.id) ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Productos de la marca */}
                  {expandedBrands.includes(brand.id) && (
                    <div className="border-t border-border p-4 bg-muted/30">
                      {/* Botón para agregar nueva gorra */}
                      {showCapForm !== brand.id ? (
                        <Button 
                          onClick={() => setShowCapForm(brand.id)}
                          className="mb-4 gap-2"
                          variant="outline"
                        >
                          <Plus className="h-4 w-4" />
                          Agregar Nueva Gorra
                        </Button>
                      ) : (
                        /* Formulario para agregar gorra */
                        <Card className="p-4 mb-4 bg-card">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-bold text-foreground">Agregar Nueva Gorra</h5>
                            <Button variant="ghost" size="icon" onClick={resetCapForm}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="capName">Nombre de la gorra</Label>
                              <Input
                                id="capName"
                                value={newCapName}
                                onChange={(e) => setNewCapName(e.target.value)}
                                placeholder="Ej: Gorra Premium"
                              />
                            </div>
                            <div>
                              <Label htmlFor="capPrice">Precio (MXN)</Label>
                              <Input
                                id="capPrice"
                                type="number"
                                value={newCapPrice}
                                onChange={(e) => setNewCapPrice(e.target.value)}
                                placeholder="Ej: 899"
                              />
                            </div>
                            <div>
                              <Label htmlFor="capImage">Imagen</Label>
                              <Select value={newCapImage} onValueChange={setNewCapImage}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona una imagen" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cap-diamond-m">Diamond M</SelectItem>
                                  <SelectItem value="cap-fino">Fino</SelectItem>
                                  <SelectItem value="cap-mtlt-27">MTLT 27</SelectItem>
                                  <SelectItem value="cap-three-stars">Three Stars</SelectItem>
                                  <SelectItem value="cap-graffiti">Graffiti</SelectItem>
                                  <SelectItem value="cap-black">Black</SelectItem>
                                  <SelectItem value="cap-navy">Navy</SelectItem>
                                  <SelectItem value="cap-red">Red</SelectItem>
                                  <SelectItem value="cap-white">White</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button onClick={() => handleAddCap(brand.id)}>
                              Agregar Gorra
                            </Button>
                            <Button variant="outline" onClick={resetCapForm}>
                              Cancelar
                            </Button>
                          </div>
                        </Card>
                      )}

                      {/* Grid de productos */}
                      {brand.products.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No hay productos en esta marca</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {brand.products.map((product) => (
                            <div 
                              key={product.id} 
                              className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow relative group"
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
                              {/* Botón eliminar */}
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteProduct(brand.id, product.id, product.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))
            )}
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
