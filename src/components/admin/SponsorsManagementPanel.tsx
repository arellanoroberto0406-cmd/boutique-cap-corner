import { useState } from 'react';
import { useSponsors, Sponsor, SponsorFormData } from '@/hooks/useSponsors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Upload, X, ExternalLink, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const initialFormData: SponsorFormData = {
  name: '',
  logo_url: '',
  website_url: '',
  description: '',
  is_active: true,
  display_order: 0,
};

const SponsorsManagementPanel = () => {
  const { sponsors, isLoading, createSponsor, updateSponsor, deleteSponsor, isCreating, isUpdating } = useSponsors();
  const [showForm, setShowForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState<SponsorFormData>(initialFormData);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `sponsor-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('brand-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('brand-logos')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      toast.success('Logo subido correctamente');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Error al subir el logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      logo_url: sponsor.logo_url,
      website_url: sponsor.website_url || '',
      description: sponsor.description || '',
      is_active: sponsor.is_active,
      display_order: sponsor.display_order,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    if (!formData.logo_url) {
      toast.error('El logo es obligatorio');
      return;
    }

    try {
      if (editingSponsor) {
        await updateSponsor({ id: editingSponsor.id, ...formData });
      } else {
        // Set display_order to be after the last sponsor
        const maxOrder = sponsors.length > 0 ? Math.max(...sponsors.map(s => s.display_order)) : 0;
        await createSponsor({ ...formData, display_order: maxOrder + 1 });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving sponsor:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este patrocinador?')) return;
    await deleteSponsor(id);
  };

  const handleToggleActive = async (sponsor: Sponsor) => {
    await updateSponsor({ id: sponsor.id, is_active: !sponsor.is_active });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSponsor(null);
    setFormData(initialFormData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Patrocinadores</h2>
          <p className="text-muted-foreground">Gestiona los patrocinadores que aparecen en tu tienda</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Patrocinador
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingSponsor ? 'Editar Patrocinador' : 'Nuevo Patrocinador'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre del patrocinador"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    placeholder="https://ejemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción breve del patrocinador"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Logo *</Label>
                <div className="flex items-center gap-4">
                  {formData.logo_url ? (
                    <div className="relative w-24 h-24 border border-border rounded-lg overflow-hidden bg-muted">
                      <img
                        src={formData.logo_url}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={isUploadingLogo}
                      />
                      {isUploadingLogo ? (
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Subir</span>
                        </>
                      )}
                    </label>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <p>JPG, PNG, WebP</p>
                    <p>Máx 5MB</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>Activo</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="order">Orden:</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    className="w-20"
                    min={0}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? 'Guardando...' : editingSponsor ? 'Actualizar' : 'Crear'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sponsors List */}
      {sponsors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No hay patrocinadores registrados</p>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Agregar primer patrocinador
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sponsors.map((sponsor) => (
            <Card key={sponsor.id} className={`transition-opacity ${!sponsor.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-muted-foreground cursor-move">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="w-16 h-16 border border-border rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{sponsor.name}</h3>
                      <Badge variant={sponsor.is_active ? 'default' : 'secondary'}>
                        {sponsor.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    {sponsor.description && (
                      <p className="text-sm text-muted-foreground truncate">{sponsor.description}</p>
                    )}
                    {sponsor.website_url && (
                      <a
                        href={sponsor.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Sitio web
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={sponsor.is_active}
                      onCheckedChange={() => handleToggleActive(sponsor)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(sponsor)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(sponsor.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SponsorsManagementPanel;
