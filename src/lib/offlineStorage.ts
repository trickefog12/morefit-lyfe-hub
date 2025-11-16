import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDB extends DBSchema {
  products: {
    key: string;
    value: {
      sku: string;
      data: any;
      timestamp: number;
    };
  };
  reviews: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
    };
  };
}

const DB_NAME = 'morefitlyfe-offline';
const DB_VERSION = 1;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

let db: IDBPDatabase<OfflineDB> | null = null;

async function getDB(): Promise<IDBPDatabase<OfflineDB>> {
  if (db) return db;

  db = await openDB<OfflineDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      // Create products store
      if (!database.objectStoreNames.contains('products')) {
        database.createObjectStore('products', { keyPath: 'sku' });
      }
      
      // Create reviews store
      if (!database.objectStoreNames.contains('reviews')) {
        database.createObjectStore('reviews', { keyPath: 'id' });
      }
    },
  });

  return db;
}

// Product (Programs/Meal Plans) Cache
export async function cacheProduct(sku: string, data: any) {
  const database = await getDB();
  await database.put('products', {
    sku,
    data,
    timestamp: Date.now(),
  });
}

export async function getCachedProduct(sku: string): Promise<any | null> {
  try {
    const database = await getDB();
    const cached = await database.get('products', sku);
    
    if (!cached) return null;
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      await database.delete('products', sku);
      return null;
    }
    
    return cached.data;
  } catch (error) {
    console.error('Error getting cached product:', error);
    return null;
  }
}

export async function cacheAllProducts(products: any[]) {
  const database = await getDB();
  const tx = database.transaction('products', 'readwrite');
  
  await Promise.all([
    ...products.map(product => 
      tx.store.put({
        sku: product.sku,
        data: product,
        timestamp: Date.now(),
      })
    ),
    tx.done,
  ]);
}

export async function getAllCachedProducts(): Promise<any[]> {
  try {
    const database = await getDB();
    const allProducts = await database.getAll('products');
    
    // Filter out expired cache
    const validProducts = allProducts.filter(
      item => Date.now() - item.timestamp <= CACHE_DURATION
    );
    
    return validProducts.map(item => item.data);
  } catch (error) {
    console.error('Error getting all cached products:', error);
    return [];
  }
}

// Reviews Cache
export async function cacheReviews(reviews: any[]) {
  const database = await getDB();
  const tx = database.transaction('reviews', 'readwrite');
  
  await Promise.all([
    ...reviews.map(review => 
      tx.store.put({
        id: review.id,
        data: review,
        timestamp: Date.now(),
      })
    ),
    tx.done,
  ]);
}

export async function getAllCachedReviews(): Promise<any[]> {
  try {
    const database = await getDB();
    const allReviews = await database.getAll('reviews');
    
    // Filter out expired cache
    const validReviews = allReviews.filter(
      item => Date.now() - item.timestamp <= CACHE_DURATION
    );
    
    return validReviews.map(item => item.data);
  } catch (error) {
    console.error('Error getting cached reviews:', error);
    return [];
  }
}

// Clear all cache
export async function clearAllCache() {
  const database = await getDB();
  await database.clear('products');
  await database.clear('reviews');
}

// Check cache validity
export async function isCacheValid(storeName: 'products' | 'reviews'): Promise<boolean> {
  try {
    const database = await getDB();
    const items = await database.getAll(storeName);
    
    if (items.length === 0) return false;
    
    // Check if any item is still valid
    return items.some(item => Date.now() - item.timestamp <= CACHE_DURATION);
  } catch (error) {
    return false;
  }
}
