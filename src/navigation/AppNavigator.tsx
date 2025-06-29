// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../features/home/HomeScreen';
import ProductScreen from '../features/products/ProductScreen';
import SalesScreen from '../features/sales/SalesScreen';
import ControlPanelScreen from '../features/admin/ControlPanelScreen';

// 🎯 Tipos de navegación actualizados
export type RootStackParamList = {
  Home: undefined;
  Products: undefined;
  Sales: undefined;
  ControlPanel: undefined;  // ← Nueva pantalla agregada
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
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
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Hola User' }}
        />
        <Stack.Screen 
          name="Products" 
          component={ProductScreen}
          options={{ title: ' Productos' }}
        />
        <Stack.Screen 
          name="Sales" 
          component={SalesScreen}
          options={{ title: ' Ventas' }}
        />
        <Stack.Screen 
          name="ControlPanel" 
          component={ControlPanelScreen}
          options={{ title: ' Panel de Control' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
