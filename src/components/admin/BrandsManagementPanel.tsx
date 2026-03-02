import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown, ChevronUp, X, ImagePlus, Loader2, Upload, Pencil, Link, Check, Image, Package, DollarSign, Truck, Tag, Ruler, Box, Hash, FileText, Settings2, LayoutGrid, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useBrands, Brand, BrandProduct } from '@/hooks/useBrands';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

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
  sizes: string;
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
  stock: '',
  sizes: ''
};

interface EditBrandForm {
  id: string;
  name: string;
  path: string;
}

const BrandsManagementPanel = () => {
  const { brands, loading, createBrand, deleteBrand, addProduct, updateProduct, deleteProduct, uploadMultipleImages, updateBrandLogo, updateBrand, updateBrandPromoImage, fetchProductImages, fetchBrandProducts } = useBrands();
  const [loadedBrands, setLoadedBrands] = useState<Set<string>>(new Set());
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
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, step: '' });
  const [uploadingLogoId, setUploadingLogoId] = useState<string | null>(null);
  const [editingBrand, setEditingBrand] = useState<EditBrandForm | null>(null);
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadingPromoId, setUploadingPromoId] = useState<string | null>(null);
  const [activeFormTab, setActiveFormTab] = useState('info');

  // No auto-expand - products load lazily when user clicks

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

  const handleUpdatePromoImage = async (brandId: string, file: File | null) => {
    setUploadingPromoId(brandId);
    try {
      await updateBrandPromoImage(brandId, file);
      toast.success(file ? 'Imagen promocional actualizada' : 'Imagen promocional eliminada');
    } catch (error: any) {
      toast.error('Error al actualizar la imagen: ' + error.message);
    } finally {
      setUploadingPromoId(null);
    }
  };

  const handleStartEditBrand = (brand: Brand) => {
    setEditingBrand({ id: brand.id, name: brand.name, path: brand.path });
  };

  const handleSaveEditBrand = async () => {
    if (!editingBrand) return;
    if (!editingBrand.name.trim()) { toast.error('El nombre es requerido'); return; }
    if (!editingBrand.path.trim()) { toast.error('La URL de la página es requerida'); return; }

    setIsSavingBrand(true);
    try {
      await updateBrand(editingBrand.id, { name: editingBrand.name, path: editingBrand.path });
      toast.success('Marca actualizada exitosamente');
      setEditingBrand(null);
    } catch (error: any) {
      toast.error('Error al actualizar: ' + error.message);
    } finally {
      setIsSavingBrand(false);
    }
  };

  const toggleBrand = (brandId: string) => {
    const isExpanding = !expandedBrands.includes(brandId);
    setExpandedBrands(prev => isExpanding ? [...prev, brandId] : prev.filter(id => id !== brandId));
    
    // Lazy load products when expanding for the first time
    if (isExpanding && !loadedBrands.has(brandId)) {
      setLoadedBrands(prev => new Set(prev).add(brandId));
      fetchBrandProducts(brandId);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBrandForm(prev => ({ ...prev, logo: file, logoPreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrandForm.name.trim()) { toast.error('El nombre de la marca es requerido'); return; }
    if (!newBrandForm.logo) { toast.error('El logo de la marca es requerido'); return; }
    setIsUploading(true);
    try {
      await createBrand(newBrandForm.name, newBrandForm.logo);
      toast.success(`Marca "${newBrandForm.name}" creada exitosamente`);
      setNewBrandForm({ name: '', logo: null, logoPreview: '' });
      setShowNewBrandForm(false);
    } catch (error: any) {
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

  const handleStartEditProduct = async (brandId: string, product: BrandProduct) => {
    setEditingProduct({ brandId, product });
    setActiveFormTab('info');
    setShowCapForm(brandId);
    
    // Set form with basic data immediately
    setCapForm({
      name: product.name,
      price: product.price.toString(),
      salePrice: product.sale_price?.toString() || '',
      freeShipping: product.free_shipping || false,
      shippingCost: product.shipping_cost?.toString() || '',
      uploadedImages: [],
      uploadedPreviews: [],
      existingImages: product.images?.length ? product.images : [product.image_url],
      description: product.description || '',
      hasFullSet: product.has_full_set || false,
      onlyCap: product.only_cap !== false,
      onlyCapPrice: product.only_cap_price?.toString() || '',
      stock: product.stock?.toString() || '0',
      sizes: product.sizes?.join(', ') || ''
    });

    // Fetch full images in background
    const images = await fetchProductImages(product.id);
    if (images.length > 0) {
      setCapForm(prev => ({ ...prev, existingImages: images }));
    }
  };

  const handleSaveProduct = async (brandId: string) => {
    const totalImages = capForm.existingImages.length + capForm.uploadedImages.length;
    if (!capForm.name.trim() || !capForm.price || totalImages === 0) {
      toast.error('Por favor completa nombre, precio y al menos una imagen');
      return;
    }
    const price = parseFloat(capForm.price);
    if (isNaN(price) || price <= 0) { toast.error('El precio debe ser un número válido'); return; }

    setIsUploading(true);
    const totalNewImages = capForm.uploadedImages.length;
    try {
      if (totalNewImages > 0) setUploadProgress({ current: 0, total: totalNewImages, step: 'Subiendo imágenes...' });
      const newUploadedUrls = totalNewImages > 0 ? await uploadMultipleImages(capForm.uploadedImages) : [];
      setUploadProgress({ current: totalNewImages, total: totalNewImages, step: 'Guardando producto...' });
      const allImages = [...capForm.existingImages, ...newUploadedUrls];
      const salePrice = capForm.salePrice ? parseFloat(capForm.salePrice) : null;
      const onlyCapPrice = capForm.onlyCapPrice ? parseFloat(capForm.onlyCapPrice) : null;
      const stock = capForm.stock ? parseInt(capForm.stock) : 0;
      const sizesArray = capForm.sizes ? capForm.sizes.split(',').map(s => s.trim()).filter(s => s) : [];

      const productData = {
        name: capForm.name.trim(), price, image_url: allImages[0],
        sale_price: salePrice || undefined, free_shipping: capForm.freeShipping,
        shipping_cost: capForm.freeShipping ? 0 : parseFloat(capForm.shippingCost) || 0,
        images: allImages, description: capForm.description,
        has_full_set: capForm.hasFullSet, only_cap: capForm.onlyCap,
        only_cap_price: onlyCapPrice || undefined, stock, sizes: sizesArray
      };

      if (editingProduct) {
        await updateProduct(brandId, editingProduct.product.id, productData);
        toast.success('Gorra actualizada exitosamente');
      } else {
        await addProduct(brandId, productData);
        toast.success('Gorra agregada exitosamente');
      }
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); resetCapForm(); }, 1500);
    } catch (error: any) {
      toast.error('Error al guardar la gorra: ' + error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0, step: '' });
    }
  };

  const resetCapForm = () => {
    setShowCapForm(null);
    setEditingProduct(null);
    setCapForm(initialCapForm);
    setActiveFormTab('info');
  };

  const removeExistingImage = (index: number) => {
    setCapForm(prev => ({ ...prev, existingImages: prev.existingImages.filter((_, i) => i !== index) }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const totalImages = capForm.existingImages.length + capForm.uploadedImages.length;
    const remainingSlots = 7 - totalImages;
    if (remainingSlots <= 0) { toast.error('Máximo 7 fotos permitidas'); return; }
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapForm(prev => {
          const currentTotal = prev.existingImages.length + prev.uploadedImages.length;
          if (currentTotal >= 7) return prev;
          return { ...prev, uploadedImages: [...prev.uploadedImages, file], uploadedPreviews: [...prev.uploadedPreviews, reader.result as string] };
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
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-muted animate-pulse" />
          <Loader2 className="h-8 w-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-muted-foreground font-medium">Cargando marcas...</p>
      </div>
    );
  }

  const MAX_BRANDS = 50;
  const canCreateBrand = brands.length < MAX_BRANDS;
  const totalProducts = brands.reduce((acc, b) => acc + b.products.length, 0);

  return (
    <div className="space-y-6">
      {/* ===== HEADER CON STATS ===== */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <LayoutGrid className="h-6 w-6 text-primary" />
              Gestión de Marcas y Productos
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Administra marcas, gorras, precios e inventario</p>
          </div>
          <Button
            onClick={() => setShowNewBrandForm(true)}
            className="gap-2 shadow-lg"
            size="lg"
            disabled={!canCreateBrand}
          >
            <Plus className="h-5 w-5" />
            {canCreateBrand ? 'Nueva Marca' : 'Límite alcanzado'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border bg-card/80 p-3 text-center">
            <p className="text-2xl font-bold text-primary">{brands.length}</p>
            <p className="text-xs text-muted-foreground">Marcas</p>
          </div>
          <div className="rounded-lg border border-border bg-card/80 p-3 text-center">
            <p className="text-2xl font-bold text-primary">{totalProducts}</p>
            <p className="text-xs text-muted-foreground">Productos</p>
          </div>
          <div className="rounded-lg border border-border bg-card/80 p-3 text-center">
            <p className="text-2xl font-bold text-primary">{MAX_BRANDS - brands.length}</p>
            <p className="text-xs text-muted-foreground">Espacios disponibles</p>
          </div>
          <div className="rounded-lg border border-border bg-card/80 p-3 text-center">
            <p className="text-2xl font-bold text-primary">{brands.filter(b => b.products.some(p => p.sale_price)).length}</p>
            <p className="text-xs text-muted-foreground">Con ofertas</p>
          </div>
        </div>
      </div>

      {/* ===== FORMULARIO NUEVA MARCA ===== */}
      {showNewBrandForm && (
        <Card className="border-primary/30 shadow-xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Crear Nueva Marca</CardTitle>
                  <CardDescription>Agrega una nueva marca a tu catálogo</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowNewBrandForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="brandName" className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  Nombre de la Marca <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="brandName"
                  value={newBrandForm.name}
                  onChange={(e) => setNewBrandForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Mi Nueva Marca"
                  className="h-12"
                />
              </div>

              {/* Logo */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Image className="h-4 w-4 text-primary" />
                  Logo de la Marca <span className="text-destructive">*</span>
                </Label>
                {newBrandForm.logoPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-black rounded-xl flex items-center justify-center p-2 overflow-hidden border-2 border-primary/20">
                      <img src={newBrandForm.logoPreview} alt="Preview logo" className="max-w-full max-h-full object-contain" />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setNewBrandForm(prev => ({ ...prev, logo: null, logoPreview: '' }))}>
                      Cambiar
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <div className="flex items-center gap-3">
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground font-medium">Subir logo</span>
                        <p className="text-xs text-muted-foreground/70">PNG, JPG o WEBP</p>
                      </div>
                    </div>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button onClick={handleCreateBrand} disabled={isUploading} size="lg" className="gap-2">
                {isUploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creando...</> : <><Plus className="h-4 w-4" /> Crear Marca</>}
              </Button>
              <Button variant="outline" onClick={() => setShowNewBrandForm(false)} size="lg">Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== LISTA DE MARCAS ===== */}
      {brands.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No hay marcas disponibles</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Crea una nueva marca para comenzar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {brands.map((brand) => (
            <Card key={brand.id} className="overflow-hidden border-border/50 hover:border-border transition-colors">
              {/* ---- Brand Header ---- */}
              <div className="flex items-center justify-between p-4 md:p-5 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleBrand(brand.id)}>
                  {/* Logo */}
                  <div className="relative group">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-black rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-border shadow-md">
                      {uploadingLogoId === brand.id ? (
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      ) : (
                        <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <label
                      className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Upload className="h-5 w-5 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpdateLogo(brand.id, file); e.target.value = ''; }} />
                    </label>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-bold text-foreground">{brand.name}</h4>
                      <Badge variant="secondary" className="text-xs">{brand.products.length} gorras</Badge>
                      {brand.products.some(p => p.sale_price) && (
                        <Badge variant="destructive" className="text-xs">Ofertas</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      <Link className="h-3 w-3 inline mr-1" />{brand.path}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" className="gap-1.5 hidden md:flex" onClick={(e) => { e.stopPropagation(); handleStartEditBrand(brand); }}>
                    <Settings2 className="h-3.5 w-3.5" /> Configurar
                  </Button>
                  <Button variant="outline" size="icon" className="md:hidden h-8 w-8" onClick={(e) => { e.stopPropagation(); handleStartEditBrand(brand); }}>
                    <Settings2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleDeleteBrand(brand.id, brand.name); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleBrand(brand.id)}>
                    {expandedBrands.includes(brand.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* ---- Edit Brand Form ---- */}
              {editingBrand?.id === brand.id && (
                <div className="border-t border-border p-5 bg-primary/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings2 className="h-5 w-5 text-primary" />
                    <h5 className="text-base font-bold text-foreground">Configuración de Marca</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor={`edit-name-${brand.id}`} className="text-sm font-semibold flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-primary" /> Nombre
                      </Label>
                      <Input id={`edit-name-${brand.id}`} value={editingBrand.name} onChange={(e) => setEditingBrand(prev => prev ? { ...prev, name: e.target.value } : null)} placeholder="Nombre de la marca" className="h-10" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`edit-path-${brand.id}`} className="text-sm font-semibold flex items-center gap-1.5">
                        <Link className="h-3.5 w-3.5 text-primary" /> URL de la Página
                      </Label>
                      <Input id={`edit-path-${brand.id}`} value={editingBrand.path} onChange={(e) => setEditingBrand(prev => prev ? { ...prev, path: e.target.value } : null)} placeholder="/nombre-marca" className="h-10" />
                      <p className="text-xs text-muted-foreground">Ej: /gallo-fino, /bass-pro</p>
                    </div>
                  </div>

                  {/* Imagen Promocional */}
                  <div className="mt-5">
                    <Label className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                      <Image className="h-3.5 w-3.5 text-primary" /> Imagen Promocional
                    </Label>
                    <p className="text-xs text-muted-foreground mb-3">Se muestra en la página de la marca</p>
                    {brand.promo_image ? (
                      <div className="flex items-start gap-3">
                        <div className="w-40 h-24 rounded-lg overflow-hidden border border-border">
                          {uploadingPromoId === brand.id ? (
                            <div className="w-full h-full bg-muted flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                          ) : (
                            <img src={brand.promo_image} alt="Promo" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="cursor-pointer">
                            <Button variant="outline" size="sm" asChild><span><Upload className="h-3 w-3 mr-1" /> Cambiar</span></Button>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpdatePromoImage(brand.id, file); e.target.value = ''; }} />
                          </label>
                          <Button variant="destructive" size="sm" onClick={() => handleUpdatePromoImage(brand.id, null)} disabled={uploadingPromoId === brand.id}>
                            <Trash2 className="h-3 w-3 mr-1" /> Eliminar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center w-40 h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
                        {uploadingPromoId === brand.id ? (
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        ) : (
                          <div className="flex flex-col items-center text-center p-2">
                            <ImagePlus className="h-6 w-6 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">Subir imagen</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpdatePromoImage(brand.id, file); e.target.value = ''; }} />
                      </label>
                    )}
                  </div>

                  <Separator className="my-4" />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEditBrand} disabled={isSavingBrand} size="sm" className="gap-1.5">
                      {isSavingBrand ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : <><Check className="h-4 w-4" /> Guardar Cambios</>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingBrand(null)}>Cancelar</Button>
                  </div>
                </div>
              )}

              {/* ---- Products Section ---- */}
              {expandedBrands.includes(brand.id) && (
                <div className="border-t border-border">
                  {/* Add product button bar */}
                  <div className="px-4 md:px-5 py-3 bg-muted/20 border-b border-border flex items-center justify-between">
                    <p className="text-sm text-muted-foreground font-medium">
                      {brand.products.length} {brand.products.length === 1 ? 'producto' : 'productos'} registrados
                    </p>
                    {showCapForm !== brand.id && (
                      <Button onClick={() => { setActiveFormTab('info'); setShowCapForm(brand.id); }} className="gap-2" size="sm">
                        <Plus className="h-4 w-4" /> Agregar Gorra
                      </Button>
                    )}
                  </div>

                  {/* ---- CAP FORM WITH TABS ---- */}
                  {showCapForm === brand.id && (
                    <div className="p-4 md:p-5 bg-card border-b border-border relative">
                      {/* Success overlay */}
                      {showSuccess && (
                        <div className="absolute inset-0 bg-primary/95 flex flex-col items-center justify-center z-50 animate-in fade-in duration-300 rounded-lg">
                          <div className="bg-background rounded-full p-4 mb-4 animate-in zoom-in duration-300">
                            <Check className="h-12 w-12 text-primary" />
                          </div>
                          <p className="text-primary-foreground text-xl font-bold">
                            {editingProduct ? '¡Gorra Actualizada!' : '¡Gorra Guardada!'}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h5 className="text-base font-bold text-foreground">
                              {editingProduct ? 'Editar Gorra' : 'Nueva Gorra'}
                            </h5>
                            <p className="text-xs text-muted-foreground">Completa la información del producto</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={resetCapForm} className="h-8 w-8">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <Tabs value={activeFormTab} onValueChange={setActiveFormTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-4">
                          <TabsTrigger value="info" className="gap-1.5 text-xs md:text-sm">
                            <FileText className="h-3.5 w-3.5" /> Info
                          </TabsTrigger>
                          <TabsTrigger value="pricing" className="gap-1.5 text-xs md:text-sm">
                            <DollarSign className="h-3.5 w-3.5" /> Precios
                          </TabsTrigger>
                          <TabsTrigger value="images" className="gap-1.5 text-xs md:text-sm">
                            <Image className="h-3.5 w-3.5" /> Fotos
                          </TabsTrigger>
                          <TabsTrigger value="details" className="gap-1.5 text-xs md:text-sm">
                            <Box className="h-3.5 w-3.5" /> Detalles
                          </TabsTrigger>
                        </TabsList>

                        {/* TAB: Info */}
                        <TabsContent value="info" className="space-y-4 mt-0">
                          <div className="space-y-2">
                            <Label htmlFor="capName" className="text-sm font-semibold flex items-center gap-1.5">
                              <Tag className="h-3.5 w-3.5 text-primary" /> Nombre de la Gorra <span className="text-destructive">*</span>
                            </Label>
                            <Input id="capName" value={capForm.name} onChange={(e) => setCapForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Ej: Gorra Premium Edition" className="h-11" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="capDescription" className="text-sm font-semibold flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-primary" /> Descripción
                            </Label>
                            <Textarea id="capDescription" value={capForm.description} onChange={(e) => setCapForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe las características de la gorra..." className="min-h-[100px]" />
                          </div>
                        </TabsContent>

                        {/* TAB: Pricing */}
                        <TabsContent value="pricing" className="space-y-5 mt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="capPrice" className="text-sm font-semibold flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5 text-primary" /> Precio (MXN) <span className="text-destructive">*</span>
                              </Label>
                              <Input id="capPrice" type="number" value={capForm.price} onChange={(e) => setCapForm(prev => ({ ...prev, price: e.target.value }))} placeholder="899" className="h-11" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="capSalePrice" className="text-sm font-semibold flex items-center gap-1.5">
                                <Tag className="h-3.5 w-3.5 text-destructive" /> Precio de Oferta
                              </Label>
                              <Input id="capSalePrice" type="number" value={capForm.salePrice} onChange={(e) => setCapForm(prev => ({ ...prev, salePrice: e.target.value }))} placeholder="699 (opcional)" className="h-11" />
                            </div>
                          </div>

                          <Separator />

                          {/* Envío */}
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold flex items-center gap-1.5">
                              <Truck className="h-3.5 w-3.5 text-primary" /> Envío
                            </Label>
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                                <Switch checked={capForm.freeShipping} onCheckedChange={(checked) => setCapForm(prev => ({ ...prev, freeShipping: checked }))} />
                                <Label className="text-sm cursor-pointer">Envío Gratis</Label>
                              </div>
                              {!capForm.freeShipping && (
                                <div className="flex items-center gap-2">
                                  <Label className="text-sm text-muted-foreground">Costo:</Label>
                                  <Input type="number" value={capForm.shippingCost} onChange={(e) => setCapForm(prev => ({ ...prev, shippingCost: e.target.value }))} placeholder="$0" className="w-28 h-9" />
                                </div>
                              )}
                            </div>
                          </div>

                          <Separator />

                          {/* Tipo de producto */}
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold flex items-center gap-1.5">
                              <Box className="h-3.5 w-3.5 text-primary" /> Tipo de Producto
                            </Label>
                            <div className="flex flex-wrap gap-3">
                              <div className="flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-2">
                                <Checkbox id="fullSet" checked={capForm.hasFullSet} onCheckedChange={(checked) => setCapForm(prev => ({ ...prev, hasFullSet: checked === true }))} />
                                <Label htmlFor="fullSet" className="cursor-pointer text-sm">Full Set</Label>
                              </div>
                              <div className="flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-2">
                                <Checkbox id="onlyCap" checked={capForm.onlyCap} onCheckedChange={(checked) => setCapForm(prev => ({ ...prev, onlyCap: checked === true }))} />
                                <Label htmlFor="onlyCap" className="cursor-pointer text-sm">Solo Gorra</Label>
                              </div>
                            </div>
                            {capForm.onlyCap && (
                              <div className="space-y-1.5 mt-2">
                                <Label htmlFor="onlyCapPrice" className="text-sm font-medium">Precio Solo Gorra (MXN)</Label>
                                <Input id="onlyCapPrice" type="number" value={capForm.onlyCapPrice} onChange={(e) => setCapForm(prev => ({ ...prev, onlyCapPrice: e.target.value }))} placeholder="599" className="w-40 h-9" />
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        {/* TAB: Images */}
                        <TabsContent value="images" className="space-y-4 mt-0">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold flex items-center gap-1.5">
                              <Image className="h-3.5 w-3.5 text-primary" /> Fotos del Producto <span className="text-destructive">*</span>
                            </Label>
                            <Badge variant="outline">{capForm.existingImages.length + capForm.uploadedImages.length}/7</Badge>
                          </div>

                          {/* Existing */}
                          {capForm.existingImages.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2 font-medium">Fotos actuales:</p>
                              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
                                {capForm.existingImages.map((src, index) => (
                                  <div key={`existing-${index}`} className="relative rounded-xl overflow-hidden border-2 border-border shadow-sm group">
                                    <img src={src} alt={`Existente ${index + 1}`} className="w-full aspect-square object-cover" />
                                    <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeExistingImage(index)}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Upload */}
                          {(capForm.existingImages.length + capForm.uploadedImages.length) < 7 && (
                            <label className="flex items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                              <div className="flex flex-col items-center">
                                <ImagePlus className="h-7 w-7 text-muted-foreground mb-1.5" />
                                <span className="text-sm text-muted-foreground font-medium">Click para subir fotos</span>
                                <span className="text-xs text-muted-foreground/70">Máximo 7 fotos</span>
                              </div>
                              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                            </label>
                          )}

                          {/* Uploaded previews */}
                          {capForm.uploadedPreviews.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2 font-medium">Nuevas fotos:</p>
                              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
                                {capForm.uploadedPreviews.map((src, index) => (
                                  <div key={index} className="relative rounded-xl overflow-hidden border-2 border-primary ring-2 ring-primary/30 shadow-sm group">
                                    <img src={src} alt={`Subida ${index + 1}`} className="w-full aspect-square object-cover" />
                                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{index + 1}</span>
                                    </div>
                                    <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeUploadedImage(index)}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </TabsContent>

                        {/* TAB: Details */}
                        <TabsContent value="details" className="space-y-4 mt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="capStock" className="text-sm font-semibold flex items-center gap-1.5">
                                <Hash className="h-3.5 w-3.5 text-primary" /> Inventario / Stock
                              </Label>
                              <Input id="capStock" type="number" value={capForm.stock} onChange={(e) => setCapForm(prev => ({ ...prev, stock: e.target.value }))} placeholder="Cantidad" className="h-11" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="capSizes" className="text-sm font-semibold flex items-center gap-1.5">
                                <Ruler className="h-3.5 w-3.5 text-primary" /> Tallas
                              </Label>
                              <Input id="capSizes" value={capForm.sizes} onChange={(e) => setCapForm(prev => ({ ...prev, sizes: e.target.value }))} placeholder="S, M, L, XL" className="h-11" />
                              <p className="text-xs text-muted-foreground">Separa con comas</p>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>

                      {/* Save bar */}
                      <div className="mt-5 pt-4 border-t border-border">
                        {isUploading && uploadProgress.total > 0 && (
                          <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg mb-3">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{uploadProgress.step}</p>
                              {uploadProgress.step === 'Subiendo imágenes...' && (
                                <p className="text-xs text-muted-foreground">{uploadProgress.total} {uploadProgress.total === 1 ? 'imagen' : 'imágenes'} en proceso...</p>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button onClick={() => handleSaveProduct(brand.id)} disabled={isUploading} size="lg" className="gap-2">
                            {isUploading ? (
                              <><Loader2 className="h-4 w-4 animate-spin" /> {uploadProgress.step || 'Guardando...'}</>
                            ) : editingProduct ? (
                              <><Pencil className="h-4 w-4" /> Actualizar Gorra</>
                            ) : (
                              <><Plus className="h-4 w-4" /> Agregar Gorra</>
                            )}
                          </Button>
                          <Button variant="outline" onClick={resetCapForm} size="lg" disabled={isUploading}>Cancelar</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ---- Products Grid ---- */}
                  <div className="p-4 md:p-5 bg-muted/10">
                    {brand.products.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-border/50 rounded-xl">
                        <Package className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">No hay productos en esta marca</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {brand.products.map((product) => (
                          <div key={product.id} className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg hover:border-primary/30 transition-all relative group">
                            <div className="aspect-square bg-muted relative overflow-hidden">
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              {product.sale_price && (
                                <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px]">OFERTA</Badge>
                              )}
                              {product.free_shipping && (
                                <Badge variant="secondary" className="absolute top-2 right-2 text-[10px]">Envío gratis</Badge>
                              )}
                              {/* Hover actions */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button size="sm" variant="secondary" className="h-8 gap-1" onClick={() => handleStartEditProduct(brand.id, product)}>
                                  <Pencil className="h-3.5 w-3.5" /> Editar
                                </Button>
                                <Button size="sm" variant="destructive" className="h-8 gap-1" onClick={() => handleDeleteProduct(brand.id, product.id, product.name)}>
                                  <Trash2 className="h-3.5 w-3.5" /> Borrar
                                </Button>
                              </div>
                            </div>
                            <div className="p-3">
                              <h5 className="font-semibold text-sm text-foreground truncate">{product.name}</h5>
                              <div className="flex items-center gap-2 mt-1">
                                {product.sale_price ? (
                                  <>
                                    <span className="text-primary font-bold text-sm">${product.sale_price}</span>
                                    <span className="text-xs text-muted-foreground line-through">${product.price}</span>
                                  </>
                                ) : (
                                  <span className="text-primary font-bold text-sm">${product.price}</span>
                                )}
                              </div>
                              {product.stock !== null && product.stock !== undefined && (
                                <p className="text-[10px] text-muted-foreground mt-1">Stock: {product.stock}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandsManagementPanel;
