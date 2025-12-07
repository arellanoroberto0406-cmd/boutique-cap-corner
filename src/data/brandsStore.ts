// Store de marcas y productos sincronizado con localStorage
import brandBassPro from '@/assets/brand-bass-pro-new.png';
import brandJC from '@/assets/brand-jc-new.png';
import brandRanchCorral from '@/assets/brand-ranch-corral-new.png';
import brandBarba from '@/assets/brand-barba-new.png';
import brandFino from '@/assets/brand-fino-new.png';
import brand31 from '@/assets/brand-31-new.png';
import brandDandy from '@/assets/brand-dandy.png';

import capDiamondM from '@/assets/cap-diamond-m.jpg';
import capFino from '@/assets/cap-fino.jpg';
import capMtlt27 from '@/assets/cap-mtlt-27.jpg';
import capThreeStars from '@/assets/cap-three-stars.jpg';
import capGraffiti from '@/assets/cap-graffiti.jpg';
import capBlack from '@/assets/cap-black.jpg';
import capNavy from '@/assets/cap-navy.jpg';
import capRed from '@/assets/cap-red.jpg';
import capWhite from '@/assets/cap-white.jpg';

export interface BrandProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  salePrice?: number;
  freeShipping?: boolean;
  shippingCost?: number;
  images?: string[];
  description?: string;
  hasFullSet?: boolean;
  onlyCap?: boolean;
  onlyCapPrice?: number;
  stock?: number;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  path: string;
  products: BrandProduct[];
}

// Mapa de imágenes disponibles para nuevos productos
export const availableCapImages: { [key: string]: string } = {
  'cap-diamond-m': capDiamondM,
  'cap-fino': capFino,
  'cap-mtlt-27': capMtlt27,
  'cap-three-stars': capThreeStars,
  'cap-graffiti': capGraffiti,
  'cap-black': capBlack,
  'cap-navy': capNavy,
  'cap-red': capRed,
  'cap-white': capWhite,
};

// Datos iniciales
const initialBrands: Brand[] = [
  {
    id: 'bass-pro',
    name: 'Bass Pro Shops',
    logo: brandBassPro,
    path: '/bass-pro-shops',
    products: [
      { id: 'bp1', name: 'Gorra Bass Pro Classic', image: capNavy, price: 899 },
      { id: 'bp2', name: 'Gorra Bass Pro Camo', image: capBlack, price: 799 },
      { id: 'bp3', name: 'Gorra Bass Pro Sport', image: capRed, price: 749 },
    ]
  },
  {
    id: 'jc-hats',
    name: 'JC Hats',
    logo: brandJC,
    path: '/jc-hats',
    products: [
      { id: 'jc1', name: 'JC Premium Edition', image: capDiamondM, price: 999 },
      { id: 'jc2', name: 'JC Classic Black', image: capBlack, price: 849 },
      { id: 'jc3', name: 'JC Urban Style', image: capGraffiti, price: 899 },
    ]
  },
  {
    id: 'ranch-corral',
    name: 'Ranch Corral',
    logo: brandRanchCorral,
    path: '/ranch-corral',
    products: [
      { id: 'rc1', name: 'Ranch Corral Vaquero', image: capThreeStars, price: 1099 },
      { id: 'rc2', name: 'Ranch Corral Classic', image: capNavy, price: 949 },
      { id: 'rc3', name: 'Ranch Corral Premium', image: capWhite, price: 1199 },
    ]
  },
  {
    id: 'barba-hats',
    name: 'Barba Hats',
    logo: brandBarba,
    path: '/barba-hats',
    products: [
      { id: 'bh1', name: 'Barba Premium', image: capDiamondM, price: 899 },
      { id: 'bh2', name: 'Barba Classic', image: capBlack, price: 749 },
      { id: 'bh3', name: 'Barba Sport', image: capRed, price: 699 },
    ]
  },
  {
    id: 'gallo-fino',
    name: 'Gallo Fino',
    logo: brandFino,
    path: '/gallo-fino',
    products: [
      { id: 'gf1', name: 'Gallo Fino Edition', image: capFino, price: 899 },
      { id: 'gf2', name: 'Gallo Fino Black', image: capBlack, price: 849 },
      { id: 'gf3', name: 'Gallo Fino Premium', image: capMtlt27, price: 999 },
    ]
  },
  {
    id: 'marca-31',
    name: 'Marca 31',
    logo: brand31,
    path: '/marca-31',
    products: [
      { id: 'm31-1', name: 'Marca 31 Original', image: capThreeStars, price: 799 },
      { id: 'm31-2', name: 'Marca 31 Premium', image: capDiamondM, price: 899 },
      { id: 'm31-3', name: 'Marca 31 Sport', image: capRed, price: 749 },
    ]
  },
  {
    id: 'dandy-hats',
    name: 'Dandy Hats',
    logo: brandDandy,
    path: '/dandy-hats',
    products: [
      { id: 'dh1', name: 'Dandy Classic', image: capNavy, price: 849 },
      { id: 'dh2', name: 'Dandy Premium', image: capWhite, price: 949 },
      { id: 'dh3', name: 'Dandy Urban', image: capGraffiti, price: 799 },
    ]
  },
];

const STORAGE_KEY = 'store_brands';

// Obtener marcas del localStorage o usar las iniciales
export const getBrands = (): Brand[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Primera vez: guardar datos iniciales
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBrands));
  return initialBrands;
};

// Guardar marcas en localStorage
export const saveBrands = (brands: Brand[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(brands));
};

// Eliminar una marca
export const deleteBrand = (brandId: string): Brand[] => {
  const brands = getBrands();
  const updated = brands.filter(b => b.id !== brandId);
  saveBrands(updated);
  return updated;
};

// Eliminar un producto de una marca
export const deleteProduct = (brandId: string, productId: string): Brand[] => {
  const brands = getBrands();
  const updated = brands.map(brand => {
    if (brand.id === brandId) {
      return {
        ...brand,
        products: brand.products.filter(p => p.id !== productId)
      };
    }
    return brand;
  });
  saveBrands(updated);
  return updated;
};

// Agregar un producto a una marca
export const addProduct = (brandId: string, product: Omit<BrandProduct, 'id'>): Brand[] => {
  const brands = getBrands();
  const updated = brands.map(brand => {
    if (brand.id === brandId) {
      return {
        ...brand,
        products: [
          ...brand.products,
          {
            ...product,
            id: `${brandId}-${Date.now()}`
          }
        ]
      };
    }
    return brand;
  });
  saveBrands(updated);
  return updated;
};

// Obtener una marca por su path
export const getBrandByPath = (path: string): Brand | undefined => {
  const brands = getBrands();
  return brands.find(b => b.path === path);
};
