// src/features/products/ProductScreen.tsx
import React, { useEffect, useState } from 'react';
import { 
  FlatList, 
  RefreshControl, 
  StyleSheet, 
  View, 
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useProductList } from './useProductList';
import { ProductCard } from './ProductCard';
import { NewProductModal } from './NewProductModal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Button } from '../../components/ui/Button';
import { Product } from './types';

// 🎯 Tipo para navegación tipada
type ProductScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Products'>;

export default function ProductScreen() {
  const navigation = useNavigation<ProductScreenNavigationProp>();
  const { products, loading, error, refetch } = useProductList();
  const [modalVisible, setModalVisible] = useState(false);

  // 🔄 Mostrar información de conexión al cargar
  useEffect(() => {
    console.log('📦 ProductScreen cargado');
    console.log('🔢 Total productos:', products.length);
    console.log('⏳ Loading:', loading);
    console.log('❌ Error:', error);
  }, [products, loading, error]);

  // 🧪 Función para probar la conexión manualmente
  const testConnection = () => {
    Alert.alert(
      '🧪 Prueba de Conexión',
      `Estado actual:
      
📊 Productos: ${products.length}
⏳ Cargando: ${loading ? 'Sí' : 'No'}
❌ Error: ${error || 'Ninguno'}

¿Quieres recargar los datos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '🔄 Recargar', onPress: refetch }
      ]
    );
  };

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
      <Text style={styles.emptyMessage}>
        {error ? 'Error al cargar productos' : 'No hay productos disponibles'}
      </Text>
      <Text style={styles.emptySubtext}>
        {error 
          ? 'Verifica tu conexión a Supabase' 
          : 'Agrega tu primer producto para comenzar'
        }
      </Text>
      
      {!error && (
        <Button
          title="➕ Crear Primer Producto"
          onPress={() => setModalVisible(true)}
          variant="success"
          size="medium"
          style={{ marginTop: 16 }}
        />
      )}
      
      <Button
        title="🧪 Probar Conexión"
        onPress={testConnection}
        variant="outline"
        size="medium"
        style={{ marginTop: 8 }}
      />
      
      <Button
        title="🔄 Recargar"
        onPress={refetch}
        variant="primary"
        size="medium"
        style={{ marginTop: 8 }}
      />
    </View>
  );

  // 🎯 Header con botones de navegación y nuevo producto
  const renderListHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.buttonRow}>
        
        
        <TouchableOpacity 
          style={styles.newProductButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.newProductButtonText}>➕ Nuevo Producto</Text>
        </TouchableOpacity>
      </View>
      
      {products.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            📦 {products.length} producto{products.length !== 1 ? 's' : ''} en catálogo
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderListHeader}
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
      
      <NewProductModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onProductCreated={() => {
          refetch(); // Recargar la lista de productos
        }}
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
    paddingHorizontal: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  salesButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newProductButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  salesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newProductButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
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