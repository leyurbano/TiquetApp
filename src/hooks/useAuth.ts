// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Session, User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || '',
          },
        },
      });

      if (error) throw error;

      // Si el registro es exitoso y hay un usuario, crear el perfil
      if (data.user) {
        try {
          // Crear perfil en users_info
          await supabase
            .from('users_info')
            .insert({
              id: data.user.id,
              full_name: fullName,
              phone: phone || '',
              role: 'vendedor', // Rol por defecto
              is_active: true,
            });

          console.log('✅ Perfil de usuario creado exitosamente');
        } catch (profileError) {
          console.log('⚠️ Error creando perfil (puede que el trigger lo haya creado):', profileError);
        }
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  // Función de prueba para crear usuario temporal
  const createTestUser = async () => {
    const testEmail = 'test@tiquet.app';
    const testPassword = 'password123456';
    const testName = 'Usuario de Prueba';
    const testPhone = '123456789';

    try {
      // Intentar login primero
      const loginResult = await signIn(testEmail, testPassword);
      
      if (loginResult.error) {
        // Si falla el login, intentar registro
        const signUpResult = await signUp(testEmail, testPassword, testName, testPhone);
        
        if (signUpResult.error) {
          throw new Error(signUpResult.error);
        }
        
        return { success: true, action: 'registered' };
      }
      
      return { success: true, action: 'logged_in' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    createTestUser,
    isAuthenticated: !!user,
  };
};
