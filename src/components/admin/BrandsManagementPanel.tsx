import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown, ChevronUp, X, ImagePlus, Loader2, Upload, Pencil, Link, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useBrands, Brand, BrandProduct } from '@/hooks/useBrands';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

interface NewBrandForm {
  name: string;
  logo: File | null;
  logoPreview: string;
}

interface CapForm {
  name: string;
  price: string;
  salePrice: string;
  freeShipping: boolean;
  shippingCost: string;
  uploadedImages: File[];
  uploadedPreviews: string[];
  existingImages: string[];
  description: string;
  hasFullSet: boolean;
  onlyCap: boolean;
  onlyCapPrice: string;
  stock: string;
}

const initialCapForm: CapForm = {
  name: '',
  price: '',
  salePrice: '',
  freeShipping: false,
  shippingCost: '',
  uploadedImages: [],
  uploadedPreviews: [],
  existingImages: [],
  description: '',
  hasFullSet: false,
  onlyCap: true,
  onlyCapPrice: '',
  stock: ''
};

interface EditBrandForm {
  id: string;
  name: string;
  path: string;
}

const BrandsManagementPanel = () => {
  const { brands, loading, createBrand, deleteBrand, addProduct, updateProduct, deleteProduct, uploadProductImage, updateBrandLogo, updateBrand } = useBrands();
  const [expandedBrands, setExpandedBrands] = useState<string[]>([]);
  const [showNewBrandForm, setShowNewBrandForm] = useState(false);
  const [showCapForm, setShowCapForm] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<{ brandId: string; product: BrandProduct } | null>(null);
  const [capForm, setCapForm] = useState<CapForm>(initialCapForm);
  const [newBrandForm, setNewBrandForm] = useState<NewBrandForm>({
    name: '',
    logo: null,
    logoPreview: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingLogoId, setUploadingLogoId] = useState<string | null>(null);
  const [editingBrand, setEditingBrand] = useState<EditBrandForm | null>(null);
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUpdateLogo = async (brandId: string, file: File) => {
    setUploadingLogoId(brandId);
    try {
      await updateBrandLogo(brandId, file);
      toast.success('Logo actualizado exitosamente');
    } catch (error: any) {
      toast.error('Error al actualizar el logo: ' + error.message);
    } finally {
      setUploadingLogoId(null);
    }
  };

  const handleStartEditBrand = (brand: Brand) => {
    setEditingBrand({
      id: brand.id,
      name: brand.name,
      path: brand.path
    });
  };

  const handleSaveEditBrand = async () => {
    if (!editingBrand) return;
    
    if (!editingBrand.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    
    if (!editingBrand.path.trim()) {
      toast.error('La URL de la página es requerida');
      return;
    }

    setIsSavingBrand(true);
    try {
      await updateBrand(editingBrand.id, {
        name: editingBrand.name,
        path: editingBrand.path
      });
      toast.success('Marca actualizada exitosamente');
      setEditingBrand(null);
    } catch (error: any) {
      toast.error('Error al actualizar: ' + error.message);
    } finally {
      setIsSavingBrand(false);
    }
  };

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

    if (!newBrandForm.logo) {
      toast.error('El logo de la marca es requerido');
      return;
    }

    setIsUploading(true);

    try {
      await createBrand(newBrandForm.name, newBrandForm.logo);
      toast.success(`Marca "${newBrandForm.name}" creada exitosamente`);
      setNewBrandForm({ name: '', logo: null, logoPreview: '' });
      setShowNewBrandForm(false);
    } catch (error: any) {
      console.error('Error al crear marca:', error);
      toast.error('Error al crear la marca: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    if (confirm(`¿Estás seguro de eliminar la marca "${brandName}"? Esto también eliminará todos sus productos.`)) {
      try {
        await deleteBrand(brandId);
        toast.success(`Marca "${brandName}" eliminada`);
      } catch (error: any) {
        toast.error('Error al eliminar la marca: ' + error.message);
      }
    }
  };

  const handleDeleteProduct = async (brandId: string, productId: string, productName: string) => {
    if (confirm(`¿Estás seguro de eliminar "${productName}"?`)) {
      try {
        await deleteProduct(brandId, productId);
        toast.success(`Producto "${productName}" eliminado`);
      } catch (error: any) {
        toast.error('Error al eliminar el producto: ' + error.message);
      }
    }
  };

  const handleStartEditProduct = (brandId: string, product: BrandProduct) => {
    setEditingProduct({ brandId, product });
    setCapForm({
      name: product.name,
      price: product.price.toString(),
      salePrice: product.sale_price?.toString() || '',
      freeShipping: product.free_shipping || false,
      shippingCost: product.shipping_cost?.toString() || '',
      uploadedImages: [],
      uploadedPreviews: [],
      existingImages: product.images || [product.image_url],
      description: product.description || '',
      hasFullSet: product.has_full_set || false,
      onlyCap: product.only_cap !== false,
      onlyCapPrice: product.only_cap_price?.toString() || '',
      stock: product.stock?.toString() || '0'
    });
    setShowCapForm(brandId);
  };

  const handleSaveProduct = async (brandId: string) => {
    const totalImages = capForm.existingImages.length + capForm.uploadedImages.length;
    
    if (!capForm.name.trim() || !capForm.price || totalImages === 0) {
      toast.error('Por favor completa nombre, precio y al menos una imagen');
      return;
    }

    const price = parseFloat(capForm.price);
    if (isNaN(price) || price <= 0) {
      toast.error('El precio debe ser un número válido');
      return;
    }

    setIsUploading(true);

    try {
      // Upload new images
      const newUploadedUrls: string[] = [];
      for (const file of capForm.uploadedImages) {
        const url = await uploadProductImage(file);
        newUploadedUrls.push(url);
      }

      const allImages = [...capForm.existingImages, ...newUploadedUrls];
      const salePrice = capForm.salePrice ? parseFloat(capForm.salePrice) : null;
      const onlyCapPrice = capForm.onlyCapPrice ? parseFloat(capForm.onlyCapPrice) : null;
      const stock = capForm.stock ? parseInt(capForm.stock) : 0;

      if (editingProduct) {
        // Update existing product
        await updateProduct(brandId, editingProduct.product.id, {
          name: capForm.name.trim(),
          price: price,
          image_url: allImages[0],
          sale_price: salePrice || undefined,
          free_shipping: capForm.freeShipping,
          shipping_cost: capForm.freeShipping ? 0 : parseFloat(capForm.shippingCost) || 0,
          images: allImages,
          description: capForm.description,
          has_full_set: capForm.hasFullSet,
          only_cap: capForm.onlyCap,
          only_cap_price: onlyCapPrice || undefined,
          stock
        });
        
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          resetCapForm();
        }, 1500);
        
        toast.success('Gorra actualizada exitosamente');
      } else {
        // Add new product
        await addProduct(brandId, {
          name: capForm.name.trim(),
          price: price,
          image_url: allImages[0],
          sale_price: salePrice || undefined,
          free_shipping: capForm.freeShipping,
          shipping_cost: capForm.freeShipping ? 0 : parseFloat(capForm.shippingCost) || 0,
          images: allImages,
          description: capForm.description,
          has_full_set: capForm.hasFullSet,
          only_cap: capForm.onlyCap,
          only_cap_price: onlyCapPrice || undefined,
          stock
        });
        
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          resetCapForm();
        }, 1500);
        
        toast.success('Gorra agregada exitosamente');
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar la gorra: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetCapForm = () => {
    setShowCapForm(null);
    setEditingProduct(null);
    setCapForm(initialCapForm);
  };

  const removeExistingImage = (index: number) => {
    setCapForm(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const totalImages = capForm.existingImages.length + capForm.uploadedImages.length;
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
          const currentTotal = prev.existingImages.length + prev.uploadedImages.length;
          if (currentTotal >= 7) return prev;
          return {
            ...prev,
            uploadedImages: [...prev.uploadedImages, file],
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
      uploadedImages: prev.uploadedImages.filter((_, i) => i !== index),
      uploadedPreviews: prev.uploadedPreviews.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando marcas...</span>
      </div>
    );
  }

  const MAX_BRANDS = 50;
  const canCreateBrand = brands.length < MAX_BRANDS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">Gestión de Marcas</h3>
          <p className="text-sm text-muted-foreground">{brands.length} de {MAX_BRANDS} marcas</p>
        </div>
        <Button 
          onClick={() => setShowNewBrandForm(true)} 
          className="gap-2"
          disabled={!canCreateBrand}
        >
          <Plus className="h-4 w-4" />
          {canCreateBrand ? 'Nueva Marca' : 'Límite alcanzado'}
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
                <div className="relative group">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {uploadingLogoId === brand.id ? (
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    ) : (
                      <img 
                        src={brand.logo_url} 
                        alt={brand.name} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <label 
                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Upload className="h-5 w-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpdateLogo(brand.id, file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-foreground">{brand.name}</h4>
                  <p className="text-sm text-muted-foreground">{brand.products.length} productos</p>
                  <p className="text-xs text-muted-foreground/70 truncate">URL: {brand.path}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEditBrand(brand);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
                </Button>
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

            {/* Formulario de edición de marca */}
            {editingBrand?.id === brand.id && (
              <div className="border-t border-border p-4 bg-primary/5">
                <div className="flex items-center gap-2 mb-4">
                  <Pencil className="h-5 w-5 text-primary" />
                  <h5 className="text-lg font-bold text-foreground">Editar Marca</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`edit-name-${brand.id}`} className="text-sm font-semibold">Nombre de la Marca</Label>
                    <Input
                      id={`edit-name-${brand.id}`}
                      value={editingBrand.name}
                      onChange={(e) => setEditingBrand(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="Nombre de la marca"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-path-${brand.id}`} className="text-sm font-semibold flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      URL de la Página
                    </Label>
                    <Input
                      id={`edit-path-${brand.id}`}
                      value={editingBrand.path}
                      onChange={(e) => setEditingBrand(prev => prev ? { ...prev, path: e.target.value } : null)}
                      placeholder="/nombre-marca"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Ej: /gallo-fino, /bass-pro</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={handleSaveEditBrand} 
                    disabled={isSavingBrand}
                    size="sm"
                  >
                    {isSavingBrand ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingBrand(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

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
                  /* Formulario para agregar/editar gorra */
                  <Card className="p-6 mb-4 bg-card relative overflow-hidden">
                    {/* Success overlay */}
                    {showSuccess && (
                      <div className="absolute inset-0 bg-primary/95 flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
                        <div className="bg-background rounded-full p-4 mb-4 animate-in zoom-in duration-300">
                          <Check className="h-12 w-12 text-primary" />
                        </div>
                        <p className="text-primary-foreground text-xl font-bold">
                          {editingProduct ? '¡Gorra Actualizada!' : '¡Gorra Guardada!'}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-6">
                      <h5 className="text-xl font-bold text-foreground">
                        {editingProduct ? 'Editar Gorra' : 'Agregar Nueva Gorra'}
                      </h5>
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
                          Seleccionadas: {capForm.existingImages.length + capForm.uploadedImages.length}/7
                        </p>
                        
                        {/* Existing images */}
                        {capForm.existingImages.length > 0 && (
                          <div className="mb-4">
                            <Label className="text-sm font-medium mb-2 block">Fotos actuales:</Label>
                            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
                              {capForm.existingImages.map((src, index) => (
                                <div 
                                  key={`existing-${index}`}
                                  className="relative rounded-lg overflow-hidden border-2 border-border"
                                >
                                  <img src={src} alt={`Existente ${index + 1}`} className="w-full aspect-square object-cover" />
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6"
                                    onClick={() => removeExistingImage(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Subir desde galería */}
                        {(capForm.existingImages.length + capForm.uploadedImages.length) < 7 && (
                          <div className="mb-4">
                            <Label className="text-sm font-medium mb-2 block">Subir nuevas fotos:</Label>
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
                        )}

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
                                      {index + 1}
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
                      <Button onClick={() => handleSaveProduct(brand.id)} disabled={isUploading} size="lg">
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : editingProduct ? (
                          <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Actualizar Gorra
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Gorra
                          </>
                        )}
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
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h5 className="font-medium text-sm text-foreground truncate">{product.name}</h5>
                          <div className="flex items-center gap-2">
                            {product.sale_price ? (
                              <>
                                <span className="text-primary font-bold">${product.sale_price}</span>
                                <span className="text-xs text-muted-foreground line-through">${product.price}</span>
                              </>
                            ) : (
                              <span className="text-primary font-bold">${product.price}</span>
                            )}
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStartEditProduct(brand.id, product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProduct(brand.id, product.id, product.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
