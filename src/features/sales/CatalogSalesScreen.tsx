// src/features/sales/CatalogSalesScreen.tsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
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

interface CatalogSalesScreenProps {
  navigation: any;
}

// Componente memo para evitar re-renders innecesarios
const ProductItem = memo(({ 
  product, 
  currentQuantity,
  onIncrease,
  onDecrease
}: { 
  product: Product; 
  currentQuantity: number;
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
}) => {
  const hasStock = product.stock > 0;
  
  return (
    <View style={[styles.productRow, !hasStock && styles.productRowDisabled]}>
      {/* Nombre del producto */}
      <View style={styles.productNameColumn}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
      </View>

      {/* Precio */}
      <View style={styles.productPriceColumn}>
        <Text style={styles.productPrice}>$COP {product.price.toLocaleString('es-CO')}</Text>
      </View>

      {/* Stock */}
      <View style={styles.productStockColumn}>
        <Text style={[
          styles.productStock,
          product.stock <= 5 && styles.productStockLow,
          !hasStock && styles.productStockEmpty
        ]}>
          {product.stock}
        </Text>
      </View>

      {/* Controles de cantidad */}
      <View style={styles.quantityColumn}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              (!hasStock || currentQuantity === 0) && styles.quantityButtonDisabled
            ]}
            onPress={() => onDecrease(product.id)}
            disabled={!hasStock || currentQuantity === 0}
          >
            <Text style={[
              styles.quantityButtonText,
              (!hasStock || currentQuantity === 0) && styles.quantityButtonTextDisabled
            ]}>−</Text>
          </TouchableOpacity>
          
          <View style={styles.quantityDisplay}>
            <Text style={styles.quantityNumber}>{currentQuantity}</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.quantityButton,
              (!hasStock || currentQuantity >= product.stock) && styles.quantityButtonDisabled
            ]}
            onPress={() => onIncrease(product.id)}
            disabled={!hasStock || currentQuantity >= product.stock}
          >
            <Text style={[
              styles.quantityButtonText,
              (!hasStock || currentQuantity >= product.stock) && styles.quantityButtonTextDisabled
            ]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

ProductItem.displayName = 'ProductItem';

export const CatalogSalesScreen: React.FC<CatalogSalesScreenProps> = ({ navigation }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, []);

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

  // Filtrar productos por término de búsqueda
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener cantidad de un producto
  const getProductQuantity = useCallback((productId: number): number => {
    return quantities[productId] || 0;
  }, [quantities]);

  // Actualizar cantidad de un producto con callback para evitar re-renders
  const updateQuantity = useCallback((productId: number, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity < 0) newQuantity = 0;
    if (newQuantity > product.stock) newQuantity = product.stock;

    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  }, [products]);

  // Callback para manejar incremento de producto
  const handleIncrease = useCallback((productId: number) => {
    const currentQuantity = getProductQuantity(productId);
    const product = products.find(p => p.id === productId);
    if (product && currentQuantity < product.stock) {
      updateQuantity(productId, currentQuantity + 1);
    }
  }, [getProductQuantity, updateQuantity, products]);

  // Callback para manejar decremento de producto
  const handleDecrease = useCallback((productId: number) => {
    const currentQuantity = getProductQuantity(productId);
    if (currentQuantity > 0) {
      updateQuantity(productId, currentQuantity - 1);
    }
  }, [getProductQuantity, updateQuantity]);

  // Obtener items de la venta
  const getSaleItems = (): SaleItem[] => {
    const items = Object.entries(quantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === parseInt(productId))!;
        return {
          product,
          quantity,
          subtotal: quantity * product.price
        };
      });
    
    console.log('🛒 Items calculados:', items);
    return items;
  };

  // Obtener total de la venta
  const getTotalAmount = () => {
    return getSaleItems().reduce((total, item) => total + item.subtotal, 0);
  };

  // Procesar la venta
  const handleProcessSale = async () => {
    const saleItems = getSaleItems();
    
    console.log('🛒 Iniciando proceso de facturación...');
    console.log('📦 Items de venta:', saleItems);
    
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

      console.log('📋 Datos de venta preparados:', saleData);
      console.log('💰 Total calculado:', getTotalAmount());

      const result = await salesService.createSale(saleData);
      
      console.log('✅ Venta facturada exitosamente:', result);

      // Generar factura completa con formato mejorado
      console.log('🧾 Generando factura completa...');
      const invoice = await salesService.generateInvoice(result.id);
      
      if (invoice) {
        console.log('📄 FACTURA GENERADA:');
        console.log('═'.repeat(50));
        console.log(`           ${invoice.header.appName.toUpperCase()}`);
        console.log('═'.repeat(50));
        console.log(`FACTURA: ${invoice.header.invoiceNumber}`);
        console.log(`FECHA: ${invoice.header.date}`);
        console.log(`CLIENTE: ${invoice.header.customerName}`);
        console.log(`VENDEDOR: ${invoice.header.vendorName}`);
        console.log('─'.repeat(50));
        
        invoice.items.forEach(item => {
          console.log(`${item.lineNumber}. ${item.productName} - ${item.quantity} × $${item.unitPrice.toLocaleString('es-CO')} = $${item.totalPrice.toLocaleString('es-CO')}`);
        });
        
        console.log('─'.repeat(50));
        console.log(`TOTAL: $${invoice.summary.total.toLocaleString('es-CO')} COP`);
        console.log('═'.repeat(50));
      }

      // Mostrar cuadro de confirmación de impresión
      const facturaNumero = invoice?.header.invoiceNumber || result.numero_pedido;
      
      Alert.alert(
        '✅ ¡Venta Facturada!',
        `Factura: ${facturaNumero}\nTotal: $COP ${getTotalAmount().toLocaleString('es-CO')}\n\n¿Desea imprimir la factura?`,
        [
          {
            text: 'No',
            style: 'cancel',
            onPress: () => {
              console.log('🔄 Usuario eligió no imprimir - Limpiando formulario...');
              resetForm();
            }
          },
          {
            text: 'Sí',
            onPress: () => {
              console.log('🖨️ Usuario eligió imprimir - Mostrando factura completa...');
              
              if (invoice) {
                // Mostrar factura completa en un Alert
                let facturaTexto = `${invoice.header.appName.toUpperCase()}\n`;
                facturaTexto += `Factura: ${invoice.header.invoiceNumber}\n`;
                facturaTexto += `Fecha: ${invoice.header.date}\n`;
                facturaTexto += `Cliente: ${invoice.header.customerName}\n`;
                facturaTexto += `Vendedor: ${invoice.header.vendorName}\n\n`;
                facturaTexto += `PRODUCTOS:\n`;
                
                invoice.items.forEach(item => {
                  facturaTexto += `${item.lineNumber}. ${item.productName}\n`;
                  facturaTexto += `   ${item.quantity} × $${item.unitPrice.toLocaleString('es-CO')} = $${item.totalPrice.toLocaleString('es-CO')}\n`;
                });
                
                facturaTexto += `\nTOTAL: $${invoice.summary.total.toLocaleString('es-CO')} COP`;
                
                Alert.alert(
                  '🧾 Factura Completa',
                  facturaTexto,
                  [
                    {
                      text: 'Nueva Venta',
                      onPress: () => resetForm()
                    },
                    {
                      text: 'Volver al Inicio',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else {
                Alert.alert(
                  '🖨️ Impresión',
                  'Factura guardada correctamente.\n(Función de impresión en desarrollo)',
                  [
                    {
                      text: 'Nueva Venta',
                      onPress: () => resetForm()
                    },
                    {
                      text: 'Volver al Inicio',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error completo creando venta:', error);
      console.error('❌ Tipo de error:', typeof error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Mensaje del error:', errorMessage);
      
      Alert.alert(
        'Error', 
        `No se pudo registrar la venta: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setQuantities({});
    setCustomerName('');
    setSearchTerm('');
    loadProducts(); // Recargar productos para actualizar stock
  };

  // Renderizar producto en la tabla usando el componente memo
  const renderProduct = useCallback(({ item: product }: { item: Product }) => (
    <ProductItem 
      product={product} 
      currentQuantity={getProductQuantity(product.id)}
      onIncrease={handleIncrease}
      onDecrease={handleDecrease}
    />
  ), [getProductQuantity, handleIncrease, handleDecrease]);

  if (loadingProducts) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.screenTitle}>🛒 Nueva Venta</Text>
          <Text style={styles.screenSubtitle}>
            {filteredProducts.length} productos disponibles
          </Text>
        </View>

        {/* Inputs de búsqueda y cliente */}
        <View style={styles.inputsContainer}>
          {/* Búsqueda */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Buscar productos..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Cliente */}
          <View style={styles.customerContainer}>
            <Text style={styles.customerLabel}>Cliente:</Text>
            <TextInput
              style={styles.customerInput}
              placeholder="Nombre del cliente"
              value={customerName}
              onChangeText={setCustomerName}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Header de tabla */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 3 }]}>Producto</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Precio</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Stock</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Cantidad</Text>
          </View>
        </View>

        {/* Lista de productos renderizada como componentes */}
        <View style={styles.productsContainer}>
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchTerm ? '🔍 No se encontraron productos' : '📦 No hay productos registrados'}
              </Text>
            </View>
          ) : (
            filteredProducts.map((product, index) => (
              <View key={product.id}>
                <ProductItem 
                  product={product} 
                  currentQuantity={getProductQuantity(product.id)}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                />
                {index < filteredProducts.length - 1 && <View style={styles.separator} />}
              </View>
            ))
          )}
        </View>

        {/* Footer con botones (solo cuando hay productos seleccionados) */}
        {getSaleItems().length > 0 && (
          <View style={styles.footerInline}>
            <View style={styles.actions}>
              <Button
                title="❌ Cancelar"
                onPress={() => navigation.goBack()}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title={loading ? '⏳ Facturando...' : '💰 Facturar'}
                onPress={handleProcessSale}
                disabled={loading || getSaleItems().length === 0 || !customerName.trim()}
                style={styles.actionButton}
              />
            </View>
          </View>
        )}
        
        {/* Indicador simple de productos seleccionados */}
        {getSaleItems().length > 0 && (
          <View style={styles.quickSummary}>
            <Text style={styles.quickSummaryText}>
              📦 {getSaleItems().length} productos • Total: $COP {getTotalAmount().toLocaleString('es-CO')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  headerContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingBottom: 8,
  },
  inputsContainer: {
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 12,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1f2937',
  },
  customerContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  customerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  customerInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1f2937',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  productsList: {
    flex: 1,
  },
  productsListContent: {
    paddingBottom: 200, // Espacio para el footer absoluto
  },
  productRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  productRowDisabled: {
    backgroundColor: '#f9fafb',
    opacity: 0.6,
  },
  productNameColumn: {
    flex: 3,
    paddingRight: 8,
  },
  productPriceColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  productStockColumn: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 8,
  },
  quantityColumn: {
    flex: 2,
    alignItems: 'center',
    paddingLeft: 8,
  },
  productInfo: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  productCode: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 2,
  },
  productStock: {
    fontSize: 12,
    color: '#6b7280',
  },
  productStockLow: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  productStockEmpty: {
    color: '#ef4444',
    fontWeight: '600',
  },
  quantitySection: {
    alignItems: 'center',
    minWidth: 120,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quantityButton: {
    backgroundColor: '#3b82f6',
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  quantityButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  quantityButtonTextDisabled: {
    color: '#9ca3af',
  },
  quantityDisplay: {
    minWidth: 40,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  quantityNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  subtotal: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  summaryContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  summaryItemDetail: {
    fontSize: 12,
    color: '#6b7280',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  productsContainer: {
    backgroundColor: '#ffffff',
  },
  footerInline: {
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 16,
    marginTop: 16,
  },
  quickSummary: {
    backgroundColor: '#3b82f6',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickSummaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CatalogSalesScreen;
