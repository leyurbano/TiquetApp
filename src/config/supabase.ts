// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { config } from './env'

export const supabase = createClient(
  config.supabase.url, 
  config.supabase.anonKey,
  {
    auth: {
      // Configurar almacenamiento persistente para mantener la sesión
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
)
