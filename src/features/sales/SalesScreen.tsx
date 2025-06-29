// src/features/sales/SalesScreen.tsx
import React from 'react';
import { 
  FlatList, 
  RefreshControl, 
  StyleSheet, 
  View, 
  Text,
  SafeAreaView 
} from 'react-native';
import { useSalesList } from './useSalesList';
import { SaleCard } from './SaleCard';
import { SalesStats } from './SalesStats';
import { LoadingSpinner, ErrorMessage } from '../../components/ui';
import { Sale } from './types';

/**
 * 🎯 Pantalla principal de ventas
 * Muestra estadísticas y lista de ventas con pull-to-refresh
 */
export default function SalesScreen() {
  // 🎯 Hook personalizado para manejar el estado
  const { 
    sales, 
    stats, 
    loading, 
    error, 
    refreshing, 
    refetch, 
    reload 
  } = useSalesList();

  // 🎯 Renderizado condicional para estado de carga inicial
  if (loading && sales.length === 0) {
    return <LoadingSpinner message="Cargando ventas..." />;
  }

  // 🎯 Renderizado condicional para errores
  if (error && sales.length === 0) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={reload}
      />
    );
  }

  /**
   * 🎯 Función para renderizar cada venta
   */
  const renderSale = ({ item }: { item: Sale }) => (
    <SaleCard sale={item} />
  );

  /**
   * 🎯 Componente para cuando no hay ventas
   */
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💰</Text>
      <Text style={styles.emptyMessage}>No hay ventas registradas</Text>
      <Text style={styles.emptySubtext}>
        Las ventas aparecerán aquí cuando se registren
      </Text>
    </View>
  );

  /**
   * 🎯 Header de la lista (estadísticas)
   */
  const renderListHeader = () => (
    <SalesStats stats={stats} loading={loading} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sales}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSale}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refetch}
            colors={['#2563eb']}
            tintColor="#2563eb"
            title="Actualizando ventas..."
            titleColor="#6b7280"
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      
      {/* 🎯 Indicador de error flotante si hay datos pero falla la recarga */}
      {error && sales.length > 0 && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            Error al actualizar: {error}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorBanner: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorBannerText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
});
