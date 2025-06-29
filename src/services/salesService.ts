// src/services/salesService.ts
import { supabase } from '../config/supabase';
import { Sale, CreateSale, SalesStats } from '../features/sales/types';

/**
 * 🎯 Obtiene todas las ventas ordenadas por fecha (más recientes primero)
 */
export const getSales = async (): Promise<Sale[]> => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('sale_date', { ascending: false });

  if (error) {
    console.error('Error al obtener ventas:', error.message);
    throw new Error(`Error al cargar ventas: ${error.message}`);
  }

  return data as Sale[];
};

/**
 * 🎯 Crea una nueva venta
 */
export const createSale = async (saleData: CreateSale): Promise<Sale> => {
  // Calculamos el total automáticamente
  const total = saleData.quantity * saleData.unit_price;
  
  const newSale = {
    ...saleData,
    total,
    sale_date: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('sales')
    .insert([newSale])
    .select()
    .single();

  if (error) {
    console.error('Error al crear venta:', error.message);
    throw new Error(`Error al crear venta: ${error.message}`);
  }

  return data as Sale;
};

/**
 * 🎯 Obtiene estadísticas de ventas
 */
export const getSalesStats = async (): Promise<SalesStats> => {
  const { data, error } = await supabase
    .from('sales')
    .select('total');

  if (error) {
    console.error('Error al obtener estadísticas:', error.message);
    return {
      total_sales: 0,
      total_revenue: 0,
      average_sale: 0,
    };
  }

  const sales = data as { total: number }[];
  const total_sales = sales.length;
  const total_revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const average_sale = total_sales > 0 ? total_revenue / total_sales : 0;

  return {
    total_sales,
    total_revenue,
    average_sale,
  };
};
