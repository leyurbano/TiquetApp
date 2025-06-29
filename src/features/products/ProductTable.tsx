// src/features/products/ProductTable.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { formatCurrency } from '../../utils/currency';
import { Product } from './types';

interface ProductTableProps {
  products: Product[];
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: number) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
}) => {
  // Debug: Log cuando se renderiza el componente
  console.log('📋 ProductTable renderizado con', products.length, 'productos');
  
  const getStockStatus = (stock: number) => {
    return stock === 0 
      ? { isAvailable: false, color: '#ef4444' } // Rojo para agotado
      : { isAvailable: true, color: '#10b981' };  // Verde para disponible
  };

  // Función para truncar el nombre del producto
  const formatProductName = (name: string) => {
    // Si es menor o igual a 12 caracteres, mostrar completo
    if (name.length <= 12) return name;
    
    // Si es mayor, buscar un espacio cerca del límite para cortar mejor
    const words = name.split(' ');
    let result = '';
    
    for (const word of words) {
      if ((result + word).length <= 12) {
        result += (result ? ' ' : '') + word;
      } else {
        break;
      }
    }
    
    // Si no pudimos formar ninguna palabra completa, truncar en 12
    return result || name.substring(0, 12);
  };

  // Función para formatear precio con máximo 6 dígitos
  const formatPrice = (price: number) => {
    // Si el precio tiene más de 6 dígitos, mostrar en formato compacto
    if (price >= 1000000) { // 1M o más
      return `$${Math.floor(price / 1000)}K`;
    }
    return formatCurrency(price).replace('COP', '').trim();
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      '🗑️ Eliminar Producto',
      `¿Estás seguro de que quieres eliminar "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDeleteProduct?.(product.id),
        },
      ]
    );
  };

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📋</Text>
        <Text style={styles.emptyMessage}>No hay productos para mostrar</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.cell, styles.headerCell, styles.idColumn]}>ID</Text>
          <Text style={[styles.cell, styles.headerCell, styles.nameColumn]}>Producto</Text>
          <Text style={[styles.cell, styles.headerCell, styles.priceColumn]}>Precio</Text>
          <Text style={[styles.cell, styles.headerCell, styles.stockColumn]}>Stock</Text>
          <Text style={[styles.cell, styles.headerCell, styles.statusColumn]}>Estado</Text>
          <Text style={[styles.cell, styles.headerCell, styles.actionsColumn]}>Acciones</Text>
        </View>

        {/* Rows */}
        {products.map((product, index) => {
          const stockStatus = getStockStatus(product.stock);
          const isEven = index % 2 === 0;

          return (
            <View
              key={product.id}
              style={[styles.row, isEven ? styles.evenRow : styles.oddRow]}
            >
              {/* ID */}
              <Text style={[styles.cell, styles.idColumn, styles.idText]}>
                {product.id}
              </Text>

              {/* Nombre */}
              <Text
                style={[styles.cell, styles.nameColumn, styles.nameText]}
                numberOfLines={3}
              >
                {formatProductName(product.name)}
              </Text>

              {/* Precio */}
              <Text style={[styles.cell, styles.priceColumn, styles.priceText]}>
                {formatPrice(product.price)}
              </Text>

              {/* Stock */}
              <Text style={[styles.cell, styles.stockColumn, styles.stockText]}>
                {product.stock}
              </Text>

              {/* Estado - Solo círculo de color */}
              <View style={[styles.cell, styles.statusColumn]}>
                <View
                  style={[
                    styles.statusCircle,
                    { backgroundColor: stockStatus.color }
                  ]}
                />
              </View>

              {/* Acciones */}
              <View style={[styles.cell, styles.actionsColumn, styles.actionsContainer]}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => onEditProduct?.(product)}
                >
                  <Text style={styles.editButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(product)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  table: {
    minWidth: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 2,
    borderBottomColor: '#d1d5db',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  evenRow: {
    backgroundColor: '#ffffff',
  },
  oddRow: {
    backgroundColor: '#f9fafb',
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    minHeight: 50, // Altura mínima para permitir texto en múltiples líneas
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#374151',
    fontSize: 14,
    backgroundColor: '#f3f4f6',
  },
  // Anchos de columnas
  idColumn: {
    width: 40, // Máximo 3 dígitos
    alignItems: 'center',
  },
  nameColumn: {
    width: 100, // Reducido para máximo 12 letras
    alignItems: 'center',
  },
  priceColumn: {
    width: 80, // Reducido para máximo 6 números
    alignItems: 'center',
  },
  stockColumn: {
    width: 60, // Máximo 5 dígitos
    alignItems: 'center',
  },
  statusColumn: {
    width: 60, // Solo círculo
    alignItems: 'center',
  },
  actionsColumn: {
    width: 80,
    alignItems: 'center',
  },
  // Estilos de texto
  idText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  nameText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  priceText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
    textAlign: 'center',
  },
  stockText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  // Estado como círculo
  statusCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  // Acciones
  actionsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#dbeafe',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  editButtonText: {
    fontSize: 14,
  },
  deleteButtonText: {
    fontSize: 14,
  },
  // Estado vacío
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});
