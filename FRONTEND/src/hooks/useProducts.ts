import { useEffect, useState } from 'react';
import { fetchProducts } from '../services/products';
import type { Product } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchProducts();

        if (isMounted) {
          setProducts(data);
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load products.');
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return { products, isLoading, error };
};