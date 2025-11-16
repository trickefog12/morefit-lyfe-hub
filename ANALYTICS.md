# Analytics Documentation

## Overview
Your app now includes a comprehensive analytics system that tracks user engagement, feature usage, and page views using Supabase.

## Features

### Automatic Tracking
- **Page Views**: Automatically tracked on every route change
- **Session Management**: Unique session IDs per browser session
- **User Attribution**: Links events to authenticated users
- **Device Detection**: Tracks mobile, tablet, desktop, and native app usage

### Custom Event Tracking
Track any custom event in your app:
- Button clicks
- Form submissions
- Product views
- Purchase intents
- Feature usage
- Search queries
- And more...

## Usage

### 1. Automatic Page View Tracking

Page views are automatically tracked when users navigate. The `usePageViewTracking` hook is already integrated in `App.tsx`.

### 2. Track Custom Events

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

const MyComponent = () => {
  const analytics = useAnalytics();

  const handleClick = async () => {
    await analytics.trackButtonClick('signup_button', {
      source: 'homepage',
      campaign: 'winter_sale'
    });
  };

  return <button onClick={handleClick}>Sign Up</button>;
};
```

### 3. Track Product Views

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

const ProductDetail = ({ product }) => {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackProductView(product.sku, product.name);
  }, [product.sku]);

  // ... rest of component
};
```

### 4. Track Purchase Intent

```typescript
const handleBuyNow = async () => {
  await analytics.trackPurchaseIntent(
    product.sku,
    product.name,
    product.price
  );
  // Proceed with checkout...
};
```

### 5. Track Form Submissions

```typescript
const handleFormSubmit = async (data) => {
  await analytics.trackFormSubmit('contact_form', {
    form_type: 'contact',
    has_message: !!data.message
  });
  // Submit form...
};
```

### 6. Track Feature Usage

```typescript
// When user uses a mobile feature
const handleCameraUse = async () => {
  await analytics.trackFeatureUsage('camera_access', {
    source: 'profile_photo'
  });
  // Open camera...
};
```

## Available Tracking Functions

### `trackEvent(eventName, eventType, properties)`
Generic event tracking function.

**Parameters:**
- `eventName` (string): Name of the event
- `eventType` (string): Type category (e.g., 'click', 'engagement', 'conversion')
- `properties` (object): Additional data about the event

**Example:**
```typescript
await trackEvent('newsletter_subscribe', 'conversion', {
  source: 'footer',
  email_provider: 'gmail'
});
```

### `trackButtonClick(buttonName, properties)`
Track button click events.

**Example:**
```typescript
await trackButtonClick('buy_now', {
  product_sku: 'PROG-001',
  price: 29.99
});
```

### `trackFormSubmit(formName, properties)`
Track form submission events.

**Example:**
```typescript
await trackFormSubmit('review_form', {
  rating: 5,
  has_comment: true
});
```

### `trackProductView(productSku, productName)`
Track when users view products.

**Example:**
```typescript
await trackProductView('PROG-001', '3 Month Powerlifting Program');
```

### `trackPurchaseIntent(productSku, productName, price)`
Track when users show purchase intent.

**Example:**
```typescript
await trackPurchaseIntent('PROG-001', 'Powerlifting Program', 29.99);
```

### `trackSearch(query, resultCount)`
Track search activity.

**Example:**
```typescript
await trackSearch('powerlifting', 5);
```

### `trackFeatureUsage(featureName, properties)`
Track usage of specific features.

**Example:**
```typescript
await trackFeatureUsage('offline_mode', {
  cached_items: 10
});
```

## Database Schema

### analytics_events Table
Stores all custom events.

**Columns:**
- `id`: Unique event identifier
- `event_type`: Category of event (click, engagement, conversion, etc.)
- `event_name`: Specific event name
- `user_id`: User who triggered event (null if not authenticated)
- `session_id`: Browser session identifier
- `properties`: JSON object with custom event data
- `page_path`: Current page path
- `referrer`: Previous page URL
- `user_agent`: Browser user agent
- `device_type`: Device category (mobile, tablet, desktop, mobile-native)
- `created_at`: Timestamp

### analytics_page_views Table
Stores page view events.

**Columns:**
- `id`: Unique view identifier
- `page_path`: Path viewed
- `page_title`: Page title
- `user_id`: User viewing the page
- `session_id`: Session identifier
- `referrer`: Referrer URL
- `duration_seconds`: Time spent on page (optional)
- `created_at`: Timestamp

## Querying Analytics Data

### View Recent Events
```sql
SELECT 
  event_name,
  event_type,
  COUNT(*) as event_count
FROM analytics_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY event_name, event_type
ORDER BY event_count DESC;
```

