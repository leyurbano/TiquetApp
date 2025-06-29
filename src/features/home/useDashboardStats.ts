// src/features/home/useDashboardStats.ts
import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalPedidos: number;
  pendingPedidos: number;
  totalSales: number;
  totalCredito: number;
  loading: boolean;
  error: string | null;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalPedidos: 0,
    pendingPedidos: 0,
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
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('stock_actual, stock_minimo, precio_venta');

      if (productsError) throw productsError;

      const totalProducts = products?.length || 0;
      const lowStockProducts = products?.filter(p => 
        p.stock_actual <= p.stock_minimo
      ).length || 0;

      // Estadísticas de pedidos
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select('estado, total');

      if (pedidosError) throw pedidosError;

      const totalPedidos = pedidos?.length || 0;
      const pendingPedidos = pedidos?.filter(p => p.estado === 'pendiente').length || 0;
      
      // Total de ventas (pedidos entregados)
      const totalSales = pedidos
        ?.filter(p => p.estado === 'entregado')
        .reduce((sum, p) => sum + (p.total || 0), 0) || 0;

      // Estadísticas de crédito
      const { data: creditos, error: creditosError } = await supabase
        .from('credito_tenderos')
        .select('saldo_actual');

      if (creditosError) throw creditosError;

      const totalCredito = creditos?.reduce((sum, c) => sum + (c.saldo_actual || 0), 0) || 0;

      console.log('📈 Estadísticas obtenidas:', {
        totalProducts,
        lowStockProducts,
        totalPedidos,
        pendingPedidos,
        totalSales,
        totalCredito,
      });

      setStats({
        totalProducts,
        lowStockProducts,
        totalPedidos,
        pendingPedidos,
        totalSales,
        totalCredito,
        loading: false,
        error: null,
      });

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
