import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown, ChevronUp, X, ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getBrands, 
  saveBrands,
  deleteBrand, 
  deleteProduct, 
  addProduct,
  availableCapImages,
  Brand,
} from '@/data/brandsStore';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

interface NewBrandForm {
  name: string;
  logo: File | null;
  logoPreview: string;
}

interface NewCapForm {
  name: string;
  price: string;
  salePrice: string;
  freeShipping: boolean;
  shippingCost: string;
  images: string[];
  uploadedImages: string[];
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
  uploadedImages: [],
  description: '',
  hasFullSet: false,
  onlyCap: true,
  onlyCapPrice: '',
  stock: ''
};

const BrandsManagementPanel = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [expandedBrands, setExpandedBrands] = useState<string[]>([]);
  const [showNewBrandForm, setShowNewBrandForm] = useState(false);
  const [showCapForm, setShowCapForm] = useState<string | null>(null);
  const [capForm, setCapForm] = useState<NewCapForm>(initialCapForm);
  const [newBrandForm, setNewBrandForm] = useState<NewBrandForm>({
    name: '',
    logo: null,
    logoPreview: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setBrands(getBrands());
  }, []);

  const toggleBrand = (brandId: string) => {
    setExpandedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBrandForm(prev => ({
          ...prev,
          logo: file,
          logoPreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrandForm.name.trim()) {
      toast.error('El nombre de la marca es requerido');
      return;
    }

    if (!newBrandForm.logoPreview) {
      toast.error('El logo de la marca es requerido');
      return;
    }

    setIsUploading(true);

    try {
      // Usar el base64 directamente para el logo (guardado en localStorage)
      const logoUrl = newBrandForm.logoPreview;

      // Crear el path de la marca (slug)
      const brandPath = `/${newBrandForm.name.trim().toLowerCase().replace(/\s+/g, '-')}`;
      const brandId = newBrandForm.name.trim().toLowerCase().replace(/\s+/g, '-');

      // Verificar que no exista una marca con el mismo ID
      const existingBrand = brands.find(b => b.id === brandId);
      if (existingBrand) {
        toast.error('Ya existe una marca con ese nombre');
        setIsUploading(false);
        return;
      }

      // Agregar a las marcas existentes
      const newBrand: Brand = {
        id: brandId,
        name: newBrandForm.name.trim(),
        logo: logoUrl,
        path: brandPath,
        products: []
      };

      const updatedBrands = [...brands, newBrand];
      saveBrands(updatedBrands);
      setBrands(updatedBrands);

      // Disparar evento para actualizar otras vistas
      window.dispatchEvent(new CustomEvent('brandsUpdated'));

      toast.success(`Marca "${newBrandForm.name}" creada exitosamente`);
      
      // Resetear formulario
      setNewBrandForm({ name: '', logo: null, logoPreview: '' });
      setShowNewBrandForm(false);

    } catch (error: any) {
      console.error('Error al crear marca:', error);
      toast.error('Error al crear la marca: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBrand = (brandId: string, brandName: string) => {
    if (confirm(`¿Estás seguro de eliminar la marca "${brandName}"? Esto también eliminará todos sus productos.`)) {
      const updated = deleteBrand(brandId);
      setBrands(updated);
      window.dispatchEvent(new CustomEvent('brandsUpdated'));
      toast.success(`Marca "${brandName}" eliminada`);
    }
  };

  const handleDeleteProduct = (brandId: string, productId: string, productName: string) => {
    if (confirm(`¿Estás seguro de eliminar "${productName}"?`)) {
      const updated = deleteProduct(brandId, productId);
      setBrands(updated);
      window.dispatchEvent(new CustomEvent('brandsUpdated'));
      toast.success(`Producto "${productName}" eliminado`);
    }
  };

  const handleAddCap = (brandId: string) => {
    const allImages = [...capForm.images.map(img => availableCapImages[img]), ...capForm.uploadedImages];
    
    if (!capForm.name.trim() || !capForm.price || allImages.length === 0) {
      toast.error('Por favor completa nombre, precio y al menos una imagen');
      return;
    }

    const price = parseFloat(capForm.price);
    if (isNaN(price) || price <= 0) {
      toast.error('El precio debe ser un número válido');
      return;
    }

    const salePrice = capForm.salePrice ? parseFloat(capForm.salePrice) : undefined;
    const onlyCapPrice = capForm.onlyCapPrice ? parseFloat(capForm.onlyCapPrice) : undefined;
    const stock = capForm.stock ? parseInt(capForm.stock) : 0;

    const updated = addProduct(brandId, {
      name: capForm.name.trim(),
      price: price,
      image: allImages[0],
      salePrice,
      freeShipping: capForm.freeShipping,
      shippingCost: capForm.freeShipping ? 0 : parseFloat(capForm.shippingCost) || 0,
      images: allImages,
      description: capForm.description,
      hasFullSet: capForm.hasFullSet,
      onlyCap: capForm.onlyCap,
      onlyCapPrice,
      stock
    });

    setBrands(updated);
    setShowCapForm(null);
    setCapForm(initialCapForm);
    window.dispatchEvent(new CustomEvent('brandsUpdated'));
    toast.success('Gorra agregada exitosamente');
  };

  const resetCapForm = () => {
    setShowCapForm(null);
    setCapForm(initialCapForm);
  };

  const toggleImageSelection = (imageKey: string) => {
    setCapForm(prev => {
      const totalImages = prev.images.length + prev.uploadedImages.length;
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

    const totalImages = capForm.images.length + capForm.uploadedImages.length;
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
          if (prev.uploadedImages.length + prev.images.length >= 7) {
            return prev;
          }
          return {
            ...prev,
            uploadedImages: [...prev.uploadedImages, reader.result as string]
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedImage = (index: number) => {
    setCapForm(prev => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">Gestión de Marcas</h3>
        <Button onClick={() => setShowNewBrandForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Marca
        </Button>
      </div>

      {/* Formulario para nueva marca */}
      {showNewBrandForm && (
        <Card className="p-6 bg-card border-primary/20">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-foreground">Crear Nueva Marca</h4>
            <Button variant="ghost" size="icon" onClick={() => setShowNewBrandForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Nombre de la marca */}
            <div>
              <Label htmlFor="brandName" className="text-base font-semibold">NOMBRE DE LA MARCA *</Label>
              <Input
                id="brandName"
                value={newBrandForm.name}
                onChange={(e) => setNewBrandForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Mi Nueva Marca"
                className="mt-2"
              />
            </div>

            {/* Logo de la marca */}
            <div>
              <Label className="text-base font-semibold">LOGO DE LA MARCA *</Label>
              <div className="mt-2">
                {newBrandForm.logoPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 bg-black rounded-lg flex items-center justify-center p-2 overflow-hidden">
                      <img 
                        src={newBrandForm.logoPreview} 
                        alt="Preview logo" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setNewBrandForm(prev => ({ ...prev, logo: null, logoPreview: '' }))}
                    >
                      Cambiar Logo
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
                    <div className="flex flex-col items-center">
                      <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Click para subir logo</span>
                      <span className="text-xs text-muted-foreground mt-1">PNG, JPG o WEBP</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <Button onClick={handleCreateBrand} disabled={isUploading} size="lg">
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Marca
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowNewBrandForm(false)} size="lg">
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de marcas */}
      {brands.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No hay marcas disponibles. Crea una nueva marca para comenzar.</p>
      ) : (
        brands.map((brand) => (
          <Card key={brand.id} className="overflow-hidden">
            {/* Header de la marca */}
            <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div 
                className="flex items-center gap-4 cursor-pointer flex-1"
                onClick={() => toggleBrand(brand.id)}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="w-full h-full object-cover"
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
                  Eliminar
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
                          Seleccionadas: {capForm.images.length + capForm.uploadedImages.length}/7
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
                        {capForm.uploadedImages.length > 0 && (
                          <div className="mb-4">
                            <Label className="text-sm font-medium mb-2 block">Fotos subidas:</Label>
                            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
                              {capForm.uploadedImages.map((src, index) => (
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
                      <Button onClick={() => handleAddCap(brand.id)} size="lg">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Gorra
                      </Button>
                      <Button variant="outline" onClick={resetCapForm} size="lg">
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
  );
};

export default BrandsManagementPanel;
