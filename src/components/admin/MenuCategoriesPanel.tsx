import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, ChevronDown, ChevronUp, GripVertical, X } from "lucide-react";
import { 
  getMenuCategories, 
  saveMenuCategories, 
  MenuCategory, 
  MenuItem 
} from "@/data/menuCategoriesStore";

const MenuCategoriesPanel = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formItems, setFormItems] = useState<MenuItem[]>([{ name: "", path: "" }]);
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    loadCategories();
    
    const handleUpdate = () => loadCategories();
    window.addEventListener('menuCategoriesUpdated', handleUpdate);
    return () => window.removeEventListener('menuCategoriesUpdated', handleUpdate);
  }, []);

  const loadCategories = () => {
    setCategories(getMenuCategories());
  };

  const resetForm = () => {
    setFormTitle("");
    setFormItems([{ name: "", path: "" }]);
    setFormIsActive(true);
    setEditingCategory(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: MenuCategory) => {
    setEditingCategory(category);
    setFormTitle(category.title);
    setFormItems(category.items.length > 0 ? [...category.items] : [{ name: "", path: "" }]);
    setFormIsActive(category.isActive);
    setIsDialogOpen(true);
  };

  const handleAddItem = () => {
    setFormItems([...formItems, { name: "", path: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: 'name' | 'path', value: string) => {
    const newItems = [...formItems];
    newItems[index][field] = value;
    setFormItems(newItems);
  };

  const handleSubmit = () => {
    if (!formTitle.trim()) {
      toast({
        title: "Error",
        description: "El título de la categoría es requerido",
        variant: "destructive",
      });
      return;
    }

    const validItems = formItems.filter(item => item.name.trim() && item.path.trim());
    
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Agrega al menos un ítem válido con nombre y ruta",
        variant: "destructive",
      });
      return;
    }

    const allCategories = getMenuCategories();

    if (editingCategory) {
      // Actualizar categoría existente
      const index = allCategories.findIndex(c => c.id === editingCategory.id);
      if (index !== -1) {
        allCategories[index] = {
          ...editingCategory,
          title: formTitle.toUpperCase(),
          items: validItems,
          isActive: formIsActive,
        };
      }
      toast({
        title: "Categoría actualizada",
        description: `La categoría "${formTitle}" ha sido actualizada`,
      });
    } else {
      // Crear nueva categoría
      const newCategory: MenuCategory = {
        id: formTitle.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        title: formTitle.toUpperCase(),
        items: validItems,
        isActive: formIsActive,
      };
      allCategories.push(newCategory);
      toast({
        title: "Categoría creada",
        description: `La categoría "${formTitle}" ha sido creada`,
      });
    }

    saveMenuCategories(allCategories);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`¿Estás seguro de eliminar la categoría "${title}"?`)) {
      const filtered = categories.filter(c => c.id !== id);
      saveMenuCategories(filtered);
      toast({
        title: "Categoría eliminada",
        description: `La categoría "${title}" ha sido eliminada`,
      });
    }
  };

  const handleToggleActive = (id: string) => {
    const allCategories = getMenuCategories();
    const index = allCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      allCategories[index].isActive = !allCategories[index].isActive;
      saveMenuCategories(allCategories);
      toast({
        title: allCategories[index].isActive ? "Categoría activada" : "Categoría desactivada",
      });
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newCategories = [...categories];
    [newCategories[index - 1], newCategories[index]] = [newCategories[index], newCategories[index - 1]];
    saveMenuCategories(newCategories);
  };

  const handleMoveDown = (index: number) => {
    if (index === categories.length - 1) return;
    const newCategories = [...categories];
    [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
    saveMenuCategories(newCategories);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Categorías del Menú ({categories.length})</h3>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Categoría
        </Button>
      </div>

      <div className="space-y-2">
        {categories.map((category, index) => (
          <Card key={category.id} className={!category.isActive ? "opacity-50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {/* Controles de orden */}
                <div className="flex flex-col gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === categories.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* Contenido principal */}
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <GripVertical className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold">{category.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {category.items.length} ítem(s)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={category.isActive}
                    onCheckedChange={() => handleToggleActive(category.id)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openEditDialog(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(category.id, category.title)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* Items expandidos */}
              {expandedCategory === category.id && (
                <div className="mt-4 pl-16 space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <div 
                      key={itemIndex}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm"
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-muted-foreground">{item.path}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para crear/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título de la Categoría</Label>
              <Input
                id="title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ej: ACCESORIOS"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Ítems del Menú</Label>
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>
              
              <div className="space-y-3">
                {formItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Nombre (ej: Pines)"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Ruta (ej: /pines)"
                        value={item.path}
                        onChange={(e) => handleItemChange(index, 'path', e.target.value)}
                      />
                    </div>
                    {formItems.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
              <Label htmlFor="isActive">Categoría Activa</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                {editingCategory ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuCategoriesPanel;
