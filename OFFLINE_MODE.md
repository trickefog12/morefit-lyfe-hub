# Offline Mode Documentation

## Overview
Your app now supports full offline functionality, allowing users to access programs, meal plans, and other content even without an internet connection.

## Features

### 1. Service Worker
- Automatically caches essential assets and pages
- Provides offline fallback for all routes
- Updates cache in the background
- Network-first strategy for API calls with cache fallback

### 2. Local Data Storage
- Uses IndexedDB for structured data (programs, reviews)
- 24-hour cache validity period
- Automatic cache invalidation
- Efficient data synchronization

### 3. Offline Indicator
- Visual banner when offline
- Toast notifications for connection changes
- Real-time network status monitoring

## How It Works

### Caching Strategy

**Static Assets (JS, CSS, Images)**
- Cache first, network fallback
- Immediate availability offline
- Cached on first visit

**API Requests**
- Network first, cache fallback
- Cached for 24 hours
- Automatic refresh when online

**HTML Pages**
- Network first, cache fallback
- SPA routing preserved offline

### Data Storage

```typescript
// Products/Programs are cached automatically
import { useOfflineProducts } from '@/hooks/useOfflineProducts';

const { products, isOffline, usedCache } = useOfflineProducts();
// products: Array of programs/meal plans
// isOffline: Boolean indicating connection status
// usedCache: Boolean indicating if data came from cache
```

### Manual Cache Management

```typescript
import { 
  cacheAllProducts,
  getAllCachedProducts,
  clearAllCache 
} from '@/lib/offlineStorage';

// Cache products manually
await cacheAllProducts(products);

// Get cached products
const cached = await getAllCachedProducts();

// Clear all cache
await clearAllCache();
```

## Testing Offline Mode

### In Browser DevTools
1. Open DevTools (F12)
2. Go to Application/Storage tab
3. Find "Service Workers" section
4. Check "Offline" checkbox
5. Reload the page

### Network Throttling
1. Open DevTools Network tab
2. Select "Offline" from throttling dropdown
3. Test app functionality

### Mobile Testing
- Enable Airplane Mode on device
- Disconnect from WiFi
- Test all cached routes

## Cached Content

### Always Available Offline
- Home page
- Programs page
- Meal plans page
- Mobile features page
- Previously viewed program details
- App icons and images
- CSS and JavaScript bundles

### Requires Online Connection
- Initial data load (if no cache)
- Stripe checkout
- Form submissions
- User authentication
- Push notifications setup

## Best Practices

### For Users
1. **Browse online first**: Visit pages you want available offline while connected
2. **Check offline indicator**: Look for the banner when offline
3. **Cache validity**: Data refreshes every 24 hours when online
4. **Storage limits**: Browser may clear cache if storage is low

### For Developers

#### Updating Service Worker
```bash
# After making changes to public/service-worker.js
# Increment CACHE_NAME version
const CACHE_NAME = 'morefitlyfe-v2'; // Was v1
```

#### Adding New Cached Routes
```javascript
// In public/service-worker.js
const PRECACHE_ASSETS = [
  '/',
  '/programs',
  '/meal-plans',
  '/your-new-route', // Add here
];
```

#### Caching New Data Types
```typescript
// In src/lib/offlineStorage.ts
interface OfflineDB extends DBSchema {
  products: { /* ... */ };
  reviews: { /* ... */ };
  newDataType: { // Add new store
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
    };
  };
}
```

## Cache Management

### Storage Limits
- Chrome: ~6% of free disk space
- Firefox: ~10% of free disk space
- Safari: ~1GB per origin

### Cache Invalidation
Automatic after 24 hours or when:
- User clears browser data
- Service worker updates
- Storage quota exceeded

### Manual Cache Clear
```typescript
// Clear all offline data
import { clearAllCache } from '@/lib/offlineStorage';
await clearAllCache();

// Unregister service worker
import { unregisterServiceWorker } from '@/lib/serviceWorker';
unregisterServiceWorker();
```

## Troubleshooting

### Service Worker Not Registering
**Symptoms**: Console shows registration failed
**Solutions**:
- Check HTTPS (required for service workers)
- Verify `/service-worker.js` exists in public folder
- Clear browser cache and reload
- Check browser console for errors

### Cache Not Working
**Symptoms**: Data not available offline
**Solutions**:
- Visit pages while online to cache them
- Check IndexedDB in DevTools → Application → Storage
- Verify cache hasn't expired (24h limit)
- Check browser storage quota

### Stale Content
**Symptoms**: Old content showing after updates
**Solutions**:
- Increment service worker `CACHE_NAME`
- Hard reload (Ctrl+Shift+R / Cmd+Shift+R)
- Clear browser cache
- Wait for automatic update (1 hour)

### Offline Indicator Not Showing
**Symptoms**: Banner doesn't appear when offline
**Solutions**:
- Check browser network status
- Verify `OfflineIndicator` component is in App.tsx
- Test with DevTools offline mode
- Check console for errors

## Advanced Configuration

### Adjust Cache Duration
```typescript
// In src/lib/offlineStorage.ts
const CACHE_DURATION = 48 * 60 * 60 * 1000; // Change to 48 hours
```

### Custom Offline Pages
```javascript
// In public/service-worker.js
return caches.match('/offline.html'); // Create custom offline page
```

### Background Sync
```javascript
// In public/service-worker.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reviews') {
    event.waitUntil(syncPendingReviews());
  }
});
```

## Performance Impact

### Initial Load
- Service worker registration: ~100ms
- IndexedDB initialization: ~50ms
- No noticeable impact on user experience

### Subsequent Loads
- Faster page loads (cached assets)
- Instant offline access
- Reduced bandwidth usage

### Storage Usage
- Service Worker cache: ~5-10MB (assets)
- IndexedDB: ~1-2MB (data)
- Total: ~6-12MB typically

## Browser Support

✅ **Fully Supported**
- Chrome 40+
- Firefox 44+
- Safari 11.1+
- Edge 17+

⚠️ **Partial Support**
- IE 11: No service worker support
- Safari iOS 11.3+: Limited storage

## Migration Guide

### Disabling Offline Mode
If you need to disable offline functionality:

1. **Remove Service Worker Registration**
```typescript
// In src/main.tsx
// Comment out or remove:
// registerServiceWorker();
```

2. **Unregister Existing Service Worker**
```typescript
import { unregisterServiceWorker } from '@/lib/serviceWorker';
unregisterServiceWorker();
```

3. **Remove Offline Indicator**
```typescript
// In src/App.tsx
// Remove: <OfflineIndicator />
```

## Security Considerations

1. **HTTPS Required**: Service workers only work on HTTPS
2. **Same-Origin Policy**: Cache only same-origin resources
3. **No Sensitive Data**: Don't cache authentication tokens
4. **Cache Headers**: Respect server cache-control headers

## Resources

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
- [Background Sync](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)
