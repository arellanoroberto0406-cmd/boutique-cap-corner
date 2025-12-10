import { useState, useEffect } from 'react';
import { useSiteSettings, HelpLink } from '@/hooks/useSiteSettings';
import { useThemePresets, ThemePreset } from '@/hooks/useThemePresets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Save, Plus, Trash2, MapPin, Mail, Phone, Clock, Link, ExternalLink, Info, Building2, FileText, Upload, X, Palette, Check, Download, Music, Video, Image } from 'lucide-react';
import RichTextEditor from '@/components/ui/rich-text-editor';
import ColorPicker from '@/components/ui/color-picker';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';

const SiteSettingsPanel = () => {
  const { settings, isLoading, updateSetting, updateHelpLinks, isUpdating } = useSiteSettings();
  const { presets, isLoading: presetsLoading, createPreset, deletePreset, isCreating, isDeleting } = useThemePresets();
  
  // Company state
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // Background music state
  const [backgroundMusic, setBackgroundMusic] = useState('');
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  
  // Hero video state
  const [heroVideo, setHeroVideo] = useState('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  
  // Promo video state
  const [promoVideo, setPromoVideo] = useState('');
  const [isUploadingPromoVideo, setIsUploadingPromoVideo] = useState(false);
  
  // About Us state
  const [aboutUs, setAboutUs] = useState('');

  // Contact form state
  const [contactLocation, setContactLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactPhone2, setContactPhone2] = useState('');
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

  // Map settings state
  const [mapAddress, setMapAddress] = useState('');
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');

  // Theme colors state
  const [themePrimary, setThemePrimary] = useState('');
  const [themeSecondary, setThemeSecondary] = useState('');
  const [themeAccent, setThemeAccent] = useState('');
  const [themeBackground, setThemeBackground] = useState('');
  const [themeForeground, setThemeForeground] = useState('');
  const [themeCard, setThemeCard] = useState('');
  const [themeMuted, setThemeMuted] = useState('');
  
  // Theme preset state
  const [newPresetName, setNewPresetName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // Initialize form with current settings
  useEffect(() => {
    if (settings) {
      setCompanyName(settings.company_name);
      setCompanyLogo(settings.company_logo);
      setBackgroundMusic(settings.background_music || '');
      setHeroVideo(settings.hero_video || '');
      setPromoVideo(settings.promo_video || '');
      setAboutUs(settings.about_us);
      setContactLocation(settings.contact_location);
      setContactEmail(settings.contact_email);
      setContactPhone(settings.contact_phone);
      setContactPhone2(settings.contact_phone_2);
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
      setThemeBackground(settings.theme_background);
      setThemeForeground(settings.theme_foreground);
      setThemeCard(settings.theme_card);
      setThemeMuted(settings.theme_muted);
      setMapAddress(settings.map_address || '');
      setMapEmbedUrl(settings.map_embed_url || '');
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

  const handleMusicUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isAudio = file.type.startsWith('audio/');
    const isVideo = file.type.startsWith('video/');

    if (!isAudio && !isVideo) {
      toast.error('Por favor selecciona un archivo de audio o video');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('El archivo debe ser menor a 100MB');
      return;
    }

    setIsUploadingMusic(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `background-music-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('brand-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('brand-logos')
        .getPublicUrl(fileName);

      setBackgroundMusic(publicUrl);
      updateSetting('background_music', publicUrl);
      toast.success(isVideo ? 'Video con música actualizado' : 'Música de fondo actualizada');
    } catch (error) {
      console.error('Error uploading music:', error);
      toast.error('Error al subir el archivo');
    } finally {
      setIsUploadingMusic(false);
    }
  };

  const handleRemoveMusic = () => {
    setBackgroundMusic('');
    updateSetting('background_music', '');
    toast.success('Música de fondo eliminada');
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Por favor selecciona un archivo de video');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('El video debe ser menor a 100MB');
      return;
    }

    setIsUploadingVideo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-video-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('brand-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('brand-logos')
        .getPublicUrl(fileName);

      setHeroVideo(publicUrl);
      updateSetting('hero_video', publicUrl);
      toast.success('Video del hero actualizado');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Error al subir el video');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleRemoveVideo = () => {
    setHeroVideo('');
    updateSetting('hero_video', '');
    toast.success('Video eliminado (se usará el predeterminado)');
  };

  const handlePromoVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      toast.error('Por favor selecciona un video o una imagen');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('El archivo debe ser menor a 100MB');
      return;
    }

    setIsUploadingPromoVideo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `promo-media-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('brand-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('brand-logos')
        .getPublicUrl(fileName);

      setPromoVideo(publicUrl);
      updateSetting('promo_video', publicUrl);
      toast.success(isVideo ? 'Video promocional actualizado' : 'Imagen promocional actualizada');
    } catch (error) {
      console.error('Error uploading promo media:', error);
      toast.error('Error al subir el archivo');
    } finally {
      setIsUploadingPromoVideo(false);
    }
  };

  const handleRemovePromoVideo = () => {
    setPromoVideo('');
    updateSetting('promo_video', '');
    toast.success('Contenido promocional eliminado');
  };

  const handleSaveAboutUs = () => {
    updateSetting('about_us', aboutUs);
    toast.success('Texto "Sobre Nosotros" actualizado');
  };

  const handleSaveContact = () => {
    updateSetting('contact_location', contactLocation);
    updateSetting('contact_email', contactEmail);
    updateSetting('contact_phone', contactPhone);
    updateSetting('contact_phone_2', contactPhone2);
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

  const handleSaveMap = () => {
    updateSetting('map_address', mapAddress);
    updateSetting('map_embed_url', mapEmbedUrl);
    toast.success('Configuración del mapa actualizada');
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

      {/* Background Music */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Música de Fondo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
          <Label>Audio o video con música para la tienda</Label>
          <p className="text-sm text-muted-foreground">
            Sube un archivo de audio (MP3) o video (MP4, MOV) que se reproducirá de fondo en tu tienda. La música solo suena en las páginas de la tienda, no en el admin.
          </p>
            {backgroundMusic ? (
              <div className="flex items-center gap-4">
                <div className="flex-1 p-4 border border-border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {backgroundMusic.match(/\.(mp4|mov|webm|avi)$/i) ? (
                      <Video className="h-8 w-8 text-primary" />
                    ) : (
                      <Music className="h-8 w-8 text-primary" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {backgroundMusic.match(/\.(mp4|mov|webm|avi)$/i) ? 'Video con música' : 'Audio personalizado'}
                      </p>
                      {backgroundMusic.match(/\.(mp4|mov|webm|avi)$/i) ? (
                        <video controls className="w-full mt-2 h-24 rounded">
                          <source src={backgroundMusic} />
                        </video>
                      ) : (
                        <audio controls className="w-full mt-2 h-8">
                          <source src={backgroundMusic} />
                        </audio>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={handleRemoveMusic}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center w-full max-w-xs p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleMusicUpload}
                    className="hidden"
                    disabled={isUploadingMusic}
                  />
                  {isUploadingMusic ? (
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <div className="flex gap-2 mb-2">
                        <Music className="h-6 w-6 text-muted-foreground" />
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground text-center">Subir audio o video</span>
                    </>
                  )}
                </label>
              <div className="text-sm text-muted-foreground">
                <p>Audio: MP3, WAV, OGG, M4A</p>
                <p>Video: MP4, MOV, WebM</p>
                <p>Tamaño máximo: 100MB</p>
              </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hero Video */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video del Hero
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Label>Video de fondo de la página principal</Label>
            <p className="text-sm text-muted-foreground">
              Sube un video que aparecerá en la sección principal de tu tienda. Si no subes ninguno, se usará el video predeterminado.
            </p>
            {heroVideo ? (
              <div className="flex items-center gap-4">
                <div className="flex-1 p-4 border border-border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Video className="h-8 w-8 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Video personalizado</p>
                      <video controls className="w-full mt-2 max-h-40 rounded">
                        <source src={heroVideo} />
                      </video>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={handleRemoveVideo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center w-full max-w-xs p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    disabled={isUploadingVideo}
                  />
                  {isUploadingVideo ? (
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Video className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground text-center">Subir video</span>
                    </>
                  )}
                </label>
              <div className="text-sm text-muted-foreground">
                <p>Formatos: MP4, MOV, WebM</p>
                <p>Tamaño máximo: 100MB</p>
              </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Promo Video/Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Contenido Promocional (Video o Imagen)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Label>Video o imagen que aparece después de los productos destacados</Label>
            <p className="text-sm text-muted-foreground">
              Este contenido se mostrará en una sección especial entre los productos destacados y el catálogo principal. Puedes subir un video o una imagen. Si no subes nada, la sección no aparecerá.
            </p>
            {promoVideo ? (
              <div className="flex items-center gap-4">
                <div className="flex-1 p-4 border border-border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {promoVideo.match(/\.(mp4|mov|webm)$/i) || promoVideo.includes('video') ? (
                      <>
                        <Video className="h-8 w-8 text-primary flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Video promocional activo</p>
                          <video controls className="w-full mt-2 max-h-40 rounded">
                            <source src={promoVideo} />
                          </video>
                        </div>
                      </>
                    ) : (
                      <>
                        <Image className="h-8 w-8 text-primary flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Imagen promocional activa</p>
                          <img src={promoVideo} alt="Promo" className="w-full mt-2 max-h-40 rounded object-cover" />
                        </div>
                      </>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={handleRemovePromoVideo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center w-full max-w-xs p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="video/*,image/*"
                    onChange={handlePromoVideoUpload}
                    className="hidden"
                    disabled={isUploadingPromoVideo}
                  />
                  {isUploadingPromoVideo ? (
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <div className="flex gap-2 mb-2">
                        <Video className="h-6 w-6 text-muted-foreground" />
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground text-center">Subir video o imagen</span>
                    </>
                  )}
                </label>
              <div className="text-sm text-muted-foreground">
                <p>Videos: MP4, MOV, WebM</p>
                <p>Imágenes: JPG, PNG, WebP</p>
                <p>Tamaño máximo: 100MB</p>
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
              <Label htmlFor="phone">Teléfono 1</Label>
              <Input
                id="phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+52 123 456 7890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone2">Teléfono 2 (opcional)</Label>
              <Input
                id="phone2"
                value={contactPhone2}
                onChange={(e) => setContactPhone2(e.target.value)}
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

      {/* Map Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configura el mapa interactivo que aparece en el footer de la tienda.
          </p>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mapAddress">Dirección completa</Label>
              <Input
                id="mapAddress"
                value={mapAddress}
                onChange={(e) => setMapAddress(e.target.value)}
                placeholder="C. Puebla 41, Centro, 63000 Tepic, Nay., México"
              />
              <p className="text-xs text-muted-foreground">
                Esta dirección se usará para el enlace "Abrir en Google Maps"
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mapEmbedUrl">URL de incrustación de Google Maps</Label>
              <Textarea
                id="mapEmbedUrl"
                value={mapEmbedUrl}
                onChange={(e) => setMapEmbedUrl(e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Para obtener esta URL: Ve a Google Maps → Busca tu ubicación → Compartir → Incorporar un mapa → Copia solo la URL del src
              </p>
            </div>
            {mapEmbedUrl && (
              <div className="space-y-2">
                <Label>Vista previa del mapa</Label>
                <div className="rounded-lg overflow-hidden border border-border">
                  <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    loading="lazy"
                    title="Vista previa del mapa"
                  />
                </div>
              </div>
            )}
          </div>
          <Button onClick={handleSaveMap} disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Mapa
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
          {/* Theme Presets Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Temas Guardados</h4>
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar tema actual
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Guardar tema personalizado</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="presetName">Nombre del tema</Label>
                      <Input
                        id="presetName"
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        placeholder="Mi tema personalizado"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <div className="w-8 h-8 rounded" style={{ backgroundColor: `hsl(${themePrimary})` }} />
                      <div className="w-8 h-8 rounded" style={{ backgroundColor: `hsl(${themeSecondary})` }} />
                      <div className="w-8 h-8 rounded" style={{ backgroundColor: `hsl(${themeAccent})` }} />
                      <div className="w-8 h-8 rounded border" style={{ backgroundColor: `hsl(${themeBackground})` }} />
                      <div className="w-8 h-8 rounded" style={{ backgroundColor: `hsl(${themeCard})` }} />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button 
                      onClick={async () => {
                        if (!newPresetName.trim()) {
                          toast.error('Por favor ingresa un nombre para el tema');
                          return;
                        }
                        try {
                          await createPreset({
                            name: newPresetName,
                            theme_primary: themePrimary,
                            theme_secondary: themeSecondary,
                            theme_accent: themeAccent,
                            theme_background: themeBackground,
                            theme_foreground: themeForeground,
                            theme_card: themeCard,
                            theme_muted: themeMuted,
                          });
                          toast.success('Tema guardado correctamente');
                          setNewPresetName('');
                          setSaveDialogOpen(false);
                        } catch (error) {
                          toast.error('Error al guardar el tema');
                        }
                      }}
                      disabled={isCreating}
                    >
                      {isCreating ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {presetsLoading ? (
              <div className="text-sm text-muted-foreground">Cargando temas...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="relative group border rounded-lg p-3 hover:border-primary transition-colors cursor-pointer"
                    onClick={() => {
                      setThemePrimary(preset.theme_primary);
                      setThemeSecondary(preset.theme_secondary);
                      setThemeAccent(preset.theme_accent);
                      setThemeBackground(preset.theme_background);
                      setThemeForeground(preset.theme_foreground);
                      setThemeCard(preset.theme_card);
                      setThemeMuted(preset.theme_muted);
                      
                      updateSetting('theme_primary', preset.theme_primary);
                      updateSetting('theme_secondary', preset.theme_secondary);
                      updateSetting('theme_accent', preset.theme_accent);
                      updateSetting('theme_background', preset.theme_background);
                      updateSetting('theme_foreground', preset.theme_foreground);
                      updateSetting('theme_card', preset.theme_card);
                      updateSetting('theme_muted', preset.theme_muted);
                      
                      toast.success(`Tema "${preset.name}" aplicado`);
                    }}
                  >
                    <div className="flex gap-1 mb-2">
                      <div className="w-6 h-6 rounded-sm" style={{ backgroundColor: `hsl(${preset.theme_primary})` }} />
                      <div className="w-6 h-6 rounded-sm" style={{ backgroundColor: `hsl(${preset.theme_secondary})` }} />
                      <div className="w-6 h-6 rounded-sm" style={{ backgroundColor: `hsl(${preset.theme_accent})` }} />
                      <div className="w-6 h-6 rounded-sm border" style={{ backgroundColor: `hsl(${preset.theme_background})` }} />
                    </div>
                    <p className="text-xs font-medium truncate">{preset.name}</p>
                    {preset.is_default && (
                      <span className="text-[10px] text-muted-foreground">Por defecto</span>
                    )}
                    {!preset.is_default && (
                      <button
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePreset(preset.id);
                          toast.success('Tema eliminado');
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Separator />
          
          <p className="text-sm text-muted-foreground">
            Personaliza los colores de tu tienda. Los cambios se aplicarán inmediatamente.
          </p>

          <div className="space-y-4">
            <h4 className="font-medium text-sm">Colores Principales</h4>
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
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Colores de Fondo y Texto</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ColorPicker
                label="Fondo Principal"
                value={themeBackground}
                onChange={(value) => {
                  setThemeBackground(value);
                  updateSetting('theme_background', value);
                }}
              />
              
              <ColorPicker
                label="Texto Principal"
                value={themeForeground}
                onChange={(value) => {
                  setThemeForeground(value);
                  updateSetting('theme_foreground', value);
                }}
              />
              
              <ColorPicker
                label="Fondo de Tarjetas"
                value={themeCard}
                onChange={(value) => {
                  setThemeCard(value);
                  updateSetting('theme_card', value);
                }}
              />
              
              <ColorPicker
                label="Color Atenuado (Bordes)"
                value={themeMuted}
                onChange={(value) => {
                  setThemeMuted(value);
                  updateSetting('theme_muted', value);
                }}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Vista previa de colores:</p>
            <div className="flex flex-wrap gap-3">
              <div 
                className="w-16 h-16 rounded-md flex items-center justify-center text-xs font-medium border"
                style={{ backgroundColor: `hsl(${themePrimary})`, color: `hsl(${themeForeground})` }}
              >
                Primario
              </div>
              <div 
                className="w-16 h-16 rounded-md flex items-center justify-center text-xs font-medium border"
                style={{ backgroundColor: `hsl(${themeSecondary})`, color: `hsl(${themeForeground})` }}
              >
                Secundario
              </div>
              <div 
                className="w-16 h-16 rounded-md flex items-center justify-center text-xs font-medium border"
                style={{ backgroundColor: `hsl(${themeAccent})`, color: `hsl(${themeForeground})` }}
              >
                Acento
              </div>
              <div 
                className="w-16 h-16 rounded-md flex items-center justify-center text-xs font-medium border"
                style={{ backgroundColor: `hsl(${themeBackground})`, color: `hsl(${themeForeground})` }}
              >
                Fondo
              </div>
              <div 
                className="w-16 h-16 rounded-md flex items-center justify-center text-xs font-medium border"
                style={{ backgroundColor: `hsl(${themeCard})`, color: `hsl(${themeForeground})` }}
              >
                Tarjeta
              </div>
              <div 
                className="w-16 h-16 rounded-md flex items-center justify-center text-xs font-medium border"
                style={{ backgroundColor: `hsl(${themeMuted})`, color: `hsl(${themeForeground})` }}
              >
                Atenuado
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSettingsPanel;
