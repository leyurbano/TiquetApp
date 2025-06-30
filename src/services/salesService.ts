// src/services/salesService.ts
import { supabase } from '../config/supabase';

export interface SaleData {
  customer_name: string;
  total_amount: number;
  items: SaleItemData[];
}

export interface SaleItemData {
  product_id: number; // INTEGER para products.id
  quantity: number;
  unit_price: number;
  subtotal: number;
}

// Interfaces para las tablas existentes de pedidos
export interface Pedido {
  id: string;
  numero_pedido: string;
  fecha_pedido: string;
  subtotal: number;
  total: number;
  estado: 'pendiente' | 'entregado' | 'cancelado';
  vendedor_id: string;
  tendero_id?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  product_id: string; // UUID en pedido_items
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  created_at: string;
}

export const salesService = {
  // 🛒 Crear una nueva venta usando las tablas de pedidos
  async createSale(saleData: SaleData): Promise<Pedido> {
    try {
      // Usar la función SQL para procesar la venta completa
      const saleItems = saleData.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal
      }));

      const { data, error } = await supabase.rpc('process_sale', {
        customer_name: saleData.customer_name,
        sale_items: saleItems
      });

      if (error) {
        throw new Error(`Error creando venta: ${error.message}`);
      }

      // Obtener el pedido creado
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', data)
        .single();

      if (pedidoError) {
        throw new Error(`Error obteniendo pedido: ${pedidoError.message}`);
      }

      return pedido;
    } catch (error) {
      console.error('Error en createSale:', error);
      throw error;
    }
  },

  // 📊 Obtener estadísticas de ventas usando la función SQL
  async getSalesStats(): Promise<{ totalSales: number; totalAmount: number }> {
    try {
      const { data, error } = await supabase.rpc('get_daily_sales_stats');

      if (error) {
        throw new Error(`Error obteniendo estadísticas: ${error.message}`);
      }

      const stats = data?.[0] || { total_sales: 0, total_amount: 0 };
      
      return { 
        totalSales: Number(stats.total_sales) || 0, 
        totalAmount: Number(stats.total_amount) || 0 
      };
    } catch (error) {
      console.error('Error en getSalesStats:', error);
      return { totalSales: 0, totalAmount: 0 };
    }
  },

  // 📋 Obtener todas las ventas del día
  async getTodaySales(limit = 50): Promise<Pedido[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .gte('fecha_pedido', `${today}T00:00:00.000Z`)
        .lte('fecha_pedido', `${today}T23:59:59.999Z`)
        .eq('estado', 'entregado')
        .order('fecha_pedido', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Error obteniendo ventas: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error en getTodaySales:', error);
      return [];
    }
  },

  // 📝 Obtener detalles de una venta específica
  async getSaleDetails(pedidoId: string): Promise<{ pedido: Pedido; items: PedidoItem[] } | null> {
    try {
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single();

      if (pedidoError) {
        throw new Error(`Error obteniendo pedido: ${pedidoError.message}`);
      }

      const { data: items, error: itemsError } = await supabase
        .from('pedido_items')
        .select('*')
        .eq('pedido_id', pedidoId);

      if (itemsError) {
        throw new Error(`Error obteniendo items: ${itemsError.message}`);
      }

      return { pedido, items: items || [] };
    } catch (error) {
      console.error('Error en getSaleDetails:', error);
      return null;
    }
  },

  // � Obtener estadísticas completas del negocio
  async getBusinessStats(): Promise<{
    ventasHoy: number;
    ingresosHoy: number;
    productosActivos: number;
    productosBajoStock: number;
    totalClientesHoy: number;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_business_stats');

      if (error) {
        throw new Error(`Error obteniendo estadísticas del negocio: ${error.message}`);
      }

      const stats = data?.[0] || {
        ventas_hoy: 0,
        ingresos_hoy: 0,
        productos_activos: 0,
        productos_bajo_stock: 0,
        total_clientes_hoy: 0
      };
      
      return {
        ventasHoy: Number(stats.ventas_hoy) || 0,
        ingresosHoy: Number(stats.ingresos_hoy) || 0,
        productosActivos: Number(stats.productos_activos) || 0,
        productosBajoStock: Number(stats.productos_bajo_stock) || 0,
        totalClientesHoy: Number(stats.total_clientes_hoy) || 0,
      };
    } catch (error) {
      console.error('Error en getBusinessStats:', error);
      return {
        ventasHoy: 0,
        ingresosHoy: 0,
        productosActivos: 0,
        productosBajoStock: 0,
        totalClientesHoy: 0,
      };
    }
  },

  // 🔄 Obtener reporte de inventario
  async getInventoryReport(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('reporte_inventario')
        .select('*');

      if (error) {
        throw new Error(`Error obteniendo reporte de inventario: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error en getInventoryReport:', error);
      return [];
    }
  },

  // 💳 Registrar un pago
  async registrarPago(
    pedidoId: string, 
    monto: number, 
    metodoPago: string, 
    notas?: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('registrar_pago', {
        pedido_id: pedidoId,
        monto_pago: monto,
        metodo_pago: metodoPago,
        notas_pago: notas
      });

      if (error) {
        throw new Error(`Error registrando pago: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error en registrarPago:', error);
      throw error;
    }
  },
};
