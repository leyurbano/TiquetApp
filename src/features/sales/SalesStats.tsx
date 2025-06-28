// src/features/sales/SalesStats.tsx
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/currency';
import { SalesStats as SalesStatsType } from './types';

/**
 * 🎯 Props interface para el componente SalesStats
 */
interface SalesStatsProps {
  stats: SalesStatsType | null;
  loading: boolean;
}

/**
 * 🎯 Componente que muestra estadísticas de ventas
 */
export const SalesStats: React.FC<SalesStatsProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <Card>
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.statsCard}>
      <Text style={styles.title}>📊 Resumen de Ventas</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total_sales}</Text>
          <Text style={styles.statLabel}>Ventas Totales</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatCurrency(stats.total_revenue)}
          </Text>
          <Text style={styles.statLabel}>Ingresos Totales</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatCurrency(stats.average_sale)}
          </Text>
          <Text style={styles.statLabel}>Venta Promedio</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  statsCard: {
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
