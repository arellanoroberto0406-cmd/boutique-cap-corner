import { useState } from 'react';
import { usePines, Pin } from '@/hooks/usePines';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, X, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface PinForm {
  price: string;
  sale_price: string;
  stock: string;
  image: File | null;
  imagePreview: string;
  imageUrl: string;
}

const PinesManagementPanel = () => {
  const { pines, loading, uploadImage, createPin, updatePin, deletePin } = usePines();
  const [showForm, setShowForm] = useState(false);
  const [editingPin, setEditingPin] = useState<Pin | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PinForm>({
    price: '',
    sale_price: '',
    stock: '0',
    image: null,
    imagePreview: '',
    imageUrl: ''
  });

  const resetForm = () => {
    setForm({
      price: '',
      sale_price: '',
      stock: '0',
      image: null,
      imagePreview: '',
      imageUrl: ''
    });
    setEditingPin(null);
    setShowForm(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
        imageUrl: ''
      }));
    }
  };

  const handleEdit = (pin: Pin) => {
    setEditingPin(pin);
    setForm({
      price: pin.price.toString(),
      sale_price: pin.sale_price?.toString() || '',
      stock: (pin.stock ?? 0).toString(),
      image: null,
      imagePreview: pin.image_url,
      imageUrl: pin.image_url
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.price) {
      toast.error('El precio es requerido');
      return;
    }

    if (!editingPin && !form.image && !form.imageUrl) {
      toast.error('Debes subir una imagen o proporcionar una URL');
      return;
    }

    setSaving(true);

    try {
      let imageUrl = editingPin?.image_url || form.imageUrl || '';

      if (form.image) {
        try {
          imageUrl = await uploadImage(form.image);
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError);
          // If upload fails due to RLS, ask for URL instead
          if (uploadError.message?.includes('row-level security')) {
            toast.error('Error de permisos al subir imagen. Por favor usa una URL de imagen externa.');
            setSaving(false);
            return;
          }
          throw uploadError;
        }
      }

      const pinData = {
        name: `Pin ${Date.now()}`,
        price: parseFloat(form.price),
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        image_url: imageUrl,
        stock: parseInt(form.stock) || 0
      };

      if (editingPin) {
        await updatePin(editingPin.id, pinData);
        toast.success('Pin actualizado correctamente');
      } else {
        await createPin(pinData);
        toast.success('Pin creado correctamente');
      }

      resetForm();
    } catch (error: any) {
      console.error('Error saving pin:', error);
      toast.error(error.message || 'Error al guardar el pin');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este pin?')) return;

    try {
      await deletePin(id);
      toast.success('Pin eliminado correctamente');
    } catch (error) {
      console.error('Error deleting pin:', error);
      toast.error('Error al eliminar el pin');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Pines</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Pin
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingPin ? 'Editar Pin' : 'Nuevo Pin'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sale_price">Precio de Oferta (opcional)</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    value={form.sale_price}
                    onChange={(e) => setForm(prev => ({ ...prev, sale_price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="image">Imagen (subir archivo)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1"
                    />
                    {form.imagePreview && (
                      <img
                        src={form.imagePreview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="imageUrl">O pegar URL de imagen</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      imageUrl: e.target.value,
                      imagePreview: e.target.value,
                      image: null
                    }))}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingPin ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pines.map((pin) => (
          <Card key={pin.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={pin.image_url}
                alt={pin.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={() => handleEdit(pin)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => handleDelete(pin.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {(pin.stock ?? 0) <= 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Sin stock
                </div>
              )}
            </div>
            <CardContent className="p-4">
              
              <div className="flex items-center gap-2 mt-1">
                {pin.sale_price ? (
                  <>
                    <span className="text-lg font-bold text-primary">
                      ${pin.sale_price.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ${pin.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold">
                    ${pin.price.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Stock: {pin.stock ?? 0}
              </p>
            </CardContent>
          </Card>
        ))}

        {pines.length === 0 && !showForm && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No hay pines registrados. Haz clic en "Agregar Pin" para comenzar.
          </div>
        )}
      </div>
    </div>
  );
};

export default PinesManagementPanel;
