import { Product } from "@/types/product";
import capDiamondM from "@/assets/cap-diamond-m.jpg";
import capFino from "@/assets/cap-fino.jpg";
import capMtlt27 from "@/assets/cap-mtlt-27.jpg";
import capThreeStars from "@/assets/cap-three-stars.jpg";
import capGraffiti from "@/assets/cap-graffiti.jpg";
import capBlack from "@/assets/cap-black.jpg";
import capNavy from "@/assets/cap-navy.jpg";
import capRed from "@/assets/cap-red.jpg";
import capWhite from "@/assets/cap-white.jpg";

export const products: Product[] = [
  {
    id: "1",
    name: "Gorra Diamond M",
    price: 999,
    image: capDiamondM,
    colors: ["Negro", "Blanco", "Gris"],
    collection: "Premium",
    stock: 45,
    description: "Gorra premium con bordado Diamond M de alta calidad. Diseño exclusivo y materiales de primera.",
    isNew: true,
  },
  {
    id: "2",
    name: "Gorra FINO Edition",
    price: 899,
    image: capFino,
    colors: ["Negro", "Azul", "Verde"],
    collection: "Fino",
    stock: 32,
    description: "Edición especial de la colección FINO. Estilo único para los más exigentes.",
  },
  {
    id: "3",
    name: "Gorra MTLT 27",
    price: 699,
    originalPrice: 949,
    image: capMtlt27,
    colors: ["Negro", "Blanco"],
    collection: "Sport",
    stock: 28,
    description: "Colección MTLT 27, perfecta para uso diario. Comodidad y estilo garantizado.",
    isOnSale: true,
  },
  {
    id: "4",
    name: "Gorra Three Stars",
    price: 999,
    image: capThreeStars,
    colors: ["Negro", "Rojo", "Azul"],
    collection: "Premium",
    stock: 18,
    description: "Diseño exclusivo Three Stars. Bordado de calidad superior con detalles únicos.",
    isNew: true,
  },
  {
    id: "5",
    name: "Gorra Graffiti Style",
    price: 799,
    originalPrice: 1099,
    image: capGraffiti,
    colors: ["Multicolor", "Negro"],
    collection: "Urban",
    stock: 52,
    description: "Estilo urbano con arte graffiti original. Perfecta para looks streetwear.",
    isOnSale: true,
  },
  {
    id: "6",
    name: "Gorra Classic Black",
    price: 599,
    image: capBlack,
    colors: ["Negro"],
    collection: "Classics",
    stock: 67,
    description: "Modelo clásico en negro. Un básico que no puede faltar en tu colección.",
  },
  {
    id: "7",
    name: "Gorra Navy Elite",
    price: 849,
    image: capNavy,
    colors: ["Azul Marino", "Blanco"],
    collection: "Premium",
    stock: 41,
    description: "Azul marino elegante. Diseño sofisticado para cualquier ocasión.",
  },
  {
    id: "8",
    name: "Gorra Red Power",
    price: 549,
    originalPrice: 749,
    image: capRed,
    colors: ["Rojo", "Negro"],
    collection: "Sport",
    stock: 29,
    description: "Rojo intenso que destaca. Perfecta para quienes buscan llamar la atención.",
    isOnSale: true,
  },
  {
    id: "9",
    name: "Gorra White Premium",
    price: 899,
    image: capWhite,
    colors: ["Blanco", "Beige"],
    collection: "Premium",
    stock: 23,
    description: "Elegancia en blanco premium. Materiales de primera calidad.",
    isNew: true,
  },
];

export const collections = Array.from(new Set(products.map(p => p.collection)));
export const allColors = Array.from(new Set(products.flatMap(p => p.colors)));
