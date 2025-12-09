// Store para las categorías del menú con persistencia en localStorage

export interface MenuItem {
  name: string;
  path: string;
}

export interface MenuCategory {
  id: string;
  title: string;
  items: MenuItem[];
  isActive: boolean;
}

const STORAGE_KEY = 'menu_categories';

const defaultCategories: MenuCategory[] = [
  {
    id: 'lo-nuevo',
    title: "LO NUEVO",
    items: [
      { name: "Ver Todo", path: "/lo-nuevo" },
    ],
    isActive: true,
  },
  {
    id: 'patrocinadores',
    title: "PATROCINADORES",
    items: [
      { name: "Viyaxi", path: "/viyaxi" },
      { name: "Despacho Contable", path: "/despacho-contable" },
    ],
    isActive: true,
  },
  {
    id: 'estuches',
    title: "ESTUCHES",
    items: [
      { name: "Ver Todos", path: "/estuche-de-gorra" },
    ],
    isActive: true,
  },
  {
    id: 'pines',
    title: "PINES",
    items: [
      { name: "Ver Todos", path: "/pines" },
    ],
    isActive: true,
  },
  {
    id: 'descuentos',
    title: "DESCUENTOS",
    items: [
      { name: "Ofertas Especiales", path: "/" },
      { name: "Liquidación", path: "/" },
    ],
    isActive: true,
  },
];

// Migración: eliminar categorías obsoletas y actualizar rutas
const migrateCategories = (categories: MenuCategory[]): MenuCategory[] => {
  const obsoleteIds = ['accesorios', 'mayoreo'];
  let filtered = categories.filter(c => !obsoleteIds.includes(c.id));
  
  // Actualizar "LO NUEVO" a la nueva ruta
  filtered = filtered.map(c => {
    if (c.id === 'lo-nuevo') {
      return {
        ...c,
        items: [{ name: "Ver Todo", path: "/lo-nuevo" }]
      };
    }
    return c;
  });
  
  // Si hubo cambios, guardar
  if (JSON.stringify(filtered) !== JSON.stringify(categories)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
  
  return filtered;
};

export const getMenuCategories = (): MenuCategory[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const categories = JSON.parse(stored);
    return migrateCategories(categories);
  }
  // Inicializar con valores por defecto
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCategories));
  return defaultCategories;
};

export const saveMenuCategories = (categories: MenuCategory[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  // Disparar evento para actualizar componentes
  window.dispatchEvent(new CustomEvent('menuCategoriesUpdated'));
};

export const addMenuCategory = (category: Omit<MenuCategory, 'id'>): MenuCategory => {
  const categories = getMenuCategories();
  const newCategory: MenuCategory = {
    ...category,
    id: category.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
  };
  categories.push(newCategory);
  saveMenuCategories(categories);
  return newCategory;
};

export const updateMenuCategory = (id: string, updates: Partial<MenuCategory>): void => {
  const categories = getMenuCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updates };
    saveMenuCategories(categories);
  }
};

export const deleteMenuCategory = (id: string): void => {
  const categories = getMenuCategories().filter(c => c.id !== id);
  saveMenuCategories(categories);
};

export const reorderMenuCategories = (categories: MenuCategory[]): void => {
  saveMenuCategories(categories);
};
