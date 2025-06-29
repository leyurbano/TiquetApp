// src/features/products/types.ts
// Re-export types from the main types file
export type { 
  Product, 
  ProductWithDetails,
  UserInfo 
} from '../../types';

// Import for local use
import { Product } from '../../types';

/**
 * 🔧 Tipo para crear un producto
 */
export type CreateProduct = {
  id?: number;
  name: string;
  price: number;
  stock: number;
};

/**
 * 🔧 Tipo para actualizar un producto
 */
export type UpdateProduct = {
  name?: string;
  price?: number;
  stock?: number;
};

/**
 * 🎯 Estados de carga para la UI
 */
export interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}
