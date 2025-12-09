import { useState } from 'react';
import { usePines, Pin } from '@/hooks/usePines';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, X, Upload, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface PinForm {
  name: string;
  price: string;
  sale_price: string;
  image: File | null;
  imagePreview: string;
}

const PinesManagementPanel = () => {
  const { pines, loading, uploadImage, createPin, updatePin, deletePin } = usePines();
  const [showForm, setShowForm] = useState(false);
  const [editingPin, setEditingPin] = useState<Pin | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PinForm>({
    name: '',
    price: '',
    sale_price: '',
    image: null,
    imagePreview: ''
  });

  const resetForm = () => {
    setForm({
      name: '',
      price: '',
      sale_price: '',
      image: null,
      imagePreview: ''
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
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleEdit = (pin: Pin) => {
    setEditingPin(pin);
    setForm({
      name: pin.name,
      price: pin.price.toString(),
      sale_price: pin.sale_price?.toString() || '',
      image: null,
      imagePreview: pin.image_url
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.price) {
      toast.error('Nombre y precio son requeridos');
      return;
    }

    if (!editingPin && !form.image) {
      toast.error('Debes subir una imagen');
      return;
    }

    setSaving(true);

    try {
      let imageUrl = editingPin?.image_url || '';

      if (form.image) {
        imageUrl = await uploadImage(form.image);
      }

      const pinData = {
        name: form.name,
        price: parseFloat(form.price),
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        image_url: imageUrl
      };

      if (editingPin) {
        await updatePin(editingPin.id, pinData);
        toast.success('Pin actualizado correctamente');
      } else {
        await createPin(pinData);
        toast.success('Pin creado correctamente');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving pin:', error);
      toast.error('Error al guardar el pin');
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
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre del pin"
                    required
                  />
                </div>

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
                  <Label htmlFor="image">Imagen</Label>
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
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold truncate">{pin.name}</h3>
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
