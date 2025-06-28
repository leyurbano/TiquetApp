// src/features/products/ProductScreen.tsx
import React from 'react';
import { 
  FlatList, 
  RefreshControl, 
  StyleSheet, 
  View, 
  Text,
  SafeAreaView 
} from 'react-native';
import { useProductList } from './useProductList';
import { ProductCard } from './ProductCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Product } from './types';

export default function ProductScreen() {
  const { products, loading, error, refetch } = useProductList();

  if (loading && products.length === 0) {
    return <LoadingSpinner message="Cargando productos..." />;
  }

  if (error && products.length === 0) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={refetch}
      />
    );
  }

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard product={item} />
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>📦</Text>
      <Text style={styles.emptyMessage}>No hay productos disponibles</Text>
      <Text style={styles.emptySubtext}>
        Los productos aparecerán aquí cuando estén disponibles
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
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
});