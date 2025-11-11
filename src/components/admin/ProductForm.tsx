import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, X, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ProductFormProps {
  product?: any;
  onClose: () => void;
}

export const ProductForm = ({ product, onClose }: ProductFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    collection: '',
    colors: '',
    materials: '',
    features: '',
    stock: '',
    is_new: false,
    is_on_sale: false,
  });
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        original_price: product.original_price || '',
        collection: product.collection || '',
        colors: product.colors?.join(', ') || '',
        materials: product.materials || '',
        features: product.features?.join('\n') || '',
        stock: product.stock || '',
        is_new: product.is_new || false,
        is_on_sale: product.is_on_sale || false,
      });
      loadExistingImages();
    }
  }, [product]);

  const loadExistingImages = async () => {
    if (!product?.id) return;

    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('display_order');

    if (error) {
      console.error('Error loading images:', error);
      return;
    }

    setExistingImages(data || []);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      toast.error('Error al eliminar imagen');
      return;
    }

    setExistingImages(existingImages.filter(img => img.id !== imageId));
    toast.success('Imagen eliminada');
  };

  const uploadImages = async (productId: string) => {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}_${Date.now()}_${i}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);

      await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: publicUrl,
          is_primary: existingImages.length === 0 && i === 0,
          display_order: existingImages.length + i,
        });
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        collection: formData.collection,
        colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
        materials: formData.materials,
        features: formData.features.split('\n').map(f => f.trim()).filter(Boolean),
        stock: parseInt(formData.stock) || 0,
        is_new: formData.is_new,
        is_on_sale: formData.is_on_sale,
      };

      if (product?.id) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;

        if (images.length > 0) {
          await uploadImages(product.id);
        }

        toast.success('Producto actualizado exitosamente');
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) throw error;

        if (images.length > 0) {
          await uploadImages(newProduct.id);
        }

        toast.success('Producto creado exitosamente');
      }

      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {product ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>
        <Button variant="ghost" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="collection">Colección</Label>
            <Input
              id="collection"
              value={formData.collection}
              onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="original_price">Precio Original (opcional)</Label>
            <Input
              id="original_price"
              type="number"
              step="0.01"
              value={formData.original_price}
              onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="colors">Colores (separados por coma)</Label>
            <Input
              id="colors"
              value={formData.colors}
              onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
              placeholder="Rojo, Azul, Negro"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            required
          />
        </div>

        <div>
          <Label htmlFor="materials">Materiales</Label>
          <Input
            id="materials"
            value={formData.materials}
            onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="features">Características (una por línea)</Label>
          <Textarea
            id="features"
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            rows={4}
            placeholder="Característica 1&#10;Característica 2"
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_new}
              onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Producto Nuevo</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_on_sale}
              onChange={(e) => setFormData({ ...formData, is_on_sale: e.target.checked })}
              className="w-4 h-4"
            />
            <span>En Oferta</span>
          </label>
        </div>

        <div>
          <Label>Imágenes del Producto</Label>
          
          {existingImages.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              {existingImages.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.image_url}
                    alt="Producto"
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {img.is_primary && (
                    <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="border-2 border-dashed border-border rounded-lg p-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Click para subir imágenes
              </span>
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {images.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};
