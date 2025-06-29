// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
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
  const { isAuthenticated, loading, userProfile } = useAuthContext();

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
                title: `Hola ${userProfile?.full_name || 'Usuario'}` 
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
