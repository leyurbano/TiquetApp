// src/services/productService.ts
import { supabase } from "../config/supabase"
import { Product } from "../features/products/types"

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) {
    console.error('Error al obtener productos:', error.message)
    return []
  }

  return data as Product[]
}
