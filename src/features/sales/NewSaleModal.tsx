// src/features/sales/NewSaleModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { getProducts } from '../../services/productService';
import { salesService } from '../../services/salesService';
import { Product } from '../../types';

interface SaleItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

interface NewSaleModalProps {
  visible: boolean;
  onClose: () => void;
  onSaleCreated: () => void;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  visible,
  onClose,
  onSaleCreated,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar productos al abrir el modal
  useEffect(() => {
    if (visible) {
      loadProducts();
    }
  }, [visible]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error cargando productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoadingProducts(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    // Buscar el producto para validar el stock
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // No permitir cantidad mayor al stock disponible
    if (newQuantity > product.stock) {
      Alert.alert(
        '⚠️ Stock Insuficiente',
        `Solo hay ${product.stock} unidades disponibles de "${product.name}"`
      );
      return;
    }
    
    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

  const getProductQuantity = (productId: number) => {
    return quantities[productId] || 0;
  };

  const getSaleItems = () => {
    return products
      .filter(product => getProductQuantity(product.id) > 0)
      .map(product => ({
        product,
        quantity: getProductQuantity(product.id),
        subtotal: getProductQuantity(product.id) * product.price
      }));
  };

  const getTotalAmount = () => {
    return getSaleItems().reduce((total, item) => total + item.subtotal, 0);
  };

  const handleCreateSale = async () => {
    const saleItems = getSaleItems();
    
    if (saleItems.length === 0) {
      Alert.alert('Error', 'Agrega al menos un producto a la venta');
      return;
    }

    if (!customerName.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del cliente');
      return;
    }

    setLoading(true);

    try {
      const saleData = {
        customer_name: customerName.trim(),
        total_amount: getTotalAmount(),
        items: saleItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price,
          subtotal: item.subtotal
        }))
      };

      await salesService.createSale(saleData);

      Alert.alert(
        '✅ ¡Venta Registrada!',
        `Se registró la venta por $${getTotalAmount().toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              onSaleCreated();
              onClose();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creando venta:', error);
      Alert.alert('Error', 'No se pudo registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuantities({});
    setCustomerName('');
    setSearchTerm('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderProduct = ({ item: product }: { item: Product }) => {
    const currentQuantity = getProductQuantity(product.id);
    const subtotal = currentQuantity * product.price;
    
    return (
      <View style={styles.productCard}>
        {/* Header del producto - estilo catálogo */}
        <View style={styles.productHeader}>
          <View style={styles.productMainInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCode}>#{product.id.toString().padStart(4, '0')}</Text>
          </View>
          <View style={styles.productPriceInfo}>
            <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
            <Text style={styles.productStock}>
              {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
            </Text>
          </View>
        </View>
        
        {/* Controles de cantidad */}
        <View style={styles.quantityContainer}>
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Cantidad solicitada:</Text>
            
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  currentQuantity === 0 && styles.quantityButtonDisabled
                ]}
                onPress={() => updateQuantity(product.id, currentQuantity - 1)}
                disabled={currentQuantity === 0}
              >
                <Text style={[
                  styles.quantityButtonText,
                  currentQuantity === 0 && styles.quantityButtonTextDisabled
                ]}>−</Text>
              </TouchableOpacity>
              
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityNumber}>{currentQuantity}</Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  (currentQuantity >= product.stock || product.stock === 0) && styles.quantityButtonDisabled
                ]}
                onPress={() => updateQuantity(product.id, currentQuantity + 1)}
                disabled={currentQuantity >= product.stock || product.stock === 0}
              >
                <Text style={[
                  styles.quantityButtonText,
                  (currentQuantity >= product.stock || product.stock === 0) && styles.quantityButtonTextDisabled
                ]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Mostrar subtotal si hay cantidad */}
          {currentQuantity > 0 && (
            <View style={styles.subtotalContainer}>
              <Text style={styles.subtotalLabel}>
                {currentQuantity} × ${product.price.toFixed(2)} =
              </Text>
              <Text style={styles.subtotalAmount}>${subtotal.toFixed(2)}</Text>
            </View>
          )}
          
          {/* Advertencias de stock */}
          {currentQuantity >= product.stock && product.stock > 0 && (
            <Text style={styles.stockWarning}>¡Stock máximo alcanzado!</Text>
          )}
          
          {product.stock === 0 && (
            <Text style={styles.outOfStock}>SIN STOCK DISPONIBLE</Text>
          )}
        </View>
      </View>
    );
  };

  const renderSaleItem = ({ item }: { item: SaleItem }) => (
    <View style={styles.saleItem}>
      <View style={styles.saleItemInfo}>
        <Text style={styles.saleItemName}>{item.product.name}</Text>
        <Text style={styles.saleItemPrice}>
          {item.quantity} x ${item.product.price.toFixed(2)}
        </Text>
      </View>
      
      <View style={styles.saleItemSubtotal}>
        <Text style={styles.subtotalText}>${item.subtotal.toFixed(2)}</Text>
      </View>
    </View>
  );

  // Renderizar header de la lista
  const renderHeader = () => (
    <View>
      {/* Información del cliente */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cliente</Text>
        <Input
          label="Nombre del Cliente"
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="Ingresa el nombre del cliente"
        />
      </View>

      {/* Búsqueda de productos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buscar Productos</Text>
        <Input
          label="Buscar"
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Busca por nombre o código"
        />
      </View>

      {/* Título de productos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          📦 Catálogo de Productos ({filteredProducts.length})
        </Text>
      </View>

      {/* Mensaje si está cargando */}
      {loadingProducts && (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <LoadingSpinner />
          <Text style={{ textAlign: 'center', marginTop: 12, color: '#6b7280' }}>
            Cargando productos...
          </Text>
        </View>
      )}

      {/* Mensaje si no hay productos */}
      {!loadingProducts && filteredProducts.length === 0 && (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
            {searchTerm ? '🔍 No se encontraron productos' : '📦 No hay productos registrados'}
          </Text>
          {searchTerm && (
            <Text style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 4 }}>
              Intenta con otro término de búsqueda
            </Text>
          )}
        </View>
      )}
    </View>
  );

  // Renderizar footer con resumen
  const renderFooter = () => (
    <View>
      {/* Resumen de la venta */}
      {getSaleItems().length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🧾 Resumen de la Venta ({getSaleItems().length} productos)
          </Text>
          <View style={styles.saleItemsContainer}>
            {getSaleItems().map((item) => (
              <View key={item.product.id} style={styles.saleItem}>
                {renderSaleItem({ item })}
              </View>
            ))}
            
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>TOTAL A PAGAR:</Text>
              <Text style={styles.totalAmount}>${getTotalAmount().toFixed(2)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Botones de acción */}
      <View style={styles.actions}>
        <Button
          title="❌ Cancelar"
          onPress={handleClose}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title={loading ? '⏳ Registrando...' : `💰 Registrar $${getTotalAmount().toFixed(2)}`}
          onPress={handleCreateSale}
          disabled={loading || getSaleItems().length === 0}
          style={styles.actionButton}
        />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} onClose={handleClose} title="Nueva Venta">
      <View style={styles.container}>
        {loadingProducts || filteredProducts.length === 0 ? (
          <ScrollView>
            {renderHeader()}
            {renderFooter()}
          </ScrollView>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderProduct}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            style={styles.productsList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  productsList: {
    maxHeight: 400,
  },
  
  // 🎨 Nuevos estilos estilo catálogo
  productCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productMainInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  productCode: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  productPriceInfo: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 2,
  },
  productStock: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  
  // 🔢 Controles de cantidad
  quantityContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  quantityButton: {
    width: 36,
    height: 36,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  quantityButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  quantityButtonTextDisabled: {
    color: '#9ca3af',
  },
  quantityDisplay: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  quantityNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  
  // 💰 Subtotales y advertencias
  subtotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  subtotalLabel: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '500',
  },
  subtotalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  stockWarning: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  outOfStock: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  
  // 📝 Estilos del resumen de venta
  saleItemsList: {
    marginBottom: 16,
  },
  saleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  saleItemInfo: {
    flex: 1,
  },
  saleItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  saleItemPrice: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  saleItemSubtotal: {
    alignItems: 'flex-end',
  },
  subtotalText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
  },
  
  // 💲 Total y acciones
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#059669',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#059669',
  },
  saleItemsContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  
  // 🗑️ Estilos obsoletos (mantenidos por compatibilidad)
  productItem: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  productInfo: {
    marginBottom: 12,
  },
  quantitySection: {
    alignItems: 'center',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
});
