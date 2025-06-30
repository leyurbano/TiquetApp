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
  product_id: string; // TEMPORAL: UUID generado hasta corregir DB
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  created_at: string;
}

export const salesService = {
  // � Generar número consecutivo de factura
  async generateConsecutiveNumber(): Promise<string> {
    try {
      // Obtener el último número de factura del día
      const today = new Date().toISOString().split('T')[0];
      
      const { data: lastSale, error } = await supabase
        .from('pedidos')
        .select('numero_pedido')
        .gte('fecha_pedido', `${today}T00:00:00.000Z`)
        .lte('fecha_pedido', `${today}T23:59:59.999Z`)
        .like('numero_pedido', 'F%') // Facturas que empiecen con F
        .order('created_at', { ascending: false })
        .limit(1);

      let nextNumber = 1;
      
      if (!error && lastSale && lastSale.length > 0) {
        // Extraer el número de la última factura (formato: F001, F002, etc.)
        const lastNumber = lastSale[0].numero_pedido.replace('F', '');
        nextNumber = parseInt(lastNumber) + 1;
      }

      // Formatear con ceros a la izquierda (F001, F002, etc.)
      return `F${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generando número consecutivo:', error);
      // Fallback al sistema anterior si hay error
      const timestamp = Date.now().toString().slice(-6);
      return `F${timestamp}`;
    }
  },

  // �🛒 Crear una nueva venta usando las tablas de pedidos (sin función SQL)
  async createSale(saleData: SaleData): Promise<Pedido> {
    try {
      console.log('🔄 Iniciando creación de venta...');
      console.log('📋 Datos recibidos:', saleData);

      // Generar número de pedido único
      const numeroMarcaTiempo = Date.now().toString().slice(-6);
      const numeroPedido = `VEN${numeroMarcaTiempo}`;

      console.log('🔢 Número de pedido generado:', numeroPedido);

      // 1. Crear el pedido principal
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          numero_pedido: numeroPedido,
          fecha_pedido: new Date().toISOString(),
          subtotal: saleData.total_amount,
          total: saleData.total_amount,
          estado: 'entregado' as const,
          vendedor_id: (await supabase.auth.getUser()).data.user?.id || 'sistema',
          notas: `Cliente: ${saleData.customer_name}`
        })
        .select()
        .single();

      if (pedidoError) {
        console.error('❌ Error creando pedido:', pedidoError);
        throw new Error(`Error creando pedido: ${pedidoError.message}`);
      }

      console.log('✅ Pedido creado:', pedido);

      // 2. Crear los items del pedido
      // TEMPORAL: Generar UUID basado en product_id hasta corregir la estructura DB
      const itemsToInsert = saleData.items.map(item => {
        // Generar un UUID determinista basado en el product_id
        // Esto es temporal hasta corregir la estructura de la base de datos
        const paddedId = item.product_id.toString().padStart(8, '0');
        const fakeUuid = `00000000-0000-0000-0000-${paddedId}0000`.slice(0, 36);
        
        console.log(`📦 Producto ${item.product_id}: usando UUID temporal ${fakeUuid}`);

        return {
          pedido_id: pedido.id,
          product_id: fakeUuid,
          cantidad: item.quantity,
          precio_unitario: item.unit_price,
          precio_total: item.subtotal
        };
      });

      console.log('📦 Items a insertar:', itemsToInsert);

      const { error: itemsError } = await supabase
        .from('pedido_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('❌ Error creando items:', itemsError);
        // Limpiar el pedido si falla la inserción de items
        await supabase.from('pedidos').delete().eq('id', pedido.id);
        throw new Error(`Error creando items del pedido: ${itemsError.message}`);
      }

      console.log('✅ Items creados exitosamente');

      // 3. Actualizar inventario (reducir stock)
      for (const item of saleData.items) {
        try {
          // Primero obtener el stock actual
          const { data: product, error: getError } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();

          if (getError) {
            console.warn(`⚠️ Error obteniendo producto ${item.product_id}:`, getError);
            continue;
          }

          const newStock = Math.max(0, (product.stock || 0) - item.quantity);

          const { error: stockError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id);

          if (stockError) {
            console.warn(`⚠️ Advertencia actualizando stock del producto ${item.product_id}:`, stockError);
          } else {
            console.log(`📦 Stock actualizado para producto ${item.product_id}: ${product.stock} → ${newStock}`);
          }
        } catch (stockErr) {
          console.warn(`⚠️ Error actualizando stock:`, stockErr);
        }
      }

      console.log('✅ Venta completada exitosamente');
      return pedido;

    } catch (error) {
      console.error('❌ Error en createSale:', error);
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
