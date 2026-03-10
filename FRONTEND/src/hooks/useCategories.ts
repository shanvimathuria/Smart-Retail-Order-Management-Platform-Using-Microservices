import { useEffect, useState } from 'react';
import { fetchCategories } from '../services/categories';
import type { StoreCategory } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCategories();

        if (isMounted) {
          setCategories(data);
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load categories.');
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, isLoading, error };
};
