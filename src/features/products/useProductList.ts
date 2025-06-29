// src/features/products/useProductList.ts
import { useState, useEffect } from 'react';
import { getProducts } from '../../services/productService';
import { Product } from './types';

export const useProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      console.log('🔄 Iniciando fetchProducts...');
      setLoading(true);
      setError(null);
      
      // Verificar que la función existe
      if (typeof getProducts !== 'function') {
        throw new Error('getProducts no es una función válida');
      }
      
      const data = await getProducts();
      console.log('📊 Datos recibidos:', data);
      setProducts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los productos';
      setError(errorMessage);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const refetch = () => {
    fetchProducts();
  };

  return {
    products,
    loading,
    error,
    refetch,
  };
};