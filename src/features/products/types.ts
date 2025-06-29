// src/features/products/types.ts

/**
 * 📦 Interfaz del Producto - Coincide exactamente con tu tabla products de Supabase
 * 
 * Campos en tu tabla:
 * - id: int (número entero)
 * - name: text (texto)
 * - price: numeric (número decimal)
 * - stock: int (número entero)
 * - created_at: timestamptz (timestamp con zona horaria)
 */
export interface Product {
  id: number;           // int
  name: string;         // text
  price: number;        // numeric
  stock: number;        // int
  created_at: string;   // timestamptz (se recibe como string en formato ISO)
}

/**
 * 🔧 Tipo para crear un producto
 * - id: opcional (si no se proporciona, se auto-genera)
 * - name, price, stock: obligatorios
 */
export type CreateProduct = {
  id?: number;          // opcional - ID personalizado
  name: string;
  price: number;
  stock: number;
};

/**
 * 🔧 Tipo para actualizar un producto (todos los campos opcionales excepto ID)
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
