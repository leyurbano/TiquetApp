// src/features/sales/types.ts

// 🎯 Interface principal para una venta
export interface Sale {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  sale_date: string; // ISO string format
  customer_name?: string; // Opcional
}

// 🎯 Interface para crear una nueva venta
export interface CreateSale {
  product_name: string;
  quantity: number;
  unit_price: number;
  customer_name?: string;
}

// 🎯 Interface para estadísticas de ventas
export interface SalesStats {
  total_sales: number;
  total_revenue: number;
  average_sale: number;
}
