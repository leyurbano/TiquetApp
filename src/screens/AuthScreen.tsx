// src/screens/AuthScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuthContext } from '../contexts/AuthContext';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  const { signIn, signUp } = useAuthContext();

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (!isLogin && !formData.fullName) {
      Alert.alert('Error', 'El nombre completo es obligatorio para el registro');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login
        console.log('🔐 Intentando login para:', formData.email);
        const result = await signIn(formData.email, formData.password);
        
        if (result.error) {
          console.log('❌ Error de login:', result.error);
          
          let errorMessage = result.error;
          if (result.error.includes('Invalid login credentials')) {
            errorMessage = 'Email o contraseña incorrectos.\n\nVerifica tus credenciales e intenta nuevamente.';
          }
          
          Alert.alert('Error de Login', errorMessage);
        } else {
          console.log('✅ Login exitoso');
          Alert.alert('¡Éxito!', 'Has iniciado sesión correctamente');
        }
      } else {
        // Registro
        console.log('📝 Intentando registro para:', formData.email);
        const result = await signUp(formData.email, formData.password, formData.fullName, formData.phone);
        
        if (result.error) {
          console.log('❌ Error de registro:', result.error);
          
          let errorMessage = result.error;
          if (result.error.includes('Database error')) {
            errorMessage = 'Error de base de datos al crear la cuenta.\n\nPor favor, intenta nuevamente en unos momentos.';
          } else if (result.error.includes('already registered')) {
            errorMessage = 'Este email ya está registrado.\n\nPrueba iniciar sesión en su lugar.';
          }
          
          Alert.alert('Error de Registro', errorMessage);
        } else {
          console.log('✅ Registro exitoso');
          Alert.alert(
            '¡Registro Exitoso!', 
            'Tu cuenta ha sido creada correctamente. Ya puedes usar la aplicación.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>
          {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
        </Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/logoApp.png')}
      style={styles.container}
      resizeMode="contain"
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <StatusBar 
            barStyle="light-content" 
            backgroundColor="rgba(0,0,0,0.3)" 
            translucent={false} 
          />
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.header}>
              <Text style={styles.welcomeTitle}>¡Bienvenidos!</Text>
              <Text style={styles.subtitle}>
                {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta nueva'}
              </Text>
            </View>

            <View style={styles.form}>
          {!isLogin && (
            <>
              <Input
                label="Nombre Completo"
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                placeholder="Ingresa tu nombre completo"
                autoCapitalize="words"
              />
              
              <Input
                label="Teléfono (Opcional)"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Ingresa tu teléfono"
                keyboardType="phone-pad"
              />
            </>
          )}

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Contraseña"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            placeholder="Tu contraseña"
            secureTextEntry
          />

          <Button
            title={isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.switchText}>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          </Text>
          <Button
            title={isLogin ? 'Crear Cuenta' : 'Iniciar Sesión'}
            onPress={() => setIsLogin(!isLogin)}
            variant="outline"
          />
          
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>
</ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    top: 20, // Subido aún más (era 50)
    left: '50%',
    marginLeft: '-30%',
    width: '60%',
    height: '25%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // Capa semitransparente más suave
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 80, // Bajado un poco más (era sin marginTop)
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  form: {
    marginBottom: 32,
  },
  submitButton: {
    marginTop: 20,
  },
  footer: {
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  versionText: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
