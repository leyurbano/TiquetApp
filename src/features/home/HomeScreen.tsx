// src/features/home/HomeScreen.tsx
import React from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Button } from '../../components/ui';

// 🎯 Tipo para navegación tipada
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

/**
 * � Pantalla de inicio usando sistema de diseño global
 */
export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const goToProducts = () => {
    navigation.navigate('Products');
  };

  const goToSales = () => {
    navigation.navigate('Sales');
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
            Tu sistema de gestión de inventario y ventas
          </Text>
        </View>

        {/* Panel de Control */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Panel de Control</Text>
          
          <View style={styles.iconRow}>
            <View style={styles.iconItem}>
              <Text style={styles.icon}>📦</Text>
              <Text style={styles.iconLabel}>Productos</Text>
            </View>
            
            <View style={styles.iconItem}>
              <Text style={styles.icon}>💰</Text>
              <Text style={styles.iconLabel}>Ventas</Text>
            </View>
            
            <View style={styles.iconItem}>
              <Text style={styles.icon}>📈</Text>
              <Text style={styles.iconLabel}>Reportes</Text>
            </View>
          </View>
        </View>

        {/* Acciones principales */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>¿Qué quieres hacer hoy?</Text>
          
          <Button
            title="📦 Gestionar Productos"
            onPress={goToProducts}
            variant="primary"
            size="large"
            style={styles.buttonSpacing}
          />
          
          <Button
            title="💰 Ver Ventas"
            onPress={goToSales}
            variant="success"
            size="large"
            style={styles.buttonSpacing}
          />
          
          <Button
            title="📊 Generar Reportes"
            onPress={() => {/* TODO: Implementar reportes */}}
            variant="outline"
            size="large"
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
            TiquetApp v1.0.0 - Hecho con ❤️ para tu negocio
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
  card: {
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
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconItem: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 30,
    marginBottom: 8,
  },
  iconLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  actionsSection: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  buttonSpacing: {
    marginVertical: 8,
  },
  tipCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1d4ed8',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#3730a3',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
