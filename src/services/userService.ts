// src/services/userService.ts
import { supabase } from '../config/supabase';
import { UserInfo } from '../types';

export class UserService {
  // Obtener perfil del usuario actual
  static async getCurrentUserProfile(): Promise<UserInfo | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('users_info')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error al obtener perfil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error en getCurrentUserProfile:', error);
      return null;
    }
  }

  // Actualizar perfil del usuario
  static async updateUserProfile(updates: Partial<UserInfo>): Promise<UserInfo | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('users_info')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error al actualizar perfil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error en updateUserProfile:', error);
      return null;
    }
  }

  // Crear perfil completo del usuario (por si el trigger no funcionó)
  static async createUserProfile(userData: Partial<UserInfo>): Promise<UserInfo | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('users_info')
        .insert({
          id: user.id,
          full_name: userData.full_name || '',
          phone: userData.phone,
          role: userData.role || 'vendedor',
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error al crear perfil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error en createUserProfile:', error);
      return null;
    }
  }

  // Obtener todos los usuarios (para tenderos/proveedores)
  static async getAllUsers(role?: 'proveedor' | 'vendedor'): Promise<UserInfo[]> {
    try {
      let query = supabase
        .from('users_info')
        .select('*')
        .eq('is_active', true);

      if (role) {
        query = query.eq('role', role);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error al obtener usuarios:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error en getAllUsers:', error);
      return [];
    }
  }

  // Obtener tenderos para el selector de pedidos
  static async getTenderos(): Promise<UserInfo[]> {
    return this.getAllUsers('vendedor'); // Los tenderos son los que compran
  }

  // Obtener proveedores
  static async getProveedores(): Promise<UserInfo[]> {
    return this.getAllUsers('proveedor');
  }
}
