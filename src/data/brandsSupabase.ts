// Store de marcas y productos usando Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Cliente sin tipos para las nuevas tablas
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Importar imágenes locales para datos iniciales
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
  brand_id: string;
  name: string;
  image: string;
  price: number;
  full_set_price?: number | null;
  only_cap_price?: number | null;
  description?: string | null;
  stock?: number | null;
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

// Datos iniciales para poblar la base de datos
const initialBrandsData = [
  {
    name: 'Bass Pro Shops',
    logo: brandBassPro,
    path: '/bass-pro-shops',
    products: [
      { name: 'Gorra Bass Pro Classic', image: capNavy, price: 899 },
      { name: 'Gorra Bass Pro Camo', image: capBlack, price: 799 },
      { name: 'Gorra Bass Pro Sport', image: capRed, price: 749 },
    ]
  },
  {
    name: 'JC Hats',
    logo: brandJC,
    path: '/jc-hats',
    products: [
      { name: 'JC Premium Edition', image: capDiamondM, price: 999 },
      { name: 'JC Classic Black', image: capBlack, price: 849 },
      { name: 'JC Urban Style', image: capGraffiti, price: 899 },
    ]
  },
  {
    name: 'Ranch Corral',
    logo: brandRanchCorral,
    path: '/ranch-corral',
    products: [
      { name: 'Ranch Corral Vaquero', image: capThreeStars, price: 1099 },
      { name: 'Ranch Corral Classic', image: capNavy, price: 949 },
      { name: 'Ranch Corral Premium', image: capWhite, price: 1199 },
    ]
  },
  {
    name: 'Barba Hats',
    logo: brandBarba,
    path: '/barba-hats',
    products: [
      { name: 'Barba Premium', image: capDiamondM, price: 899 },
      { name: 'Barba Classic', image: capBlack, price: 749 },
      { name: 'Barba Sport', image: capRed, price: 699 },
    ]
  },
  {
    name: 'Gallo Fino',
    logo: brandFino,
    path: '/gallo-fino',
    products: [
      { name: 'Gallo Fino Edition', image: capFino, price: 899 },
      { name: 'Gallo Fino Black', image: capBlack, price: 849 },
      { name: 'Gallo Fino Premium', image: capMtlt27, price: 999 },
    ]
  },
  {
    name: 'Marca 31',
    logo: brand31,
    path: '/marca-31',
    products: [
      { name: 'Marca 31 Original', image: capThreeStars, price: 799 },
      { name: 'Marca 31 Premium', image: capDiamondM, price: 899 },
      { name: 'Marca 31 Sport', image: capRed, price: 749 },
    ]
  },
  {
    name: 'Dandy Hats',
    logo: brandDandy,
    path: '/dandy-hats',
    products: [
      { name: 'Dandy Classic', image: capNavy, price: 849 },
      { name: 'Dandy Premium', image: capWhite, price: 949 },
      { name: 'Dandy Urban', image: capGraffiti, price: 799 },
    ]
  },
];

// Subir imagen a Supabase Storage  
export const uploadImage = async (file: File): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { error } = await supabaseClient.storage
    .from('product-images')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  const { data: urlData } = supabaseClient.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};

// Inicializar datos si la base de datos está vacía
export const initializeBrands = async (): Promise<void> => {
  const { data: existingBrands, error } = await supabaseClient
    .from('brands')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Error checking brands:', error);
    return;
  }

  // Si ya hay marcas, no hacer nada
  if (existingBrands && existingBrands.length > 0) {
    return;
  }

  // Insertar marcas iniciales
  for (const brandData of initialBrandsData) {
    const { data: newBrand, error: brandError } = await supabaseClient
      .from('brands')
      .insert({
        name: brandData.name,
        logo: brandData.logo,
        path: brandData.path,
      })
      .select()
      .single();

    if (brandError) {
      console.error('Error inserting brand:', brandError);
      continue;
    }

    // Insertar productos de la marca
    for (const product of brandData.products) {
      await supabaseClient
        .from('brand_products')
        .insert({
          brand_id: newBrand.id,
          name: product.name,
          image: product.image,
          price: product.price,
        });
    }
  }
};

// Obtener todas las marcas con sus productos
export const getBrands = async (): Promise<Brand[]> => {
  const { data: brands, error } = await supabaseClient
    .from('brands')
    .select(`
      id,
      name,
      logo,
      path,
      brand_products (
        id,
        brand_id,
        name,
        image,
        price,
        full_set_price,
        only_cap_price,
        description,
        stock
      )
    `)
    .order('name');

  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }

  return (brands || []).map((brand: any) => ({
    ...brand,
    products: brand.brand_products || []
  }));
};

// Obtener una marca por su path
export const getBrandByPath = async (path: string): Promise<Brand | null> => {
  const { data: brand, error } = await supabaseClient
    .from('brands')
    .select(`
      id,
      name,
      logo,
      path,
      brand_products (
        id,
        brand_id,
        name,
        image,
        price,
        full_set_price,
        only_cap_price,
        description,
        stock
      )
    `)
    .eq('path', path)
    .maybeSingle();

  if (error) {
    console.error('Error fetching brand:', error);
    return null;
  }

  if (!brand) return null;

  return {
    ...(brand as any),
    products: (brand as any).brand_products || []
  };
};

// Eliminar una marca
export const deleteBrand = async (brandId: string): Promise<boolean> => {
  const { error } = await supabaseClient
    .from('brands')
    .delete()
    .eq('id', brandId);

  if (error) {
    console.error('Error deleting brand:', error);
    return false;
  }

  window.dispatchEvent(new CustomEvent('brandsUpdated'));
  return true;
};

// Eliminar un producto
export const deleteProduct = async (productId: string): Promise<boolean> => {
  const { error } = await supabaseClient
    .from('brand_products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }

  window.dispatchEvent(new CustomEvent('brandsUpdated'));
  return true;
};

// Agregar un producto a una marca
export const addProduct = async (
  brandId: string, 
  product: Omit<BrandProduct, 'id' | 'brand_id'>
): Promise<BrandProduct | null> => {
  const { data, error } = await supabaseClient
    .from('brand_products')
    .insert({
      brand_id: brandId,
      name: product.name,
      image: product.image,
      price: product.price,
      full_set_price: product.full_set_price,
      only_cap_price: product.only_cap_price,
      description: product.description,
      stock: product.stock || 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding product:', error);
    return null;
  }

  window.dispatchEvent(new CustomEvent('brandsUpdated'));
  return data as BrandProduct;
};
