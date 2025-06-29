// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { UserInfo } from '../types';
import { UserService } from '../services/userService';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserInfo | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: string | null }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ data: any; error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await UserService.getCurrentUserProfile();
        setUserProfile(profile);
        console.log('✅ Perfil actualizado:', profile?.full_name);
      } catch (error) {
        console.error('Error actualizando perfil:', error);
      }
    } else {
      setUserProfile(null);
    }
  };

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('🔐 Auth state change:', _event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Cargar perfil cuando cambie el usuario
  useEffect(() => {
    refreshProfile();
  }, [user]);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      setLoading(true);
      console.log('🔐 Iniciando registro para:', email);
      
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

      if (error) {
        console.log('❌ Error en signUp:', error.message);
        throw error;
      }

      console.log('✅ Usuario registrado en auth:', data.user?.id);

      // Si el registro es exitoso, intentar crear/verificar el perfil manualmente
      if (data.user) {
        try {
          // Intentar crear el perfil manualmente si el trigger falló
          const { data: existingProfile } = await supabase
            .from('users_info')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (!existingProfile) {
            console.log('📝 Creando perfil manualmente...');
            const { error: profileError } = await supabase
              .from('users_info')
              .insert({
                id: data.user.id,
                full_name: fullName,
                phone: phone || '',
                role: 'vendedor',
                is_active: true,
              });

            if (profileError) {
              console.log('⚠️ Error creando perfil manualmente:', profileError.message);
              // No fallar el registro por esto
            } else {
              console.log('✅ Perfil creado manualmente');
            }
          } else {
            console.log('✅ Perfil ya existe (creado por trigger)');
          }
        } catch (profileError) {
          console.log('⚠️ Error manejando perfil:', profileError);
        }
      }

      return { data, error: null };
    } catch (error: any) {
      console.log('❌ Error en signUp:', error.message);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
