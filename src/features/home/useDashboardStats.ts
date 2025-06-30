// src/features/home/useDashboardStats.ts
import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  ventasHoy: number;          // Número de ventas de hoy
  ingresosHoy: number;        // Monto total de ventas de hoy
  totalSales: number;         // Para compatibilidad (igual a ingresosHoy)
  totalCredito: number;       // Créditos pendientes
  loading: boolean;
  error: string | null;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    ventasHoy: 0,
    ingresosHoy: 0,
    totalSales: 0,
    totalCredito: 0,
    loading: true,
    error: null,
  });

  const fetchStats = async () => {
    try {
      console.log('📊 Obteniendo estadísticas del dashboard...');
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Estadísticas de productos
      console.log('📦 Consultando productos...');
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('stock, price, is_active');

      if (productsError) {
        console.error('❌ Error en productos:', productsError);
        throw productsError;
      }

      console.log('📦 Productos obtenidos:', products?.length || 0);
      const activeProducts = products?.filter(p => p.is_active) || [];
      const totalProducts = activeProducts.length;
      
      // Considerar bajo stock cuando queden menos de 5 unidades
      const lowStockProducts = activeProducts.filter(p => 
        p.stock <= 5
      ).length;

      console.log(`📦 Productos activos: ${totalProducts}, Bajo stock: ${lowStockProducts}`);

      // Estadísticas de pedidos
      console.log('📋 Consultando pedidos...');
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select('estado, total');

      if (pedidosError) {
        console.error('❌ Error en pedidos:', pedidosError);
        throw pedidosError;
      }

      console.log('📋 Pedidos obtenidos:', pedidos?.length || 0);

      // Obtener ventas de hoy específicamente
      const today = new Date().toISOString().split('T')[0];
      console.log('🗓️ Consultando ventas de hoy:', today);
      
      const { data: ventasHoy, error: ventasError } = await supabase
        .from('pedidos')
        .select('total')
        .eq('estado', 'entregado')
        .gte('fecha_pedido', `${today}T00:00:00.000Z`)
        .lte('fecha_pedido', `${today}T23:59:59.999Z`);

      if (ventasError) {
        console.warn('⚠️ Error obteniendo ventas de hoy:', ventasError);
      }

      const totalVentasHoy = ventasHoy?.length || 0;
      const ingresosTotalHoy = ventasHoy?.reduce((sum, v) => sum + (v.total || 0), 0) || 0;

      console.log(`🛒 Ventas de hoy: ${totalVentasHoy}, Ingresos: $${ingresosTotalHoy}`);

      // Estadísticas de crédito (opcional, puede fallar si no existe la tabla)
      let totalCredito = 0;
      try {
        console.log('💳 Consultando créditos...');
        const { data: creditos } = await supabase
          .from('credito_tenderos')
          .select('saldo_actual');
        
        totalCredito = creditos?.reduce((sum, c) => sum + (c.saldo_actual || 0), 0) || 0;
        console.log(`💳 Créditos: $${totalCredito}`);
      } catch (error) {
        console.log('ℹ️ Tabla de créditos no disponible');
        totalCredito = 0;
      }

      console.log('📈 Estadísticas obtenidas:', {
        totalProducts,
        lowStockProducts,
        ventasHoy: totalVentasHoy,
        ingresosHoy: ingresosTotalHoy,
        totalCredito,
      });

      setStats({
        totalProducts,
        lowStockProducts,
        ventasHoy: totalVentasHoy,
        ingresosHoy: ingresosTotalHoy,
        totalSales: ingresosTotalHoy, // Para compatibilidad
        totalCredito,
        loading: false,
        error: null,
      });

      console.log('✅ Estado actualizado correctamente');

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar estadísticas',
      }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refetch = () => {
    fetchStats();
  };

  return { ...stats, refetch };
};
