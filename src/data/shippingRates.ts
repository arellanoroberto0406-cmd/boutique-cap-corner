// Tarifas de envío por estado de México
export interface ShippingRate {
  state: string;
  cost: number;
  estimatedDays: string;
}

export const SHIPPING_RATES: ShippingRate[] = [
  // Zona Metropolitana - Envío más económico
  { state: "Ciudad de México", cost: 79, estimatedDays: "2-3 días" },
  { state: "Estado de México", cost: 79, estimatedDays: "2-3 días" },
  
  // Zona Centro
  { state: "Aguascalientes", cost: 99, estimatedDays: "3-4 días" },
  { state: "Guanajuato", cost: 99, estimatedDays: "3-4 días" },
  { state: "Hidalgo", cost: 89, estimatedDays: "2-3 días" },
  { state: "Jalisco", cost: 99, estimatedDays: "3-4 días" },
  { state: "Michoacán", cost: 99, estimatedDays: "3-4 días" },
  { state: "Morelos", cost: 89, estimatedDays: "2-3 días" },
  { state: "Puebla", cost: 89, estimatedDays: "2-3 días" },
  { state: "Querétaro", cost: 89, estimatedDays: "2-3 días" },
  { state: "San Luis Potosí", cost: 99, estimatedDays: "3-4 días" },
  { state: "Tlaxcala", cost: 89, estimatedDays: "2-3 días" },
  { state: "Zacatecas", cost: 109, estimatedDays: "3-5 días" },
  
  // Zona Norte
  { state: "Baja California", cost: 139, estimatedDays: "4-6 días" },
  { state: "Baja California Sur", cost: 149, estimatedDays: "5-7 días" },
  { state: "Chihuahua", cost: 129, estimatedDays: "4-5 días" },
  { state: "Coahuila", cost: 119, estimatedDays: "3-5 días" },
  { state: "Durango", cost: 119, estimatedDays: "3-5 días" },
  { state: "Nuevo León", cost: 109, estimatedDays: "3-4 días" },
  { state: "Sinaloa", cost: 119, estimatedDays: "3-5 días" },
  { state: "Sonora", cost: 129, estimatedDays: "4-5 días" },
  { state: "Tamaulipas", cost: 119, estimatedDays: "3-5 días" },
  
  // Zona Sur y Sureste
  { state: "Campeche", cost: 129, estimatedDays: "4-5 días" },
  { state: "Chiapas", cost: 129, estimatedDays: "4-5 días" },
  { state: "Colima", cost: 109, estimatedDays: "3-4 días" },
  { state: "Guerrero", cost: 119, estimatedDays: "3-5 días" },
  { state: "Nayarit", cost: 109, estimatedDays: "3-4 días" },
  { state: "Oaxaca", cost: 119, estimatedDays: "3-5 días" },
  { state: "Quintana Roo", cost: 139, estimatedDays: "4-6 días" },
  { state: "Tabasco", cost: 129, estimatedDays: "4-5 días" },
  { state: "Veracruz", cost: 109, estimatedDays: "3-4 días" },
  { state: "Yucatán", cost: 129, estimatedDays: "4-5 días" },
];

export const FREE_SHIPPING_THRESHOLD = 500;

export const getShippingCost = (state: string, subtotal: number): { cost: number; estimatedDays: string; isFree: boolean } => {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    const rate = SHIPPING_RATES.find(r => r.state === state);
    return { 
      cost: 0, 
      estimatedDays: rate?.estimatedDays || "3-5 días",
      isFree: true 
    };
  }
  
  const rate = SHIPPING_RATES.find(r => r.state === state);
  if (rate) {
    return { cost: rate.cost, estimatedDays: rate.estimatedDays, isFree: false };
  }
  
  // Default rate for unknown states
  return { cost: 99, estimatedDays: "3-5 días", isFree: false };
};

export const getStatesList = (): string[] => {
  return SHIPPING_RATES.map(r => r.state).sort();
};
