// src/features/sales/SaleCard.tsx
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/currency';
import { Sale } from './types';

/**
 * 🎯 Props interface para el componente SaleCard
 */
interface SaleCardProps {
  sale: Sale;
}

/**
 * 🎯 Componente que muestra una venta individual
 */
export const SaleCard: React.FC<SaleCardProps> = ({ sale }) => {
  /**
   * 🎯 Función para formatear la fecha
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * 🎯 Función para generar color basado en el monto
   */
  const getAmountColor = (total: number): string => {
    if (total >= 100000) return '#10b981'; // Verde para ventas altas
    if (total >= 50000) return '#f59e0b';  // Amarillo para ventas medias
    return '#6b7280'; // Gris para ventas bajas
  };

  return (
    <Card>
      {/* Header con ID y fecha */}
      <View style={styles.header}>
        <Text style={styles.saleId}>Venta #{sale.id}</Text>
        <Text style={styles.date}>{formatDate(sale.sale_date)}</Text>
      </View>

      {/* Información del producto */}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{sale.product_name}</Text>
        <Text style={styles.quantity}>
          Cantidad: {sale.quantity} × {formatCurrency(sale.unit_price)}
        </Text>
        {sale.customer_name && (
          <Text style={styles.customer}>Cliente: {sale.customer_name}</Text>
        )}
      </View>

      {/* Total de la venta */}
      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={[
          styles.totalAmount,
          { color: getAmountColor(sale.total) }
        ]}>
          {formatCurrency(sale.total)}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  saleId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
  },
  productInfo: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 2,
  },
  customer: {
    fontSize: 14,
    color: '#6366f1',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
