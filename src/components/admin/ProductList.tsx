import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProductListProps {
  onEdit: (product: any) => void;
}

export const ProductList = ({ onEdit }: ProductListProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          image_url,
          is_primary
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar productos');
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast.error('Error al eliminar producto');
    } else {
      toast.success('Producto eliminado');
      loadProducts();
    }
    setDeleteId(null);
  };

  const getPrimaryImage = (product: any) => {
    const primaryImg = product.product_images?.find((img: any) => img.is_primary);
    return primaryImg?.image_url || product.product_images?.[0]?.image_url || '/placeholder.svg';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <img
              src={getPrimaryImage(product)}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{product.collection}</p>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-bold text-lg">${product.price}</span>
                {product.original_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.original_price}
                  </span>
                )}
              </div>
              <div className="flex gap-2 mb-2">
                {product.is_new && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    Nuevo
                  </span>
                )}
                {product.is_on_sale && (
                  <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                    Oferta
                  </span>
                )}
              </div>
              <p className="text-sm mb-4">Stock: {product.stock}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => onEdit(product)}
                  className="flex-1 gap-2"
                  variant="outline"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  onClick={() => setDeleteId(product.id)}
                  variant="destructive"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
