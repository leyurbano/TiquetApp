import React from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Button, LoadingSpinner } from '../../components/ui';
import { insertTestProducts } from '../../services/productService';
import { useDashboardStats } from './useDashboardStats';

// 🎯 Tipo para navegación tipada
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

/**
 * 🏠 Pantalla principal de TiquetApp
 */
export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { totalProducts, totalSales, totalRevenue, loading, error, refetch } = useDashboardStats();

  // 🚀 Navegación principal
  const goToProducts = () => {
    navigation.navigate('Products');
  };

  const goToSales = () => {
    navigation.navigate('Sales');
  };

  const goToControlPanel = () => {
    navigation.navigate('ControlPanel');
  };

  // 💰 Ir a crear nueva venta
  const goToNewSale = () => {
    // TODO: Implementar pantalla de nueva venta
    Alert.alert('🚧 Próximamente', 'Función de venta en desarrollo');
  };

  // 🧪 Función para insertar datos de prueba (desarrollo)
  const addSampleData = async () => {
    try {
      Alert.alert('🌱 Insertando...', 'Agregando productos de ejemplo...');
      
      const success = await insertTestProducts();
      
      if (success) {
        // Refrescar estadísticas después de agregar productos
        refetch();
        
        Alert.alert(
          '✅ ¡Listo!', 
          'Se agregaron 5 productos de ejemplo. Ve al Catálogo para verlos.',
          [
            { text: 'OK' },
            { text: 'Ver Catálogo', onPress: goToProducts }
          ]
        );
      } else {
        Alert.alert('❌ Error', 'No se pudieron agregar los productos de ejemplo');
      }
    } catch (error) {
      Alert.alert('💥 Error', 'Error inesperado al agregar productos');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎫 TiquetApp</Text>
          <Text style={styles.subtitle}>
            Sistema de gestión empresarial
          </Text>
        </View>

        {/* Acciones Principales */}
        <View style={styles.mainActions}>
          <Text style={styles.sectionTitle}>Acciones Principales</Text>
          
          {/* Grid de 3 botones principales */}
          <View style={styles.mainButtonsGrid}>
            <View style={styles.mainButtonContainer}>
              <Button
                title="💰 Nueva Venta"
                onPress={goToNewSale}
                variant="success"
                size="large"
                style={styles.mainButton}
              />
            </View>
            
            <View style={styles.mainButtonContainer}>
              <Button
                title="📦 Catálogo"
                onPress={goToProducts}
                variant="primary"
                size="large"
                style={styles.mainButton}
              />
            </View>
            
            <View style={styles.mainButtonContainer}>
              <Button
                title="⚙️ Panel Control"
                onPress={goToControlPanel}
                variant="outline"
                size="large"
                style={styles.mainButton}
              />
            </View>
          </View>
        </View>

        {/* Panel de Resumen */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Resumen del Negocio</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner />
              <Text style={styles.loadingText}>Cargando estadísticas...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>❌ {error}</Text>
              <Button
                title="🔄 Reintentar"
                onPress={refetch}
                variant="outline"
                size="small"
                style={styles.retryButton}
              />
            </View>
          ) : (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalSales}</Text>
                <Text style={styles.statLabel}>Ventas Hoy</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalProducts}</Text>
                <Text style={styles.statLabel}>Productos</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>${totalRevenue}</Text>
                <Text style={styles.statLabel}>Ingresos</Text>
              </View>
            </View>
          )}
        </View>

        {/* Acciones Secundarias */}
        <View style={styles.secondaryActions}>
          <Text style={styles.sectionTitle}>Gestión</Text>
          
          <Button
            title="� Ver Reportes de Ventas"
            onPress={goToSales}
            variant="outline"
            size="medium"
            style={styles.buttonSpacing}
          />
          
          <Button
            title="🌱 Agregar Productos Demo"
            onPress={addSampleData}
            variant="secondary"
            size="medium"
            style={styles.buttonSpacing}
          />
        </View>

        {/* Consejo del día */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Consejo del día</Text>
          <Text style={styles.tipText}>
            Mantén tu inventario actualizado para tomar mejores decisiones de negocio.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            TiquetApp v1.0.0 - Gestión empresarial moderna
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  // 🚀 Estilos para acciones principales
  mainActions: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  mainButtonsGrid: {
    gap: 12,
  },
  mainButtonContainer: {
    marginVertical: 6,
  },
  mainButton: {
    minHeight: 56,
  },
  // 📊 Estilos para card de resumen
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  // 🔧 Estilos para acciones secundarias
  secondaryActions: {
    marginVertical: 16,
  },
  buttonSpacing: {
    marginVertical: 6,
  },
  // 💡 Estilos para tip card
  tipCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d4ed8',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  // 🏷️ Estilos para footer
  footer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  // 📊 Estilos para estados de carga y error
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    minWidth: 120,
  },
});