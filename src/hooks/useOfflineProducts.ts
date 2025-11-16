import { useState, useEffect } from 'react';
import { useOffline } from './useOffline';
import { 
  getAllCachedProducts, 
  cacheAllProducts,
  getCachedProduct,
  cacheProduct,
  isCacheValid 
} from '@/lib/offlineStorage';
import { products as staticProducts } from '@/data/products';

export const useOfflineProducts = () => {
  const [products, setProducts] = useState(staticProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [usedCache, setUsedCache] = useState(false);
  const { isOffline } = useOffline();

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);

      // If offline, try to get cached data
      if (isOffline) {
        const cachedProducts = await getAllCachedProducts();
        if (cachedProducts.length > 0) {
          setProducts(cachedProducts);
          setUsedCache(true);
        } else {
          // Use static fallback if no cache
          setProducts(staticProducts);
          setUsedCache(false);
        }
        setIsLoading(false);
        return;
      }

      // If online, check if we should use cache or fetch fresh
      const cacheValid = await isCacheValid('products');
      
      if (cacheValid) {
        const cachedProducts = await getAllCachedProducts();
        if (cachedProducts.length > 0) {
          setProducts(cachedProducts);
          setUsedCache(true);
          setIsLoading(false);
          return;
        }
      }

      // Use static data and cache it
      setProducts(staticProducts);
      await cacheAllProducts(staticProducts);
      setUsedCache(false);
      setIsLoading(false);
    };

    loadProducts();
  }, [isOffline]);

  const getProductBySku = async (sku: string) => {
    // Try cache first
    const cached = await getCachedProduct(sku);
    if (cached) {
      return cached;
    }

    // Fallback to static data
    const product = staticProducts.find(p => p.sku === sku);
    if (product) {
      // Cache it for next time
      await cacheProduct(sku, product);
      return product;
    }

    return null;
  };

  return {
    products,
    isLoading,
    usedCache,
    isOffline,
    getProductBySku,
  };
};
