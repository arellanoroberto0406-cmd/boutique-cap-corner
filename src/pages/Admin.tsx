import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, ChevronDown, ChevronUp, Trash2, X, ImagePlus } from 'lucide-react';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductList } from '@/components/admin/ProductList';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  getBrands, 
  deleteBrand, 
  deleteProduct, 
  addProduct,
  initializeBrands,
  uploadImage,
  availableCapImages,
  Brand 
} from '@/data/brandsSupabase';

interface NewCapForm {
  name: string;
  price: string;
  salePrice: string;
  freeShipping: boolean;
  shippingCost: string;
  images: string[];
  uploadedFiles: File[];
  uploadedPreviews: string[];
  description: string;
  hasFullSet: boolean;
  onlyCap: boolean;
  onlyCapPrice: string;
  stock: string;
}

const initialCapForm: NewCapForm = {
  name: '',
  price: '',
  salePrice: '',
  freeShipping: false,
  shippingCost: '',
  images: [],
  uploadedFiles: [],
  uploadedPreviews: [],
  description: '',
  hasFullSet: false,
  onlyCap: true,
  onlyCapPrice: '',
  stock: ''
};

const Admin = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedBrands, setExpandedBrands] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'brands' | 'products'>('brands');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [savingCap, setSavingCap] = useState(false);
  
  // Estado para formulario de nueva gorra
  const [showCapForm, setShowCapForm] = useState<string | null>(null);
  const [capForm, setCapForm] = useState<NewCapForm>(initialCapForm);

  const loadBrands = async () => {
    const data = await getBrands();
    setBrands(data);
  };

  useEffect(() => {
    const init = async () => {
      const adminAuth = localStorage.getItem('adminAuth');
      if (adminAuth !== 'true') {
        toast.error('Acceso denegado');
        navigate('/auth');
      } else {
        setIsAuthenticated(true);
        await initializeBrands();
        await loadBrands();
      }
      setLoading(false);
    };
    init();
  }, [navigate]);

  // Escuchar eventos de actualización
  useEffect(() => {
    const handleUpdate = () => {
      loadBrands();
    };
    window.addEventListener('brandsUpdated', handleUpdate);
    return () => window.removeEventListener('brandsUpdated', handleUpdate);
  }, []);

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

  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    if (confirm(`¿Estás seguro de eliminar la marca "${brandName}"? Esto también eliminará todos sus productos.`)) {
      const success = await deleteBrand(brandId);
      if (success) {
        await loadBrands();
        toast.success(`Marca "${brandName}" eliminada`);
      } else {
        toast.error('Error al eliminar la marca');
      }
    }
  };

  const handleDeleteProduct = async (brandId: string, productId: string, productName: string) => {
    if (confirm(`¿Estás seguro de eliminar "${productName}"?`)) {
      const success = await deleteProduct(productId);
      if (success) {
        await loadBrands();
        toast.success(`Producto "${productName}" eliminado`);
      } else {
        toast.error('Error al eliminar el producto');
      }
    }
  };

  const handleAddCap = async (brandId: string) => {
    // Validaciones
    if (!capForm.name.trim() || !capForm.price) {
      toast.error('Por favor completa nombre y precio');
      return;
    }

    const hasImages = capForm.images.length > 0 || capForm.uploadedFiles.length > 0;
    if (!hasImages) {
      toast.error('Por favor selecciona al menos una imagen');
      return;
    }

    const price = parseFloat(capForm.price);
    if (isNaN(price) || price <= 0) {
      toast.error('El precio debe ser un número válido');
      return;
    }

    setSavingCap(true);

    try {
      // Subir imágenes si hay archivos
      let mainImage = '';
      
      if (capForm.uploadedFiles.length > 0) {
        const uploadedUrl = await uploadImage(capForm.uploadedFiles[0]);
        if (uploadedUrl) {
          mainImage = uploadedUrl;
        }
      }
      
      if (!mainImage && capForm.images.length > 0) {
        mainImage = availableCapImages[capForm.images[0]];
      }

      if (!mainImage) {
        toast.error('Error al procesar la imagen');
        setSavingCap(false);
        return;
      }

      const onlyCapPrice = capForm.onlyCapPrice ? parseFloat(capForm.onlyCapPrice) : null;
      const stock = capForm.stock ? parseInt(capForm.stock) : 0;

      const result = await addProduct(brandId, {
        name: capForm.name.trim(),
        price: price,
        image: mainImage,
        full_set_price: capForm.hasFullSet ? price : null,
        only_cap_price: onlyCapPrice,
        description: capForm.description || null,
        stock
      });

      if (result) {
        await loadBrands();
        setShowCapForm(null);
        setCapForm(initialCapForm);
        toast.success('Gorra agregada exitosamente');
      } else {
        toast.error('Error al guardar la gorra');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar la gorra');
    } finally {
      setSavingCap(false);
    }
  };

  const resetCapForm = () => {
    setShowCapForm(null);
    setCapForm(initialCapForm);
  };

  const toggleImageSelection = (imageKey: string) => {
    setCapForm(prev => {
      const totalImages = prev.images.length + prev.uploadedFiles.length;
      if (prev.images.includes(imageKey)) {
        return { ...prev, images: prev.images.filter(img => img !== imageKey) };
      }
      if (totalImages >= 7) {
        toast.error('Máximo 7 fotos permitidas');
        return prev;
      }
      return { ...prev, images: [...prev.images, imageKey] };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const totalImages = capForm.images.length + capForm.uploadedFiles.length;
    const remainingSlots = 7 - totalImages;

    if (remainingSlots <= 0) {
      toast.error('Máximo 7 fotos permitidas');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapForm(prev => {
          if (prev.uploadedFiles.length + prev.images.length >= 7) {
            return prev;
          }
          return {
            ...prev,
            uploadedFiles: [...prev.uploadedFiles, file],
            uploadedPreviews: [...prev.uploadedPreviews, reader.result as string]
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedImage = (index: number) => {
    setCapForm(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
      uploadedPreviews: prev.uploadedPreviews.filter((_, i) => i !== index)
    }));
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
                        <Card className="p-6 mb-4 bg-card">
                          <div className="flex items-center justify-between mb-6">
                            <h5 className="text-xl font-bold text-foreground">Agregar Nueva Gorra</h5>
                            <Button variant="ghost" size="icon" onClick={resetCapForm}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-6">
                            {/* Nombre */}
                            <div>
                              <Label htmlFor="capName" className="text-base font-semibold">NOMBRE DE LA GORRA *</Label>
                              <Input
                                id="capName"
                                value={capForm.name}
                                onChange={(e) => setCapForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Ej: Gorra Premium Edition"
                                className="mt-2"
                              />
                            </div>

                            {/* Precios */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="capPrice" className="text-base font-semibold">PRECIO (MXN) *</Label>
                                <Input
                                  id="capPrice"
                                  type="number"
                                  value={capForm.price}
                                  onChange={(e) => setCapForm(prev => ({ ...prev, price: e.target.value }))}
                                  placeholder="Ej: 899"
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label htmlFor="capSalePrice" className="text-base font-semibold">PRECIO DE OFERTA (MXN)</Label>
                                <Input
                                  id="capSalePrice"
                                  type="number"
                                  value={capForm.salePrice}
                                  onChange={(e) => setCapForm(prev => ({ ...prev, salePrice: e.target.value }))}
                                  placeholder="Ej: 699 (opcional)"
                                  className="mt-2"
                                />
                              </div>
                            </div>

                            {/* Envío */}
                            <div className="space-y-4">
                              <Label className="text-base font-semibold">ENVÍO</Label>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Switch 
                                    checked={capForm.freeShipping} 
                                    onCheckedChange={(checked) => setCapForm(prev => ({ ...prev, freeShipping: checked }))}
                                  />
                                  <Label>Envío Gratis</Label>
                                </div>
                                {!capForm.freeShipping && (
                                  <div className="flex items-center gap-2">
                                    <Label>Costo de envío:</Label>
                                    <Input
                                      type="number"
                                      value={capForm.shippingCost}
                                      onChange={(e) => setCapForm(prev => ({ ...prev, shippingCost: e.target.value }))}
                                      placeholder="$0"
                                      className="w-24"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Fotos */}
                            <div>
                              <Label className="text-base font-semibold">FOTOS (Máximo 7) *</Label>
                              <p className="text-sm text-muted-foreground mb-3">
                                Seleccionadas: {capForm.images.length + capForm.uploadedFiles.length}/7
                              </p>
                              
                              {/* Subir desde galería */}
                              <div className="mb-4">
                                <Label className="text-sm font-medium mb-2 block">Subir desde galería:</Label>
                                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
                                  <div className="flex flex-col items-center">
                                    <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                                    <span className="text-sm text-muted-foreground">Click para subir fotos</span>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                  />
                                </label>
                              </div>

                              {/* Fotos subidas */}
                              {capForm.uploadedPreviews.length > 0 && (
                                <div className="mb-4">
                                  <Label className="text-sm font-medium mb-2 block">Fotos subidas:</Label>
                                  <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
                                    {capForm.uploadedPreviews.map((src, index) => (
                                      <div 
                                        key={index}
                                        className="relative rounded-lg overflow-hidden border-2 border-primary ring-2 ring-primary/50"
                                      >
                                        <img src={src} alt={`Subida ${index + 1}`} className="w-full aspect-square object-cover" />
                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                            {capForm.images.length + index + 1}
                                          </span>
                                        </div>
                                        <Button
                                          variant="destructive"
                                          size="icon"
                                          className="absolute top-1 right-1 h-6 w-6"
                                          onClick={() => removeUploadedImage(index)}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Fotos predefinidas */}
                              <Label className="text-sm font-medium mb-2 block">O selecciona de la galería:</Label>
                              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
                                {Object.entries(availableCapImages).map(([key, src]) => (
                                  <div 
                                    key={key}
                                    onClick={() => toggleImageSelection(key)}
                                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                      capForm.images.includes(key) 
                                        ? 'border-primary ring-2 ring-primary/50' 
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                  >
                                    <img src={src} alt={key} className="w-full aspect-square object-cover" />
                                    {capForm.images.includes(key) && (
                                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                        <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                          {capForm.images.indexOf(key) + 1}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Descripción */}
                            <div>
                              <Label htmlFor="capDescription" className="text-base font-semibold">DESCRIPCIÓN DE LA GORRA</Label>
                              <Textarea
                                id="capDescription"
                                value={capForm.description}
                                onChange={(e) => setCapForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe las características de la gorra..."
                                className="mt-2 min-h-[100px]"
                              />
                            </div>

                            {/* Tipo de producto */}
                            <div>
                              <Label className="text-base font-semibold">TIPO DE PRODUCTO</Label>
                              <div className="flex flex-wrap gap-4 mt-3">
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id="fullSet" 
                                    checked={capForm.hasFullSet}
                                    onCheckedChange={(checked) => setCapForm(prev => ({ ...prev, hasFullSet: checked === true }))}
                                  />
                                  <Label htmlFor="fullSet" className="cursor-pointer">Full Set (Gorra + Accesorios)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id="onlyCap" 
                                    checked={capForm.onlyCap}
                                    onCheckedChange={(checked) => setCapForm(prev => ({ ...prev, onlyCap: checked === true }))}
                                  />
                                  <Label htmlFor="onlyCap" className="cursor-pointer">Solamente Gorra</Label>
                                </div>
                              </div>
                              
                              {/* Precio de Solamente Gorra */}
                              {capForm.onlyCap && (
                                <div className="mt-4">
                                  <Label htmlFor="onlyCapPrice" className="text-base font-semibold">PRECIO SOLAMENTE GORRA (MXN)</Label>
                                  <Input
                                    id="onlyCapPrice"
                                    type="number"
                                    value={capForm.onlyCapPrice}
                                    onChange={(e) => setCapForm(prev => ({ ...prev, onlyCapPrice: e.target.value }))}
                                    placeholder="Ej: 599"
                                    className="mt-2 w-48"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Stock */}
                            <div>
                              <Label htmlFor="capStock" className="text-base font-semibold">INVENTARIO / STOCK</Label>
                              <Input
                                id="capStock"
                                type="number"
                                value={capForm.stock}
                                onChange={(e) => setCapForm(prev => ({ ...prev, stock: e.target.value }))}
                                placeholder="Cantidad disponible"
                                className="mt-2 w-40"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 mt-6 pt-4 border-t border-border">
                            <Button 
                              onClick={() => handleAddCap(brand.id)} 
                              size="lg"
                              disabled={savingCap}
                            >
                              {savingCap ? (
                                <>
                                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                  Guardando...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Agregar Gorra
                                </>
                              )}
                            </Button>
                            <Button variant="outline" onClick={resetCapForm} size="lg" disabled={savingCap}>
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
