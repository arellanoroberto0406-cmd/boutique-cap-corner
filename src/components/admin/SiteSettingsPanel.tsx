import { useState, useEffect } from 'react';
import { useSiteSettings, HelpLink } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Save, Plus, Trash2, MapPin, Mail, Phone, Clock, Link, ExternalLink, Info, Building2, FileText, Upload, X, Palette } from 'lucide-react';
import RichTextEditor from '@/components/ui/rich-text-editor';
import ColorPicker from '@/components/ui/color-picker';
import { supabase } from '@/integrations/supabase/client';

const SiteSettingsPanel = () => {
  const { settings, isLoading, updateSetting, updateHelpLinks, isUpdating } = useSiteSettings();
  
  // Company state
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // About Us state
  const [aboutUs, setAboutUs] = useState('');
  
  // Contact form state
  const [contactLocation, setContactLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  
  // Hours form state
  const [hoursWeekdays, setHoursWeekdays] = useState('');
  const [hoursSaturday, setHoursSaturday] = useState('');
  
  // Help links state
  const [helpLinks, setHelpLinks] = useState<HelpLink[]>([]);
  
  // Social media state
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialTiktok, setSocialTiktok] = useState('');

  // Legal pages state
  const [termsConditions, setTermsConditions] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [cookiesPolicy, setCookiesPolicy] = useState('');

  // Theme colors state
  const [themePrimary, setThemePrimary] = useState('');
  const [themeSecondary, setThemeSecondary] = useState('');
  const [themeAccent, setThemeAccent] = useState('');

  // Initialize form with current settings
  useEffect(() => {
    if (settings) {
      setCompanyName(settings.company_name);
      setCompanyLogo(settings.company_logo);
      setAboutUs(settings.about_us);
      setContactLocation(settings.contact_location);
      setContactEmail(settings.contact_email);
      setContactPhone(settings.contact_phone);
      setContactWhatsapp(settings.contact_whatsapp);
      setHoursWeekdays(settings.hours_weekdays);
      setHoursSaturday(settings.hours_saturday);
      setHelpLinks(settings.help_links || []);
      setSocialInstagram(settings.social_instagram);
      setSocialFacebook(settings.social_facebook);
      setSocialTiktok(settings.social_tiktok);
      setTermsConditions(settings.terms_conditions);
      setPrivacyPolicy(settings.privacy_policy);
      setCookiesPolicy(settings.cookies_policy);
      setThemePrimary(settings.theme_primary);
      setThemeSecondary(settings.theme_secondary);
      setThemeAccent(settings.theme_accent);
    }
  }, [settings]);

  const handleSaveCompanyName = () => {
    updateSetting('company_name', companyName);
    toast.success('Nombre de empresa actualizado');
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 2MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `company-logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('brand-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('brand-logos')
        .getPublicUrl(fileName);

      setCompanyLogo(publicUrl);
      updateSetting('company_logo', publicUrl);
      toast.success('Logo actualizado correctamente');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Error al subir el logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setCompanyLogo('');
    updateSetting('company_logo', '');
    toast.success('Logo eliminado');
  };

  const handleSaveAboutUs = () => {
    updateSetting('about_us', aboutUs);
    toast.success('Texto "Sobre Nosotros" actualizado');
  };

  const handleSaveContact = () => {
    updateSetting('contact_location', contactLocation);
    updateSetting('contact_email', contactEmail);
    updateSetting('contact_phone', contactPhone);
    updateSetting('contact_whatsapp', contactWhatsapp);
    toast.success('Información de contacto actualizada');
  };

  const handleSaveHours = () => {
    updateSetting('hours_weekdays', hoursWeekdays);
    updateSetting('hours_saturday', hoursSaturday);
    toast.success('Horarios actualizados');
  };

  const handleSaveHelpLinks = () => {
    updateHelpLinks(helpLinks);
    toast.success('Enlaces de ayuda actualizados');
  };

  const handleSaveSocial = () => {
    updateSetting('social_instagram', socialInstagram);
    updateSetting('social_facebook', socialFacebook);
    updateSetting('social_tiktok', socialTiktok);
    toast.success('Redes sociales actualizadas');
  };

  const handleSaveLegal = () => {
    updateSetting('terms_conditions', termsConditions);
    updateSetting('privacy_policy', privacyPolicy);
    updateSetting('cookies_policy', cookiesPolicy);
    toast.success('Páginas legales actualizadas');
  };

  const addHelpLink = () => {
    setHelpLinks([...helpLinks, { label: '', url: '' }]);
  };

  const removeHelpLink = (index: number) => {
    setHelpLinks(helpLinks.filter((_, i) => i !== index));
  };

  const updateHelpLink = (index: number, field: 'label' | 'url', value: string) => {
    const newLinks = [...helpLinks];
    newLinks[index][field] = value;
    setHelpLinks(newLinks);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando configuración...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configuración del Sitio</h2>
      <p className="text-muted-foreground">Administra la información que aparece en el footer de la tienda.</p>

      {/* Company Name & Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Identidad de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nombre de la empresa</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nombre de tu empresa..."
            />
            <Button onClick={handleSaveCompanyName} disabled={isUpdating} className="mt-2">
              <Save className="h-4 w-4 mr-2" />
              Guardar Nombre
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <Label>Logo de la empresa</Label>
            {companyLogo ? (
              <div className="flex items-center gap-4">
                <div className="relative w-32 h-32 border border-border rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={companyLogo} 
                    alt="Logo de la empresa" 
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Logo actual</p>
                  <p>Haz clic en la X para eliminar</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
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
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground text-center">Subir logo</span>
                    </>
                  )}
                </label>
                <div className="text-sm text-muted-foreground">
                  <p>Formatos: JPG, PNG, WebP</p>
                  <p>Tamaño máximo: 2MB</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* About Us */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Sobre Nosotros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aboutUs">Descripción de la empresa</Label>
            <Textarea
              id="aboutUs"
              value={aboutUs}
              onChange={(e) => setAboutUs(e.target.value)}
              placeholder="Describe tu empresa..."
              rows={4}
            />
          </div>
          <Button onClick={handleSaveAboutUs} disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Sobre Nosotros
          </Button>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Información de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={contactLocation}
                onChange={(e) => setContactLocation(e.target.value)}
                placeholder="Ciudad de México, México"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contacto@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+52 123 456 7890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp (solo números)</Label>
              <Input
                id="whatsapp"
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                placeholder="521234567890"
              />
            </div>
          </div>
          <Button onClick={handleSaveContact} disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Contacto
          </Button>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horarios de Atención
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weekdays">Lunes a Viernes</Label>
              <Input
                id="weekdays"
                value={hoursWeekdays}
                onChange={(e) => setHoursWeekdays(e.target.value)}
                placeholder="Lun - Vie: 9:00 AM - 7:00 PM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="saturday">Sábado</Label>
              <Input
                id="saturday"
                value={hoursSaturday}
                onChange={(e) => setHoursSaturday(e.target.value)}
                placeholder="Sáb: 10:00 AM - 6:00 PM"
              />
            </div>
          </div>
          <Button onClick={handleSaveHours} disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Horarios
          </Button>
        </CardContent>
      </Card>

      {/* Help & Support Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Enlaces de Ayuda y Soporte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {helpLinks.map((link, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <Input
                  value={link.label}
                  onChange={(e) => updateHelpLink(index, 'label', e.target.value)}
                  placeholder="Nombre del enlace"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  value={link.url}
                  onChange={(e) => updateHelpLink(index, 'url', e.target.value)}
                  placeholder="URL (ej: /pagina o https://...)"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeHelpLink(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" onClick={addHelpLink}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Enlace
            </Button>
            <Button onClick={handleSaveHelpLinks} disabled={isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Enlaces
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Redes Sociales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                value={socialInstagram}
                onChange={(e) => setSocialInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input
                id="facebook"
                value={socialFacebook}
                onChange={(e) => setSocialFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok URL</Label>
              <Input
                id="tiktok"
                value={socialTiktok}
                onChange={(e) => setSocialTiktok(e.target.value)}
                placeholder="https://tiktok.com/@..."
              />
            </div>
          </div>
          <Button onClick={handleSaveSocial} disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Redes Sociales
          </Button>
        </CardContent>
      </Card>

      {/* Legal Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Páginas Legales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Términos y Condiciones</Label>
            <RichTextEditor
              content={termsConditions}
              onChange={setTermsConditions}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Política de Privacidad</Label>
            <RichTextEditor
              content={privacyPolicy}
              onChange={setPrivacyPolicy}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Política de Cookies</Label>
            <RichTextEditor
              content={cookiesPolicy}
              onChange={setCookiesPolicy}
            />
          </div>
          <Button onClick={handleSaveLegal} disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Páginas Legales
          </Button>
        </CardContent>
      </Card>

      {/* Theme Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Colores del Tema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Personaliza los colores principales de tu tienda. Los cambios se aplicarán inmediatamente.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ColorPicker
              label="Color Primario"
              value={themePrimary}
              onChange={(value) => {
                setThemePrimary(value);
                updateSetting('theme_primary', value);
              }}
            />
            
            <ColorPicker
              label="Color Secundario"
              value={themeSecondary}
              onChange={(value) => {
                setThemeSecondary(value);
                updateSetting('theme_secondary', value);
              }}
            />
            
            <ColorPicker
              label="Color de Acento"
              value={themeAccent}
              onChange={(value) => {
                setThemeAccent(value);
                updateSetting('theme_accent', value);
              }}
            />
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-3">Vista previa:</p>
            <div className="flex gap-4 items-center">
              <div 
                className="w-20 h-10 rounded-md flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: `hsl(${themePrimary})` }}
              >
                Primario
              </div>
              <div 
                className="w-20 h-10 rounded-md flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: `hsl(${themeSecondary})` }}
              >
                Secundario
              </div>
              <div 
                className="w-20 h-10 rounded-md flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: `hsl(${themeAccent})` }}
              >
                Acento
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSettingsPanel;