### View Most Popular Pages
```sql
SELECT 
  page_path,
  COUNT(*) as views,
  COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_page_views
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY page_path
ORDER BY views DESC;
```

### View User Journey
```sql
SELECT 
  page_path,
  created_at
FROM analytics_page_views
WHERE session_id = 'YOUR_SESSION_ID'
ORDER BY created_at;
```

### Track Conversion Funnel
```sql
-- Example: Product view -> Purchase intent
SELECT 
  DATE(created_at) as date,
  COUNT(CASE WHEN event_name = 'product_view' THEN 1 END) as views,
  COUNT(CASE WHEN event_name = 'purchase_intent' THEN 1 END) as intents,
  ROUND(
    100.0 * COUNT(CASE WHEN event_name = 'purchase_intent' THEN 1 END) / 
    NULLIF(COUNT(CASE WHEN event_name = 'product_view' THEN 1 END), 0), 
    2
  ) as conversion_rate
FROM analytics_events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Device Distribution
```sql
SELECT 
  device_type,
  COUNT(*) as sessions,
  COUNT(DISTINCT user_id) as unique_users
FROM analytics_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY device_type
ORDER BY sessions DESC;
```

## Privacy & Data Management

### User Privacy
- Users can be tracked anonymously (without user_id)
- Authenticated users have their activity linked to their account
- All analytics data is stored securely in your Supabase database

### Data Retention
Consider implementing a data retention policy:

```sql
-- Delete analytics data older than 90 days
DELETE FROM analytics_events 
WHERE created_at < NOW() - INTERVAL '90 days';

DELETE FROM analytics_page_views 
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Opt-Out Mechanism
If you want to allow users to opt out of tracking:

```typescript
// In localStorage
const hasOptedOut = localStorage.getItem('analytics_opt_out') === 'true';

// Modify tracking functions to check opt-out
if (hasOptedOut) {
  return; // Don't track
}
```

## Best Practices

1. **Be Specific with Event Names**
   ```typescript
   // ✅ Good
   await trackButtonClick('homepage_hero_signup');
   
   // ❌ Too generic
   await trackButtonClick('button');
   ```

2. **Include Relevant Properties**
   ```typescript
   // ✅ Good - includes context
   await trackEvent('video_play', 'engagement', {
     video_id: '123',
     duration: 120,
     auto_play: false
   });
   
   // ❌ Missing context
   await trackEvent('video_play', 'engagement');
   ```

3. **Track User Journeys**
   ```typescript
   // Track steps in a multi-step process
   await trackEvent('checkout_started', 'conversion');
   await trackEvent('payment_info_entered', 'conversion');
   await trackEvent('purchase_completed', 'conversion');
   ```

4. **Avoid Tracking Sensitive Data**
   ```typescript
   // ❌ Don't track PII
   await trackEvent('form_submit', 'conversion', {
     email: user.email, // NO!
     password: 'secret' // DEFINITELY NO!
   });
   
   // ✅ Track anonymized data
   await trackEvent('form_submit', 'conversion', {
     has_email: true,
     field_count: 5
   });
   ```

5. **Performance Considerations**
   ```typescript
   // Analytics tracking is non-blocking
   // Fire and forget - don't await unless necessary
   analytics.trackButtonClick('quick_action');
   
   // Continue with your logic immediately
   handleQuickAction();
   ```

## Troubleshooting

### Events Not Being Tracked

1. **Check Browser Console**
   Look for any error messages related to analytics

2. **Verify Database Tables**
   ```sql
   SELECT COUNT(*) FROM analytics_events;
   SELECT COUNT(*) FROM analytics_page_views;
   ```

3. **Check RLS Policies**
   Ensure insert policies allow anonymous tracking:
   ```sql
   -- Should exist
   SELECT * FROM pg_policies 
   WHERE tablename = 'analytics_events' 
   AND cmd = 'INSERT';
   ```

### High Data Volume

If you're collecting too much data:

1. **Implement Sampling**
   ```typescript
   // Only track 10% of events
   if (Math.random() < 0.1) {
     await trackEvent('common_action', 'engagement');
   }
   ```

2. **Use Aggregation**
   Create summary tables instead of storing every event

3. **Archive Old Data**
   Move old data to cold storage

## Future Enhancements

Consider adding:
- Real-time analytics dashboard
- Custom reports and visualizations
- A/B testing framework
- Heatmap tracking
- Error tracking
- Performance monitoring
- User replay sessions

## Resources

- [Supabase Analytics Tutorial](https://supabase.com/docs/guides/analytics)
- [Google Analytics Event Tracking](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Mixpanel Event Reference](https://developer.mixpanel.com/docs/javascript)
