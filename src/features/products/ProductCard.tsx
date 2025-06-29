// src/features/products/ProductCard.tsx
import React from 'react';
import { Text, StyleSheet, View, Dimensions } from 'react-native';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/currency';
import { Product } from './types';

// 📱 Obtener el ancho de la pantalla para calcular el ancho de cada card
const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2; // 48 = padding lateral (16*2) + gap entre cards (16)

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const getStockStatus = (stockValue: number) => {
    if (stockValue === 0) return { text: 'Sin stock', color: '#ef4444' };
    if (stockValue <= 5) return { text: 'Stock bajo', color: '#f59e0b' };
    return { text: 'Disponible', color: '#10b981' };
  };

  const stockStatus = getStockStatus(product.stock);

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
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
      </View>
      
      {/* 📦 Stock y estado */}
      <View style={styles.footer}>
        <Text style={styles.stockLabel}>Stock: {product.stock}</Text>
        <View style={[styles.statusBadge, { backgroundColor: stockStatus.color }]}>
          <Text style={styles.statusText}>{stockStatus.text}</Text>
        </View>
      </View>
      
      {/* 🆔 ID del producto */}
      <Text style={styles.idInfo}>ID: {product.id}</Text>
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
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: 12,
    color: '#6b7280',
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
  idInfo: {
    fontSize: 10,
    color: '#9ca3af',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});
