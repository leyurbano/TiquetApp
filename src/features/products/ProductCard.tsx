// src/features/products/ProductCard.tsx
import React from 'react';
import { Text, StyleSheet, View, Dimensions } from 'react-native';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/currency';
import { Product } from '../../types';

// 📱 Obtener el ancho de la pantalla para calcular el ancho de cada card
const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2; // 48 = padding lateral (16*2) + gap entre cards (16)

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const getStockStatus = (stockActual: number, stockMinimo: number) => {
    if (stockActual === 0) return { text: 'Sin stock', color: '#ef4444' };
    if (stockActual <= stockMinimo) return { text: 'Stock bajo', color: '#f59e0b' };
    return { text: 'Disponible', color: '#10b981' };
  };

  const stockStatus = getStockStatus(product.stock_actual, product.stock_minimo);

  // 📅 Formatear fecha de creación
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <Card style={styles.cardContainer}>
      {/* 📋 Información principal */}
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        {product.description && (
          <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
        )}
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Venta:</Text>
          <Text style={styles.price}>{formatCurrency(product.precio_venta)}</Text>
        </View>
        {product.precio_compra > 0 && (
          <View style={styles.priceContainer}>
            <Text style={styles.costLabel}>Compra:</Text>
            <Text style={styles.cost}>{formatCurrency(product.precio_compra)}</Text>
          </View>
        )}
      </View>
      
      {/* 📦 Stock y estado */}
      <View style={styles.footer}>
        <View style={styles.stockInfo}>
          <Text style={styles.stockLabel}>
            Stock: {product.stock_actual}/{product.stock_minimo}
          </Text>
          {product.requiere_refrigeracion && (
            <Text style={styles.refrigerationLabel}>❄️ Refrigeración</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: stockStatus.color }]}>
          <Text style={styles.statusText}>{stockStatus.text}</Text>
        </View>
      </View>
      
      {/* 📅 Fecha de creación */}
      <Text style={styles.dateInfo}>
        Creado: {formatDate(product.created_at)}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    marginBottom: 16,
    marginHorizontal: 0, // Eliminar margen horizontal para que funcione bien con numColumns
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  costLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  cost: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  stockInfo: {
    flex: 1,
  },
  stockLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  refrigerationLabel: {
    fontSize: 10,
    color: '#3b82f6',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  dateInfo: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
