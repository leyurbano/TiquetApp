// src/features/products/ProductCard.tsx
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/currency';
import { Product } from './types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Sin stock', color: '#ef4444' };
    if (stock <= 5) return { text: 'Stock bajo', color: '#f59e0b' };
    return { text: 'Disponible', color: '#10b981' };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.stockLabel}>Stock: {product.stock}</Text>
        <View style={[styles.statusBadge, { backgroundColor: stockStatus.color }]}>
          <Text style={styles.statusText}>{stockStatus.text}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});
