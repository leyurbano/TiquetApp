// src/services/productService.ts
import { supabase } from "../config/supabase";
import { Product, ProductWithDetails } from "../types";

/**
 * 📊 Obtener todos los productos de la tabla products
 */
export async function getProducts(): Promise<Product[]> {
  try {
    console.log('📊 Obteniendo productos desde Supabase...');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

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
 * 📊 Obtener productos con información del creador
 */
export async function getProductsWithDetails(): Promise<ProductWithDetails[]> {
  try {
    console.log('📊 Obteniendo productos con detalles...');
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        created_by_info:users_info(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener productos con detalles:', error.message);
      return [];
    }

    console.log('✅ Productos con detalles obtenidos:', data?.length || 0);
    return data as ProductWithDetails[];
    
  } catch (error) {
    console.error('💥 Error inesperado al obtener productos con detalles:', error);
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
export async function createProduct(productData: { id?: number; name: string; price: number; stock: number; }): Promise<Product | null> {
  try {
    console.log('➕ Creando nuevo producto:', productData);
    
    // Obtener el usuario actual para asignar user_id
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ No hay usuario autenticado');
      return null;
    }

    const insertData: any = {
      name: productData.name,
      price: productData.price,
      stock: productData.stock,
      user_id: user.id,
      is_active: true
    };

    // Solo incluir ID si se proporcionó
    if (productData.id) {
      insertData.id = productData.id;
    }

    console.log('📋 Datos a insertar:', insertData);
    
    const { data, error } = await supabase
      .from('products')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear producto:', error);
      console.error('❌ Detalles del error:', error.message, error.details, error.hint);
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
export async function updateProduct(id: string, updates: { name?: string; price?: number; stock?: number; }): Promise<Product | null> {
  try {
    console.log(`✏️ Actualizando producto ${id}:`, updates);
    
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar producto:', error);
      console.error('❌ Detalles del error:', error.message, error.details, error.hint);
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
 * 📦 Actualizar stock de un producto
 */
export async function updateProductStock(id: string, newStock: number, motivo?: string): Promise<boolean> {
  try {
    console.log(`📦 Actualizando stock del producto ${id} a ${newStock}`);
    
    // Obtener el stock actual
    const { data: currentProduct } = await supabase
      .from('products')
      .select('stock_actual')
      .eq('id', id)
      .single();

    if (!currentProduct) {
      console.error('❌ Producto no encontrado');
      return false;
    }

    const stockAnterior = currentProduct.stock_actual;
    const { data: { user } } = await supabase.auth.getUser();

    // Actualizar el stock del producto
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        stock_actual: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('❌ Error al actualizar stock:', updateError.message);
      return false;
    }

    // Registrar el movimiento de inventario
    const { error: movementError } = await supabase
      .from('movimientos_inventario')
      .insert({
        product_id: id,
        tipo_movimiento: 'ajuste',
        cantidad: newStock - stockAnterior,
        stock_anterior: stockAnterior,
        stock_nuevo: newStock,
        motivo: motivo || 'Ajuste manual de inventario',
        creado_por: user?.id
      });

    if (movementError) {
      console.error('⚠️ Error al registrar movimiento:', movementError.message);
      // No retornamos false porque el stock sí se actualizó
    }

    console.log('✅ Stock actualizado exitosamente');
    return true;
    
  } catch (error) {
    console.error('💥 Error inesperado al actualizar stock:', error);
    return false;
  }
}

/**
 * 🧪 Insertar productos de prueba
 */
export async function insertTestProducts(): Promise<boolean> {
  try {
    console.log('🧪 Insertando productos de prueba...');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const testProducts = [
      { 
        name: 'Coca Cola 600ml', 
        description: 'Bebida gaseosa sabor original',
        precio_compra: 800, 
        precio_venta: 1200, 
        stock_actual: 50,
        stock_minimo: 10,
        requiere_refrigeracion: true,
        created_by: user?.id
      },
      { 
        name: 'Pan Tajado Bimbo', 
        description: 'Pan de molde rebanado',
        precio_compra: 2000, 
        precio_venta: 2800, 
        stock_actual: 20,
        stock_minimo: 5,
        requiere_refrigeracion: false,
        created_by: user?.id
      },
      { 
        name: 'Leche Entera Alpina 1L', 
        description: 'Leche entera pasteurizada',
        precio_compra: 2500, 
        precio_venta: 3200, 
        stock_actual: 30,
        stock_minimo: 8,
        requiere_refrigeracion: true,
        created_by: user?.id
      }
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
 * � Obtener productos con bajo stock
 */
export async function getLowStockProducts(): Promise<Product[]> {
  try {
    console.log('� Obteniendo productos con bajo stock...');
    
    // Obtenemos todos los productos y filtramos en JavaScript
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('stock_actual', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener productos:', error.message);
      return [];
    }

    // Filtrar productos donde stock_actual <= stock_minimo
    const lowStockProducts = data?.filter(product => 
      product.stock_actual <= product.stock_minimo
    ) || [];

    console.log('✅ Productos con bajo stock obtenidos:', lowStockProducts.length);
    return lowStockProducts as Product[];
    
  } catch (error) {
    console.error('💥 Error inesperado al obtener productos con bajo stock:', error);
    return [];
  }
}
