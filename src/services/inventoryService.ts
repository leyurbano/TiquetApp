// src/services/inventoryService.ts
import { supabase } from '../config/supabase';
import { MovimientoInventario } from '../types';

export class InventoryService {
  // Obtener todos los movimientos de inventario
  static async getMovimientos(productId?: string): Promise<MovimientoInventario[]> {
    try {
      let query = supabase
        .from('movimientos_inventario')
        .select(`
          *,
          product:products(name),
          creado_por_info:users_info!creado_por(full_name)
        `)
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error al obtener movimientos:', error);
        return [];
      }

      return data as MovimientoInventario[];
    } catch (error) {
      console.error('Error en getMovimientos:', error);
      return [];
    }
  }

  // Registrar movimiento de inventario
  static async registrarMovimiento(movimiento: {
    product_id: string; // Volvemos a string para compatibilidad
    tipo_movimiento: 'venta' | 'devolucion' | 'ajuste' | 'merma';
    cantidad: number;
    motivo?: string;
  }): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Obtener stock actual del producto
      const { data: product } = await supabase
        .from('products')
        .select('stock_actual')
        .eq('id', movimiento.product_id)
        .single();

      if (!product) {
        console.error('Producto no encontrado');
        return false;
      }

      const stockAnterior = product.stock_actual;
      let stockNuevo: number;

      // Calcular nuevo stock según el tipo de movimiento
      switch (movimiento.tipo_movimiento) {
        case 'venta':
        case 'merma':
          stockNuevo = stockAnterior - Math.abs(movimiento.cantidad);
          break;
        case 'devolucion':
          stockNuevo = stockAnterior + Math.abs(movimiento.cantidad);
          break;
        case 'ajuste':
          stockNuevo = stockAnterior + movimiento.cantidad;
          break;
        default:
          stockNuevo = stockAnterior;
      }

      // Verificar que el stock no sea negativo
      if (stockNuevo < 0) {
        console.error('Stock insuficiente');
        return false;
      }

      // Iniciar transacción
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock_actual: stockNuevo,
          updated_at: new Date().toISOString()
        })
        .eq('id', movimiento.product_id);

      if (updateError) {
        console.error('Error al actualizar stock:', updateError);
        return false;
      }

      // Registrar el movimiento
      const { error: movementError } = await supabase
        .from('movimientos_inventario')
        .insert({
          product_id: movimiento.product_id,
          tipo_movimiento: movimiento.tipo_movimiento,
          cantidad: movimiento.cantidad,
          stock_anterior: stockAnterior,
          stock_nuevo: stockNuevo,
          motivo: movimiento.motivo,
          creado_por: user?.id
        });

      if (movementError) {
        console.error('Error al registrar movimiento:', movementError);
        // Revertir cambio de stock
        await supabase
          .from('products')
          .update({ stock_actual: stockAnterior })
          .eq('id', movimiento.product_id);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en registrarMovimiento:', error);
      return false;
    }
  }

  // Ajustar stock masivo
  static async ajustarStockMasivo(ajustes: Array<{
    product_id: string; // Volvemos a string para compatibilidad
    nuevo_stock: number;
    motivo?: string;
  }>): Promise<{ exitosos: number; fallidos: number }> {
    let exitosos = 0;
    let fallidos = 0;

    for (const ajuste of ajustes) {
      try {
        const { data: product } = await supabase
          .from('products')
          .select('stock_actual')
          .eq('id', ajuste.product_id)
          .single();

        if (!product) {
          fallidos++;
          continue;
        }

        const diferencia = ajuste.nuevo_stock - product.stock_actual;
        
        const exito = await this.registrarMovimiento({
          product_id: ajuste.product_id,
          tipo_movimiento: 'ajuste',
          cantidad: diferencia,
          motivo: ajuste.motivo || 'Ajuste masivo de inventario'
        });

        if (exito) {
          exitosos++;
        } else {
          fallidos++;
        }
      } catch (error) {
        console.error(`Error ajustando producto ${ajuste.product_id}:`, error);
        fallidos++;
      }
    }

    return { exitosos, fallidos };
  }

  // Obtener resumen de movimientos por período
  static async getResumenMovimientos(fechaInicio: string, fechaFin: string): Promise<{
    ventas: number;
    devoluciones: number;
    ajustes: number;
    mermas: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('movimientos_inventario')
        .select('tipo_movimiento, cantidad')
        .gte('created_at', fechaInicio)
        .lte('created_at', fechaFin);

      if (error) {
        console.error('Error al obtener resumen:', error);
        return { ventas: 0, devoluciones: 0, ajustes: 0, mermas: 0 };
      }

      const resumen = data.reduce((acc, mov) => {
        switch (mov.tipo_movimiento) {
          case 'venta':
            acc.ventas += Math.abs(mov.cantidad);
            break;
          case 'devolucion':
            acc.devoluciones += Math.abs(mov.cantidad);
            break;
          case 'ajuste':
            acc.ajustes += Math.abs(mov.cantidad);
            break;
          case 'merma':
            acc.mermas += Math.abs(mov.cantidad);
            break;
        }
        return acc;
      }, { ventas: 0, devoluciones: 0, ajustes: 0, mermas: 0 });

      return resumen;
    } catch (error) {
      console.error('Error en getResumenMovimientos:', error);
      return { ventas: 0, devoluciones: 0, ajustes: 0, mermas: 0 };
    }
  }
}
