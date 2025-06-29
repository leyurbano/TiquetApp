// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuthContext } from '../contexts/AuthContext';
import { AuthScreen } from '../screens/AuthScreen';
import HomeScreen from '../features/home/HomeScreen';
import ProductScreen from '../features/products/ProductScreen';
import SalesScreen from '../features/sales/SalesScreen';
import ControlPanelScreen from '../features/admin/ControlPanelScreen';

// 🎯 Tipos de navegación actualizados
export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Products: undefined;
  Sales: undefined;
  ControlPanel: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, loading, userProfile, signOut } = useAuthContext();

  // 🚪 Función para cerrar sesión
  const handleLogout = async () => {
    Alert.alert(
      '🚪 Cerrar Sesión',
      '¿Estás seguro que deseas salir de la aplicación?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await signOut();
              
              if (error) {
                Alert.alert('Error', 'No se pudo cerrar la sesión');
              } else {
                console.log('✅ Sesión cerrada correctamente');
              }
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'Error inesperado al cerrar sesión');
            }
          },
        },
      ]
    );
  };

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563eb',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          // Pantallas para usuarios no autenticados
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen}
            options={{ 
              title: 'TiquetApp',
              headerShown: false 
            }}
          />
        ) : (
          // Pantallas para usuarios autenticados
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ 
                title: `Hola ${userProfile?.full_name?.split(' ')[0] || 'Usuario'}`,
                headerRight: () => (
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={{
                      marginRight: 15,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <Text style={{
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: '600',
                    }}>
                      🚪 Salir
                    </Text>
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Screen 
              name="Products" 
              component={ProductScreen}
              options={{ title: '📦 Productos' }}
            />
            <Stack.Screen 
              name="Sales" 
              component={SalesScreen}
              options={{ title: '💰 Ventas' }}
            />
            <Stack.Screen 
              name="ControlPanel" 
              component={ControlPanelScreen}
              options={{ title: '⚙️ Panel de Control' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
