import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Tag, Percent, DollarSign, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DiscountCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_purchase: number | null;
  max_uses: number | null;
  uses_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

interface CodeFormData {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_purchase: string;
  max_uses: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

const initialFormData: CodeFormData = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  min_purchase: "",
  max_uses: "",
  valid_from: "",
  valid_until: "",
  is_active: true,
};

export const DiscountCodesPanel = () => {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [formData, setFormData] = useState<CodeFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Statistics
  const totalCodes = codes.length;
  const activeCodes = codes.filter(c => c.is_active).length;
  const totalUses = codes.reduce((sum, c) => sum + c.uses_count, 0);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase
        .from("discount_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCodes(data || []);
    } catch (error) {
      console.error("Error fetching codes:", error);
      toast.error("Error al cargar los códigos");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingCode(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };

  const openEditDialog = (code: DiscountCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      discount_type: code.discount_type as "percentage" | "fixed",
      discount_value: code.discount_value.toString(),
      min_purchase: code.min_purchase?.toString() || "",
      max_uses: code.max_uses?.toString() || "",
      valid_from: code.valid_from ? code.valid_from.slice(0, 16) : "",
      valid_until: code.valid_until ? code.valid_until.slice(0, 16) : "",
      is_active: code.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim() || !formData.discount_value) {
      toast.error("Código y valor de descuento son requeridos");
      return;
    }

    const discountValue = parseFloat(formData.discount_value);
    if (isNaN(discountValue) || discountValue <= 0) {
      toast.error("Valor de descuento inválido");
      return;
    }

    if (formData.discount_type === "percentage" && discountValue > 100) {
      toast.error("El porcentaje no puede ser mayor a 100%");
      return;
    }

    setSubmitting(true);

    try {
      const codeData = {
        code: formData.code.toUpperCase().trim(),
        discount_type: formData.discount_type,
        discount_value: discountValue,
        min_purchase: formData.min_purchase ? parseFloat(formData.min_purchase) : 0,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null,
        is_active: formData.is_active,
      };

      if (editingCode) {
        const { error } = await supabase
          .from("discount_codes")
          .update(codeData)
          .eq("id", editingCode.id);

        if (error) throw error;
        toast.success("Código actualizado");
      } else {
        const { error } = await supabase
          .from("discount_codes")
          .insert(codeData);

        if (error) {
          if (error.code === "23505") {
            toast.error("Ya existe un código con ese nombre");
            return;
          }
          throw error;
        }
        toast.success("Código creado");
      }

      setDialogOpen(false);
      fetchCodes();
    } catch (error) {
      console.error("Error saving code:", error);
      toast.error("Error al guardar el código");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCodeStatus = async (code: DiscountCode) => {
    try {
      const { error } = await supabase
        .from("discount_codes")
        .update({ is_active: !code.is_active })
        .eq("id", code.id);

      if (error) throw error;

      setCodes(prev =>
        prev.map(c =>
          c.id === code.id ? { ...c, is_active: !c.is_active } : c
        )
      );

      toast.success(code.is_active ? "Código desactivado" : "Código activado");
    } catch (error) {
      console.error("Error toggling code:", error);
      toast.error("Error al cambiar el estado");
    }
  };

  const deleteCode = async (code: DiscountCode) => {
    if (!confirm(`¿Eliminar el código "${code.code}"?`)) return;

    try {
      const { error } = await supabase
        .from("discount_codes")
        .delete()
        .eq("id", code.id);

      if (error) throw error;

      setCodes(prev => prev.filter(c => c.id !== code.id));
      toast.success("Código eliminado");
    } catch (error) {
      console.error("Error deleting code:", error);
      toast.error("Error al eliminar el código");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCodes}</p>
                <p className="text-sm text-muted-foreground">Códigos totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Percent className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCodes}</p>
                <p className="text-sm text-muted-foreground">Códigos activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUses}</p>
                <p className="text-sm text-muted-foreground">Usos totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Códigos de Descuento</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Crear Código
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCode ? "Editar Código" : "Crear Código de Descuento"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))
                  }
                  placeholder="DESCUENTO20"
                  disabled={!!editingCode}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de descuento</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: "percentage" | "fixed") =>
                      setFormData(prev => ({ ...prev, discount_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                      <SelectItem value="fixed">Monto fijo ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    Valor {formData.discount_type === "percentage" ? "(%)" : "($)"}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, discount_value: e.target.value }))
                    }
                    placeholder={formData.discount_type === "percentage" ? "20" : "100"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_purchase">Compra mínima ($)</Label>
                  <Input
                    id="min_purchase"
                    type="number"
                    value={formData.min_purchase}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, min_purchase: e.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_uses">Usos máximos</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, max_uses: e.target.value }))
                    }
                    placeholder="Ilimitado"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Válido desde</Label>
                  <Input
                    id="valid_from"
                    type="datetime-local"
                    value={formData.valid_from}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, valid_from: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_until">Válido hasta</Label>
                  <Input
                    id="valid_until"
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, valid_until: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Código activo</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, is_active: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingCode ? (
                    "Guardar"
                  ) : (
                    "Crear"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      {codes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay códigos de descuento</p>
            <Button onClick={openCreateDialog} variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Crear primer código
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Mín. compra</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Válido hasta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <span className="font-mono font-bold">{code.code}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {code.discount_type === "percentage"
                          ? `${code.discount_value}%`
                          : `$${code.discount_value}`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {code.min_purchase ? `$${code.min_purchase}` : "-"}
                    </TableCell>
                    <TableCell>
                      {code.uses_count}
                      {code.max_uses && ` / ${code.max_uses}`}
                    </TableCell>
                    <TableCell>{formatDate(code.valid_until)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={code.is_active}
                        onCheckedChange={() => toggleCodeStatus(code)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(code)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCode(code)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};
