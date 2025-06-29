// src/features/products/ProductScreen.tsx
import React, { useEffect, useState } from 'react';
import { 
  RefreshControl, 
  StyleSheet, 
  View, 
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useProductList } from './useProductList';
import { ProductTable } from './ProductTable';
import { NewProductModal } from './NewProductModal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Button } from '../../components/ui/Button';
import { Product } from './types';
import { deleteProduct, updateProduct } from '../../services/productService';

// 🎯 Tipo para navegación tipada
type ProductScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Products'>;

export default function ProductScreen() {
  const navigation = useNavigation<ProductScreenNavigationProp>();
  const { products, loading, error, refetch } = useProductList();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  // ✏️ Función para manejar la edición de productos
  const handleEditProduct = (product: Product) => {
    console.log('✏️ Editando producto:', product.name);
    setEditingProduct(product);
    setModalVisible(true);
  };

  // 🗑️ Función para manejar la eliminación de productos
  const handleDeleteProduct = async (productId: number) => {
    try {
      console.log('🗑️ Eliminando producto ID:', productId);
      
      const success = await deleteProduct(productId.toString());
      
      if (success) {
        Alert.alert('✅ Éxito', 'Producto eliminado correctamente');
        refetch(); // Recargar la lista
      } else {
        Alert.alert('❌ Error', 'No se pudo eliminar el producto');
      }
    } catch (error) {
      console.error('💥 Error al eliminar producto:', error);
      Alert.alert('❌ Error', 'Ocurrió un error al eliminar el producto');
    }
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

  // 🎯 Header con botón de nuevo producto
  const renderListHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.newProductButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.newProductButtonText}>➕ Nuevo Producto</Text>
      </TouchableOpacity>
      
      {/* Info de ayuda para el usuario - 2 bloques */}
      <View style={styles.helpMainContainer}>
        {/* Bloque 1: Estados */}
        <View style={styles.helpBlock}>
          <Text style={styles.blockTitle}>Estados:</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusCircle, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.miniText}>Sin stock</Text>
            <View style={[styles.statusCircle, { backgroundColor: '#10b981' }]} />
            <Text style={styles.miniText}>Disponible</Text>
          </View>
        </View>

        {/* Bloque 2: Acciones */}
        <View style={styles.helpBlock}>
          <Text style={styles.blockTitle}>Acciones:</Text>
          <Text style={styles.actionInfo}>✏️ Editar • 🗑️ Eliminar</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header siempre visible */}
      {renderListHeader()}
      
      {/* Vista de Tabla siempre */}
      <ScrollView 
        style={styles.tableContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
        {products.length === 0 ? renderEmptyList() : (
          <ProductTable 
            products={products} 
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
      </ScrollView>
      
      <NewProductModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingProduct(null); // Limpiar producto en edición
        }}
        onProductCreated={() => {
          refetch(); // Recargar la lista de productos
          setEditingProduct(null); // Limpiar producto en edición
        }}
        editingProduct={editingProduct} // Pasar producto a editar
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  newProductButton: {
    marginTop: 16,
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
    marginBottom: 12,
  },
  newProductButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpMainContainer: {
    gap: 8,
    marginTop: 4,
  },
  helpBlock: {
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blockTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginRight: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  miniText: {
    fontSize: 10,
    color: '#64748b',
    marginRight: 8,
  },
  actionInfo: {
    fontSize: 10,
    color: '#64748b',
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
  tableContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});