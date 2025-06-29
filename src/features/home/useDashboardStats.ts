// src/features/home/useDashboardStats.ts
import { useState, useEffect } from 'react';
import { getProducts } from '../../services/productService';

interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  loading: boolean;
  error: string | null;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    loading: true,
    error: null,
  });

  const fetchStats = async () => {
    try {
      console.log('📊 Obteniendo estadísticas del dashboard...');
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Obtener productos
      const products = await getProducts();
      const totalProducts = products.length;

      // TODO: Agregar servicios para ventas cuando estén implementados
      const totalSales = 0; // Placeholder por ahora
      const totalRevenue = 0; // Placeholder por ahora

      console.log('📈 Estadísticas obtenidas:', {
        totalProducts,
        totalSales,
        totalRevenue,
      });

      setStats({
        totalProducts,
        totalSales,
        totalRevenue,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar estadísticas',
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
