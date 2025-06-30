// src/services/pedidoService.ts
import { supabase } from '../config/supabase';
import { Pedido, PedidoWithDetails, PedidoItem, Pago } from '../types';

export class PedidoService {
  // Obtener todos los pedidos
  static async getAllPedidos(): Promise<PedidoWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          items:pedido_items(
            *,
            product:products(*)
          ),
          pagos:pagos(*),
          vendedor:vendedor_id(full_name, phone),
          tendero:tendero_id(full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al obtener pedidos:', error);
        return [];
      }

      return data as PedidoWithDetails[];
    } catch (error) {
      console.error('Error en getAllPedidos:', error);
      return [];
    }
  }

  // Crear un nuevo pedido
  static async createPedido(pedidoData: {
    tendero_id: string;
    items: Array<{
      product_id: string; // Volvemos a string para compatibilidad
      cantidad: number;
      precio_unitario: number;
    }>;
    notas?: string;
  }): Promise<Pedido | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Calcular totales
      const subtotal = pedidoData.items.reduce(
        (sum, item) => sum + (item.cantidad * item.precio_unitario), 
        0
      );

      // Generar número de pedido único
      const numeroPedido = `PED-${Date.now()}`;

      // Crear el pedido principal
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          numero_pedido: numeroPedido,
          subtotal,
          total: subtotal, // Por ahora sin impuestos
          vendedor_id: user.id,
          tendero_id: pedidoData.tendero_id,
          notas: pedidoData.notas
        })
        .select()
        .single();

      if (pedidoError) {
        console.error('Error al crear pedido:', pedidoError);
        return null;
      }

      // Crear los items del pedido
      const items = pedidoData.items.map(item => ({
        pedido_id: pedido.id,
        product_id: item.product_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        precio_total: item.cantidad * item.precio_unitario
      }));

      const { error: itemsError } = await supabase
        .from('pedido_items')
        .insert(items);

      if (itemsError) {
        console.error('Error al crear items del pedido:', itemsError);
        // Eliminar el pedido si fallan los items
        await supabase.from('pedidos').delete().eq('id', pedido.id);
        return null;
      }

      return pedido as Pedido;
    } catch (error) {
      console.error('Error en createPedido:', error);
      return null;
    }
  }

  // Actualizar estado del pedido
  static async updatePedidoEstado(
    pedidoId: string, 
    estado: 'pendiente' | 'entregado' | 'cancelado'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ 
          estado,
          updated_at: new Date().toISOString()
        })
        .eq('id', pedidoId);

      if (error) {
        console.error('Error al actualizar estado del pedido:', error);
        return false;
      }

      // Si el pedido se marca como entregado, actualizamos el stock
      if (estado === 'entregado') {
        await this.actualizarStockPorPedido(pedidoId);
      }

      return true;
    } catch (error) {
      console.error('Error en updatePedidoEstado:', error);
      return false;
    }
  }

  // Actualizar stock cuando se entrega un pedido
  private static async actualizarStockPorPedido(pedidoId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Obtener los items del pedido
      const { data: items } = await supabase
        .from('pedido_items')
        .select('product_id, cantidad')
        .eq('pedido_id', pedidoId);

      if (!items) return;

      // Actualizar stock de cada producto
      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock_actual')
          .eq('id', item.product_id)
          .single();

        if (product) {
          const nuevoStock = product.stock_actual - item.cantidad;
          
          // Actualizar stock
          await supabase
            .from('products')
            .update({ 
              stock_actual: nuevoStock,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.product_id);

          // Registrar movimiento de inventario
          await supabase
            .from('movimientos_inventario')
            .insert({
              product_id: item.product_id,
              tipo_movimiento: 'venta',
              cantidad: -item.cantidad,
              stock_anterior: product.stock_actual,
              stock_nuevo: nuevoStock,
              motivo: `Venta - Pedido ${pedidoId}`,
              creado_por: user?.id
            });
        }
      }
    } catch (error) {
      console.error('Error al actualizar stock por pedido:', error);
    }
  }

  // Registrar pago
  static async registrarPago(pagoData: {
    pedido_id: string;
    monto: number;
    metodo_pago: 'efectivo' | 'transferencia';
    notas?: string;
  }): Promise<Pago | null> {
    try {
      const { data, error } = await supabase
        .from('pagos')
        .insert(pagoData)
        .select()
        .single();

      if (error) {
        console.error('Error al registrar pago:', error);
        return null;
      }

      return data as Pago;
    } catch (error) {
      console.error('Error en registrarPago:', error);
      return null;
    }
  }

  // Obtener pedidos por tendero
  static async getPedidosByTendero(tenderoId: string): Promise<PedidoWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          items:pedido_items(
            *,
            product:products(*)
          ),
          pagos:pagos(*)
        `)
        .eq('tendero_id', tenderoId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al obtener pedidos por tendero:', error);
        return [];
      }

      return data as PedidoWithDetails[];
    } catch (error) {
      console.error('Error en getPedidosByTendero:', error);
      return [];
    }
  }

  // Obtener pedidos por vendedor
  static async getPedidosByVendedor(vendedorId: string): Promise<PedidoWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          items:pedido_items(
            *,
            product:products(*)
          ),
          pagos:pagos(*)
        `)
        .eq('vendedor_id', vendedorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al obtener pedidos por vendedor:', error);
        return [];
      }

      return data as PedidoWithDetails[];
    } catch (error) {
      console.error('Error en getPedidosByVendedor:', error);
      return [];
    }
  }

  // Obtener un pedido por ID
  static async getPedidoById(pedidoId: string): Promise<PedidoWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          items:pedido_items(
            *,
            product:products(*)
          ),
          pagos:pagos(*),
          vendedor:users_info!vendedor_id(*),
          tendero:users_info!tendero_id(*)
        `)
        .eq('id', pedidoId)
        .single();

      if (error) {
        console.error('Error al obtener pedido por ID:', error);
        return null;
      }

      return data as PedidoWithDetails;
    } catch (error) {
      console.error('Error en getPedidoById:', error);
      return null;
    }
  }
}
