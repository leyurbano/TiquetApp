// src/services/creditoService.ts
import { supabase } from '../config/supabase';
import { CreditoTendero } from '../types';

export class CreditoService {
  // Obtener crédito de un tendero
  static async getCreditoTendero(tenderoId: string): Promise<CreditoTendero | null> {
    try {
      const { data, error } = await supabase
        .from('credito_tenderos')
        .select('*')
        .eq('tendero_id', tenderoId)
        .single();

      if (error) {
        // Si no existe registro, crear uno nuevo
        if (error.code === 'PGRST116') {
          return await this.crearCreditoTendero(tenderoId);
        }
        console.error('Error al obtener crédito:', error);
        return null;
      }

      return data as CreditoTendero;
    } catch (error) {
      console.error('Error en getCreditoTendero:', error);
      return null;
    }
  }

  // Crear registro de crédito para un tendero
  static async crearCreditoTendero(
    tenderoId: string, 
    limiteCredito: number = 0,
    diasCredito: number = 0
  ): Promise<CreditoTendero | null> {
    try {
      const { data, error } = await supabase
        .from('credito_tenderos')
        .insert({
          tendero_id: tenderoId,
          limite_credito: limiteCredito,
          saldo_actual: 0,
          dias_credito: diasCredito
        })
        .select()
        .single();

      if (error) {
        console.error('Error al crear crédito:', error);
        return null;
      }

      return data as CreditoTendero;
    } catch (error) {
      console.error('Error en crearCreditoTendero:', error);
      return null;
    }
  }

  // Actualizar límite de crédito
  static async actualizarLimiteCredito(
    tenderoId: string, 
    nuevoLimite: number,
    diasCredito?: number
  ): Promise<boolean> {
    try {
      const updateData: any = {
        limite_credito: nuevoLimite,
        updated_at: new Date().toISOString()
      };

      if (diasCredito !== undefined) {
        updateData.dias_credito = diasCredito;
      }

      const { error } = await supabase
        .from('credito_tenderos')
        .update(updateData)
        .eq('tendero_id', tenderoId);

      if (error) {
        console.error('Error al actualizar límite:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en actualizarLimiteCredito:', error);
      return false;
    }
  }

  // Aplicar cargo al crédito (cuando se hace un pedido a crédito)
  static async aplicarCargo(
    tenderoId: string, 
    monto: number,
    concepto: string = 'Cargo por pedido'
  ): Promise<boolean> {
    try {
      const credito = await this.getCreditoTendero(tenderoId);
      
      if (!credito) {
        console.error('No se encontró información de crédito');
        return false;
      }

      const nuevoSaldo = credito.saldo_actual + monto;
      
      // Verificar que no se exceda el límite
      if (nuevoSaldo > credito.limite_credito) {
        console.error('Límite de crédito excedido');
        return false;
      }

      const { error } = await supabase
        .from('credito_tenderos')
        .update({
          saldo_actual: nuevoSaldo,
          updated_at: new Date().toISOString()
        })
        .eq('tendero_id', tenderoId);

      if (error) {
        console.error('Error al aplicar cargo:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en aplicarCargo:', error);
      return false;
    }
  }

  // Aplicar abono al crédito (cuando se hace un pago)
  static async aplicarAbono(
    tenderoId: string, 
    monto: number,
    concepto: string = 'Abono por pago'
  ): Promise<boolean> {
    try {
      const credito = await this.getCreditoTendero(tenderoId);
      
      if (!credito) {
        console.error('No se encontró información de crédito');
        return false;
      }

      const nuevoSaldo = Math.max(0, credito.saldo_actual - monto);

      const { error } = await supabase
        .from('credito_tenderos')
        .update({
          saldo_actual: nuevoSaldo,
          updated_at: new Date().toISOString()
        })
        .eq('tendero_id', tenderoId);

      if (error) {
        console.error('Error al aplicar abono:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en aplicarAbono:', error);
      return false;
    }
  }

  // Verificar si un tendero puede hacer un pedido a crédito
  static async puedeHacerPedidoCredito(
    tenderoId: string, 
    montoPedido: number
  ): Promise<{ puede: boolean; mensaje: string }> {
    try {
      const credito = await this.getCreditoTendero(tenderoId);
      
      if (!credito) {
        return { 
          puede: false, 
          mensaje: 'No tiene configuración de crédito' 
        };
      }

      if (credito.limite_credito <= 0) {
        return { 
          puede: false, 
          mensaje: 'No tiene límite de crédito asignado' 
        };
      }

      const saldoDespuesPedido = credito.saldo_actual + montoPedido;
      
      if (saldoDespuesPedido > credito.limite_credito) {
        const disponible = credito.limite_credito - credito.saldo_actual;
        return { 
          puede: false, 
          mensaje: `Límite excedido. Disponible: $${disponible.toLocaleString()}` 
        };
      }

      return { 
        puede: true, 
        mensaje: 'Puede hacer el pedido a crédito' 
      };
    } catch (error) {
      console.error('Error en puedeHacerPedidoCredito:', error);
      return { 
        puede: false, 
        mensaje: 'Error al verificar crédito' 
      };
    }
  }

  // Obtener todos los tenderos con su información de crédito
  static async getTenderosConCredito(): Promise<Array<CreditoTendero & { tendero_info: any }>> {
    try {
      const { data, error } = await supabase
        .from('credito_tenderos')
        .select(`
          *,
          tendero_info:users_info!tendero_id(*)
        `)
        .order('saldo_actual', { ascending: false });

      if (error) {
        console.error('Error al obtener tenderos con crédito:', error);
        return [];
      }

      return data as Array<CreditoTendero & { tendero_info: any }>;
    } catch (error) {
      console.error('Error en getTenderosConCredito:', error);
      return [];
    }
  }

  // Obtener resumen de créditos
  static async getResumenCreditos(): Promise<{
    totalLimites: number;
    totalSaldos: number;
    creditoDisponible: number;
    tenderosMorosos: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('credito_tenderos')
        .select('limite_credito, saldo_actual');

      if (error) {
        console.error('Error al obtener resumen:', error);
        return { 
          totalLimites: 0, 
          totalSaldos: 0, 
          creditoDisponible: 0, 
          tenderosMorosos: 0 
        };
      }

      const resumen = data.reduce((acc, credito) => {
        acc.totalLimites += credito.limite_credito;
        acc.totalSaldos += credito.saldo_actual;
        acc.creditoDisponible += (credito.limite_credito - credito.saldo_actual);
        
        // Considerar moroso si debe más del 80% de su límite
        if (credito.saldo_actual > credito.limite_credito * 0.8) {
          acc.tenderosMorosos++;
        }
        
        return acc;
      }, { 
        totalLimites: 0, 
        totalSaldos: 0, 
        creditoDisponible: 0, 
        tenderosMorosos: 0 
      });

      return resumen;
    } catch (error) {
      console.error('Error en getResumenCreditos:', error);
      return { 
        totalLimites: 0, 
        totalSaldos: 0, 
        creditoDisponible: 0, 
        tenderosMorosos: 0 
      };
    }
  }
}
