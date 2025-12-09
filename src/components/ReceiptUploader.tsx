import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle, Loader2, Image as ImageIcon, X } from "lucide-react";

interface ReceiptUploaderProps {
  orderId: string;
  speiReference?: string;
  total: number;
  onUploadSuccess?: (url: string) => void;
}

const ReceiptUploader = ({ orderId, speiReference, total, onUploadSuccess }: ReceiptUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notificationSent, setNotificationSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato no válido",
        description: "Solo se permiten imágenes (JPG, PNG, WEBP) o PDF",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El archivo no debe superar 10MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${orderId.slice(0, 8)}_${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payment-receipts')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      setUploadedUrl(publicUrl);

      // Update order with receipt URL
      const { error: updateError } = await supabase
        .from('orders')
        .update({ receipt_url: publicUrl })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
      }

      // Send WhatsApp notification to admin about the receipt
      try {
        await supabase.functions.invoke('send-order-whatsapp', {
          body: {
            type: 'receipt_uploaded',
            orderId: orderId,
            speiReference: speiReference,
            total: total,
            receiptUrl: publicUrl,
          },
        });
        setNotificationSent(true);
      } catch (whatsappError) {
        console.error('Error sending WhatsApp notification:', whatsappError);
      }

      toast({
        title: "¡Comprobante subido!",
        description: "Tu comprobante fue enviado correctamente. Te contactaremos pronto.",
      });

      onUploadSuccess?.(publicUrl);
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast({
        title: "Error al subir",
        description: "No se pudo subir el comprobante. Intenta de nuevo.",
        variant: "destructive",
      });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const clearUpload = () => {
    setPreviewUrl(null);
    setUploadedUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (uploadedUrl) {
    return (
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">
              ¡Comprobante enviado correctamente!
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              {notificationSent ? "Hemos notificado al vendedor" : "Tu pago está siendo procesado"}
            </p>
          </div>
        </div>
        {previewUrl && (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Comprobante de pago" 
              className="w-full max-h-48 object-contain rounded-lg border border-green-300"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-start gap-3 mb-4">
        <Upload className="h-6 w-6 text-blue-600 mt-0.5" />
        <div>
          <p className="font-medium text-blue-800 dark:text-blue-200">
            Sube tu comprobante de pago
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Envía tu comprobante directamente y te notificaremos cuando confirmemos tu pago
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
        id="receipt-upload"
      />

      {previewUrl && !uploadedUrl ? (
        <div className="relative mb-4">
          <img 
            src={previewUrl} 
            alt="Vista previa" 
            className="w-full max-h-48 object-contain rounded-lg border border-blue-300"
          />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={clearUpload}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <label htmlFor="receipt-upload">
        <Button
          type="button"
          variant="outline"
          className="w-full border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Subiendo comprobante...
            </>
          ) : (
            <>
              <ImageIcon className="h-4 w-4 mr-2" />
              Seleccionar imagen o PDF
            </>
          )}
        </Button>
      </label>

      <p className="text-xs text-blue-500 dark:text-blue-400 mt-2 text-center">
        Formatos: JPG, PNG, PDF • Máx: 10MB
      </p>
    </div>
  );
};

export default ReceiptUploader;