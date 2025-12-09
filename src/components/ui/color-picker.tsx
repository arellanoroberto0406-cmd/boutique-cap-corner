import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  label: string;
  value: string; // HSL format: "12 90% 55%"
  onChange: (value: string) => void;
  presets?: { name: string; value: string }[];
}

// Convert HSL string to hex for display
const hslToHex = (hsl: string): string => {
  const parts = hsl.split(' ').map(p => parseFloat(p));
  if (parts.length !== 3) return '#ff6b35';
  
  const h = parts[0];
  const s = parts[1] / 100;
  const l = parts[2] / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Convert hex to HSL string
const hexToHsl = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '12 90% 55%';

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const defaultPresets = [
  { name: 'Naranja', value: '12 90% 55%' },
  { name: 'Azul', value: '221 83% 53%' },
  { name: 'Verde', value: '142 70% 45%' },
  { name: 'Rojo', value: '0 84% 60%' },
  { name: 'Morado', value: '270 70% 55%' },
  { name: 'Rosa', value: '330 80% 60%' },
  { name: 'Cyan', value: '180 70% 45%' },
  { name: 'Amarillo', value: '45 100% 51%' },
];

const ColorPicker = ({ label, value, onChange, presets = defaultPresets }: ColorPickerProps) => {
  const [hexValue, setHexValue] = useState(hslToHex(value));

  useEffect(() => {
    setHexValue(hslToHex(value));
  }, [value]);

  const handleHexChange = (hex: string) => {
    setHexValue(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hexToHsl(hex));
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-12 h-10 p-1 border-2"
              style={{ backgroundColor: `hsl(${value})` }}
            >
              <span className="sr-only">Elegir color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Colores predefinidos</Label>
                <div className="grid grid-cols-4 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => onChange(preset.value)}
                      className={cn(
                        "w-10 h-10 rounded-md border-2 transition-all hover:scale-110",
                        value === preset.value ? "border-foreground ring-2 ring-offset-2 ring-foreground" : "border-border"
                      )}
                      style={{ backgroundColor: `hsl(${preset.value})` }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Color personalizado</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={hexValue}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={hexValue}
                    onChange={(e) => handleHexChange(e.target.value)}
                    placeholder="#ff6b35"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <div className="flex-1">
          <Input
            type="text"
            value={hexValue}
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder="#ff6b35"
          />
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
