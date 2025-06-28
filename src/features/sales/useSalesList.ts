// src/features/sales/useSalesList.ts
import { useState, useEffect } from 'react';
import { getSales, getSalesStats } from '../../services/salesService';
import { Sale, SalesStats } from './types';

/**
 * 🎯 Custom hook para manejar el estado de las ventas
 * Proporciona datos, estado de carga, errores y funciones de recarga
 */
export const useSalesList = () => {
  // 🎯 Estados tipados explícitamente
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  /**
   * 🎯 Función para cargar las ventas
   * Maneja estados de carga y errores
   */
  const fetchSales = async (): Promise<void> => {
    try {
      setError(null);
      const [salesData, statsData] = await Promise.all([
        getSales(),
        getSalesStats(),
      ]);
      setSales(salesData);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * 🎯 Función para refrescar datos (pull-to-refresh)
   */
  const refetch = async (): Promise<void> => {
    setRefreshing(true);
    await fetchSales();
  };

  /**
   * 🎯 Función para recargar completamente
   */
  const reload = async (): Promise<void> => {
    setLoading(true);
    setSales([]);
    setStats(null);
    await fetchSales();
  };

  // 🎯 Efecto para cargar datos al montar el componente
  useEffect(() => {
    fetchSales();
  }, []);

  // 🎯 Retorno tipado del hook
  return {
    sales,
    stats,
    loading,
    error,
    refreshing,
    refetch,
    reload,
  } as const; // ← 'as const' para tipos más precisos
};
