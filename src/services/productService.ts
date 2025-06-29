// src/services/productService.new.ts
import { supabase } from "../config/supabase";
import { Product, CreateProduct, UpdateProduct } from "../features/products/types";

/**
 * 📊 Obtener todos los productos de la tabla products
 */
export async function getProducts(): Promise<Product[]> {
  try {
    console.log('📊 Obteniendo productos desde Supabase...');
    
    const { data, error } = await supabase
      .from('products') // tabla en minúsculas
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener productos:', error.message);
      return [];
    }

    console.log('✅ Productos obtenidos exitosamente:', data?.length || 0);
    return data as Product[];
    
  } catch (error) {
    console.error('💥 Error inesperado al obtener productos:', error);
    return [];
  }
}

/**
 * 🔍 Obtener un producto por ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    console.log(`🔍 Obteniendo producto con ID: ${id}`);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error al obtener producto:', error.message);
      return null;
    }

    console.log('✅ Producto obtenido:', data);
    return data as Product;
    
  } catch (error) {
    console.error('💥 Error inesperado al obtener producto:', error);
    return null;
  }
}

/**
 * ➕ Crear un nuevo producto
 */
export async function createProduct(productData: CreateProduct): Promise<Product | null> {
  try {
    console.log('➕ Creando nuevo producto:', productData);
    
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear producto:', error.message);
      return null;
    }

    console.log('✅ Producto creado exitosamente:', data);
    return data as Product;
    
  } catch (error) {
    console.error('💥 Error inesperado al crear producto:', error);
    return null;
  }
}

/**
 * ✏️ Actualizar un producto existente
 */
export async function updateProduct(id: string, updates: UpdateProduct): Promise<Product | null> {
  try {
    console.log(`✏️ Actualizando producto ${id}:`, updates);
    
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar producto:', error.message);
      return null;
    }

    console.log('✅ Producto actualizado exitosamente:', data);
    return data as Product;
    
  } catch (error) {
    console.error('💥 Error inesperado al actualizar producto:', error);
    return null;
  }
}

/**
 * 🗑️ Eliminar un producto
 */
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    console.log(`🗑️ Eliminando producto con ID: ${id}`);
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error al eliminar producto:', error.message);
      return false;
    }

    console.log('✅ Producto eliminado exitosamente');
    return true;
    
  } catch (error) {
    console.error('💥 Error inesperado al eliminar producto:', error);
    return false;
  }
}

/**
 * 🧪 Insertar productos de prueba
 */
export async function insertTestProducts(): Promise<boolean> {
  try {
    console.log('🧪 Insertando productos de prueba...');
    
    const testProducts = [
      { name: 'Smartphone Samsung Galaxy', price: 299.99, stock: 15 },
      { name: 'Laptop HP Pavilion', price: 599.99, stock: 8 },
      { name: 'Auriculares Sony WH-1000XM4', price: 199.99, stock: 25 },
      { name: 'Tablet iPad Air', price: 449.99, stock: 12 },
      { name: 'Monitor LG 27 pulgadas', price: 179.99, stock: 20 }
    ];

    const { data, error } = await supabase
      .from('products')
      .insert(testProducts)
      .select();

    if (error) {
      console.error('❌ Error al insertar productos de prueba:', error.message);
      return false;
    }

    console.log('✅ Productos de prueba insertados exitosamente:', data?.length);
    return true;
    
  } catch (error) {
    console.error('💥 Error inesperado al insertar productos de prueba:', error);
    return false;
  }
}

/**
 * 📋 Obtener información de la tabla products
 */
export async function getTableInfo(): Promise<void> {
  try {
    console.log('📋 Obteniendo información de la tabla products...');
    
    // Obtener una muestra de datos
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error al obtener info de tabla:', error.message);
      return;
    }

    console.log('📊 Estructura de la tabla products:', data?.[0] || 'Tabla vacía');
    
  } catch (error) {
    console.error('💥 Error inesperado al obtener info de tabla:', error);
  }
}
