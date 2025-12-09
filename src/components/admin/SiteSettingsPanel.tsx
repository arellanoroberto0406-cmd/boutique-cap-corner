import { useState, useEffect } from 'react';
import { useSiteSettings, HelpLink } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Save, Plus, Trash2, MapPin, Mail, Phone, Clock, Link, ExternalLink } from 'lucide-react';

const SiteSettingsPanel = () => {
  const { settings, isLoading, updateSetting, updateHelpLinks, isUpdating } = useSiteSettings();
  
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

  // Initialize form with current settings
  useEffect(() => {
    if (settings) {
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
    }
  }, [settings]);

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
    </div>
  );
};

export default SiteSettingsPanel;
