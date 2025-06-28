// src/config/env.ts
export const config = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://nlooupvilogctiqvnfbl.supabase.co',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sb291cHZpbG9nY3RpcXZuZmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5OTMxMjYsImV4cCI6MjA2NjU2OTEyNn0.4IwaA7T5a_2mb5d1DTKpr-8oakDMF7fEs25LSK_M7Zw',
  },
  app: {
    name: process.env.EXPO_PUBLIC_APP_NAME || 'TiquetApp',
    version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.EXPO_PUBLIC_APP_ENV || 'development',
  },
};

export default config;
