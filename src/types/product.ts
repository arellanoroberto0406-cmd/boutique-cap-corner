export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  colors: string[];
  collection: string;
  stock: number;
  description: string;
  isNew?: boolean;
  isOnSale?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
}

export type FilterOptions = {
  colors: string[];
  collections: string[];
  priceRange: [number, number];
  inStock: boolean;
};
