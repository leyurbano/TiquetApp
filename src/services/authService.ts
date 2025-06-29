// src/services/authService.ts
import { supabase } from '../config/supabase';
import { UserService } from './userService';

export class AuthService {
  // Registrar nuevo usuario (SIN TRIGGER - Manual)
  static async signUp(email: string, password: string, fullName: string, phone?: string) {
    try {
      console.log('🔐 Iniciando registro para:', email);
      console.log('📋 Datos enviados:', { email, fullName, phone });

      // Paso 1: Crear usuario en auth.users
      console.log('📝 Llamando a supabase.auth.signUp...');
      
      const signUpData = {
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || ''
          }
        }
      };
      
      console.log('📋 Payload completo para signUp:', JSON.stringify(signUpData, null, 2));
      
      const { data, error } = await supabase.auth.signUp(signUpData);

      if (error) {
        console.error('❌ Error en auth.signUp:', error);
        console.error('❌ Error code:', error.status);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        return { success: false, error: error.message };
      }

      if (!data.user) {
        console.error('❌ No se obtuvo el usuario después del registro');
        return { success: false, error: 'Error interno: No se creó el usuario' };
      }

      console.log('✅ Usuario creado en auth.users:', data.user.id);

      // Paso 2: Crear perfil manualmente en users_info
      try {
        console.log('📝 Insertando perfil en users_info para ID:', data.user.id);
        
        const insertData = {
          id: data.user.id,
          full_name: fullName,
          phone: phone || '',
          role: 'vendedor',
          is_active: true
        };
        
        console.log('📋 Datos del perfil a insertar:', insertData);

        const { data: insertResult, error: profileError } = await supabase
          .from('users_info')
          .insert(insertData)
          .select();

        if (profileError) {
          console.error('❌ Error creando perfil en users_info:', profileError);
          console.error('❌ Código de error:', profileError.code);
          console.error('❌ Mensaje:', profileError.message);
          console.error('❌ Detalles:', profileError.details);
          console.error('❌ Hint:', profileError.hint);
          console.log('⚠️ Usuario creado en auth pero sin perfil en users_info');
          
          // El usuario de auth ya existe, así que no es un error fatal
          return { 
            success: true, 
            user: data.user, 
            warning: 'Usuario creado pero sin perfil completo',
            profileError: profileError
          };
        }

        console.log('✅ Resultado de la inserción:', insertResult);

        console.log('✅ Perfil creado en users_info exitosamente');
        return { success: true, user: data.user };

      } catch (profileError) {
        console.error('❌ Error inesperado creando perfil:', profileError);
        return { 
          success: true, 
          user: data.user, 
          warning: 'Usuario creado pero sin perfil completo' 
        };
      }

    } catch (error) {
      console.error('💥 Error inesperado en signUp:', error);
      return { success: false, error: 'Error inesperado durante el registro' };
    }
  }

  // Iniciar sesión
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Error en login:', error);
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error inesperado en signIn:', error);
      return { success: false, error: 'Error inesperado' };
    }
  }

  // Cerrar sesión
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error en logout:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error('Error inesperado en signOut:', error);
      return { success: false, error: 'Error inesperado' };
    }
  }

  // Obtener usuario actual
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error obteniendo usuario:', error);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error inesperado en getCurrentUser:', error);
      return null;
    }
  }

  // Crear usuario de prueba (solo para desarrollo)
  static async createTestUser() {
    try {
      console.log('🧪 Creando usuario de prueba...');
      
      const testEmail = `test${Date.now()}@tiquet.app`;
      const testPassword = 'password123';
      const testName = 'Usuario de Prueba';

      const result = await this.signUp(testEmail, testPassword, testName);
      
      if (result.success) {
        console.log('✅ Usuario de prueba creado:', testEmail);
        
        // Intentar hacer login automáticamente
        const loginResult = await this.signIn(testEmail, testPassword);
        
        if (loginResult.success) {
          console.log('✅ Login automático exitoso');
          return { 
            success: true, 
            email: testEmail, 
            password: testPassword,
            user: loginResult.user 
          };
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error creando usuario de prueba:', error);
      return { success: false, error: 'Error creando usuario de prueba' };
    }
  }

  // Login anónimo (crear sesión temporal)
  static async signInAnonymously() {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error('Error en login anónimo:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Login anónimo exitoso');
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error inesperado en signInAnonymously:', error);
      return { success: false, error: 'Error inesperado' };
    }
  }
}
