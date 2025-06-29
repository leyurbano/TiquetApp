// src/features/admin/ControlPanelScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Alert,
  TouchableOpacity 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Button } from '../../components/ui';

// 🎯 Tipo para navegación tipada
type ControlPanelScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ControlPanel'>;

/**
 * ⚙️ Panel de Control - Gestión administrativa de TiquetApp
 */
export default function ControlPanelScreen() {
  const navigation = useNavigation<ControlPanelScreenNavigationProp>();

  // 🏠 Volver al inicio
  const goHome = () => {
    navigation.navigate('Home');
  };

  // 📦 Ir a productos
  const goToProducts = () => {
    navigation.navigate('Products');
  };

  // 💰 Ir a ventas
  const goToSales = () => {
    navigation.navigate('Sales');
  };

  // 🔧 Funciones administrativas
  const manageUsers = () => {
    Alert.alert('🚧 Próximamente', 'Gestión de usuarios en desarrollo');
  };

  const generateReports = () => {
    Alert.alert('🚧 Próximamente', 'Generación de reportes en desarrollo');
  };

  const configureApp = () => {
    Alert.alert('🚧 Próximamente', 'Configuración de la app en desarrollo');
  };

  const exportData = () => {
    Alert.alert('🚧 Próximamente', 'Exportación de datos en desarrollo');
  };

  const viewAnalytics = () => {
    Alert.alert('🚧 Próximamente', 'Analytics en desarrollo');
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
          <Text style={styles.title}>⚙️ Panel de Control</Text>
          <Text style={styles.subtitle}>
            Administración y configuración del sistema
          </Text>
        </View>

        {/* Accesos Rápidos */}
        <View style={styles.quickAccess}>
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
          
          <View style={styles.quickButtonsGrid}>
            <TouchableOpacity style={styles.quickButton} onPress={goToProducts}>
              <Text style={styles.quickButtonIcon}>📦</Text>
              <Text style={styles.quickButtonText}>Productos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickButton} onPress={goToSales}>
              <Text style={styles.quickButtonIcon}>💰</Text>
              <Text style={styles.quickButtonText}>Ventas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickButton} onPress={viewAnalytics}>
              <Text style={styles.quickButtonIcon}>📊</Text>
              <Text style={styles.quickButtonText}>Analytics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickButton} onPress={generateReports}>
              <Text style={styles.quickButtonIcon}>📈</Text>
              <Text style={styles.quickButtonText}>Reportes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gestión de Datos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestión de Datos</Text>
          
          <Button
            title="📊 Ver Reportes Detallados"
            onPress={generateReports}
            variant="primary"
            size="medium"
            style={styles.buttonSpacing}
          />
          
          <Button
            title="📤 Exportar Información"
            onPress={exportData}
            variant="outline"
            size="medium"
            style={styles.buttonSpacing}
          />
          
          <Button
            title="🔄 Sincronizar Datos"
            onPress={() => Alert.alert('🔄 Sincronizando...', 'Función en desarrollo')}
            variant="secondary"
            size="medium"
            style={styles.buttonSpacing}
          />
        </View>

        {/* Administración */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Administración</Text>
          
          <Button
            title="👥 Gestionar Usuarios"
            onPress={manageUsers}
            variant="outline"
            size="medium"
            style={styles.buttonSpacing}
          />
          
          <Button
            title="⚙️ Configuración General"
            onPress={configureApp}
            variant="outline"
            size="medium"
            style={styles.buttonSpacing}
          />
          
          <Button
            title="🔐 Seguridad y Permisos"
            onPress={() => Alert.alert('🔐 Seguridad', 'Configuración de seguridad en desarrollo')}
            variant="outline"
            size="medium"
            style={styles.buttonSpacing}
          />
        </View>

        {/* Estado del Sistema */}
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Estado del Sistema</Text>
          
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Base de Datos</Text>
              <Text style={styles.statusValue}>✅ Conectada</Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Última Sincronización</Text>
              <Text style={styles.statusValue}>Hace 5 min</Text>
            </View>
          </View>
          
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Espacio de Almacenamiento</Text>
              <Text style={styles.statusValue}>85% Disponible</Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Versión</Text>
              <Text style={styles.statusValue}>v1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Botón de regreso */}
        <View style={styles.backSection}>
          <Button
            title="🏠 Volver al Inicio"
            onPress={goHome}
            variant="secondary"
            size="large"
          />
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
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  quickAccess: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  quickButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  quickButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickButtonText: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
  },
  section: {
    marginVertical: 16,
  },
  buttonSpacing: {
    marginVertical: 6,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  statusItem: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  backSection: {
    marginTop: 24,
    marginBottom: 16,
  },
});
