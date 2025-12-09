import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, X, ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEstuches, Estuche } from '@/hooks/useEstuches';

interface EstucheForm {
  name: string;
  description: string;
  price: string;
  salePrice: string;
  freeShipping: boolean;
  shippingCost: string;
  uploadedImages: File[];
  uploadedPreviews: string[];
}

const initialForm: EstucheForm = {
  name: '',
  description: '',
  price: '',
  salePrice: '',
  freeShipping: false,
  shippingCost: '',
  uploadedImages: [],
  uploadedPreviews: []
};

const EstuchesManagementPanel = () => {
  const { estuches, loading, createEstuche, deleteEstuche, uploadImage } = useEstuches();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EstucheForm>(initialForm);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 5 - form.uploadedImages.length;
    if (remainingSlots <= 0) {
      toast.error('Máximo 5 fotos permitidas');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => {
          if (prev.uploadedImages.length >= 5) return prev;
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

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((_, i) => i !== index),
      uploadedPreviews: prev.uploadedPreviews.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price || form.uploadedImages.length === 0) {
      toast.error('Por favor completa nombre, precio y al menos una imagen');
      return;
    }

    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      toast.error('El precio debe ser un número válido');
      return;
    }

    setIsUploading(true);

    try {
      // Upload all images
      const uploadedUrls: string[] = [];
      for (const file of form.uploadedImages) {
        const url = await uploadImage(file);
        uploadedUrls.push(url);
      }

      const salePrice = form.salePrice ? parseFloat(form.salePrice) : undefined;

      await createEstuche({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: price,
        sale_price: salePrice,
        free_shipping: form.freeShipping,
        shipping_cost: form.freeShipping ? 0 : parseFloat(form.shippingCost) || 0,
        image_url: uploadedUrls[0],
        images: uploadedUrls
      });

      setShowForm(false);
      setForm(initialForm);
      toast.success('Estuche agregado exitosamente');
    } catch (error: any) {
      console.error('Error adding estuche:', error);
      toast.error('Error al agregar el estuche: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (estuche: Estuche) => {
    if (confirm(`¿Estás seguro de eliminar "${estuche.name}"?`)) {
      try {
        await deleteEstuche(estuche.id);
        toast.success(`Estuche "${estuche.name}" eliminado`);
      } catch (error: any) {
        toast.error('Error al eliminar: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setForm(initialForm);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando estuches...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">Gestión de Estuches</h3>
          <p className="text-sm text-muted-foreground">{estuches.length} estuches</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Estuche
        </Button>
      </div>

      {/* Formulario para nuevo estuche */}
      {showForm && (
        <Card className="p-6 bg-card border-primary/20">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-foreground">Agregar Nuevo Estuche</h4>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Nombre */}
            <div>
              <Label htmlFor="estucheName" className="text-base font-semibold">NOMBRE DEL ESTUCHE *</Label>
              <Input
                id="estucheName"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Estuche Premium"
                className="mt-2"
              />
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="estucheDescription" className="text-base font-semibold">DESCRIPCIÓN</Label>
              <Textarea
                id="estucheDescription"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del estuche..."
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Precios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estuchePrice" className="text-base font-semibold">PRECIO NORMAL *</Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="estuchePrice"
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="estucheSalePrice" className="text-base font-semibold">PRECIO DE OFERTA</Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="estucheSalePrice"
                    type="number"
                    value={form.salePrice}
                    onChange={(e) => setForm(prev => ({ ...prev, salePrice: e.target.value }))}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            {/* Envío */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <Label htmlFor="freeShipping" className="text-base font-semibold cursor-pointer">ENVÍO GRATIS</Label>
                <Switch
                  id="freeShipping"
                  checked={form.freeShipping}
                  onCheckedChange={(checked) => setForm(prev => ({ ...prev, freeShipping: checked }))}
                />
              </div>
              
              {!form.freeShipping && (
                <div>
                  <Label htmlFor="shippingCost" className="text-sm">Costo de Envío</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="shippingCost"
                      type="number"
                      value={form.shippingCost}
                      onChange={(e) => setForm(prev => ({ ...prev, shippingCost: e.target.value }))}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Imágenes */}
            <div>
              <Label className="text-base font-semibold">IMÁGENES * ({form.uploadedImages.length}/5)</Label>
              <div className="mt-2 grid grid-cols-3 md:grid-cols-5 gap-2">
                {form.uploadedPreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {form.uploadedImages.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors flex items-center justify-center">
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <Button onClick={handleSubmit} disabled={isUploading} size="lg">
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Guardar Estuche
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetForm} size="lg">
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de estuches */}
      {estuches.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No hay estuches. Agrega uno nuevo para comenzar.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {estuches.map((estuche) => (
            <Card key={estuche.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={estuche.image_url}
                  alt={estuche.name}
                  className="w-full h-full object-cover"
                />
                {estuche.sale_price && (
                  <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
                    OFERTA
                  </span>
                )}
                {estuche.free_shipping && (
                  <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    ENVÍO GRATIS
                  </span>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-foreground">{estuche.name}</h4>
                {estuche.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{estuche.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {estuche.sale_price ? (
                    <>
                      <span className="font-bold text-primary">${estuche.sale_price}</span>
                      <span className="text-sm text-muted-foreground line-through">${estuche.price}</span>
                    </>
                  ) : (
                    <span className="font-bold text-foreground">${estuche.price}</span>
                  )}
                </div>
                {!estuche.free_shipping && estuche.shipping_cost > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">Envío: ${estuche.shipping_cost}</p>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => handleDelete(estuche)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EstuchesManagementPanel;
