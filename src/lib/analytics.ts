import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Get device type
const getDeviceType = (): string => {
  const platform = Capacitor.getPlatform();
  if (platform === 'ios' || platform === 'android') {
    return 'mobile-native';
  }
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Check if user is authenticated
const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

/**
 * Track a custom event via edge function with rate limiting
 */
export async function trackEvent(
  eventName: string,
  eventType: string = 'custom',
  properties?: Record<string, any>
) {
  try {
    // Only track for authenticated users
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      console.log('Analytics skipped: user not authenticated');
      return;
    }

    const { error } = await supabase.functions.invoke('track-analytics', {
      body: {
        type: 'event',
        data: {
          event_type: eventType,
          event_name: eventName,
          session_id: getSessionId(),
          properties: properties || {},
          page_path: window.location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          device_type: getDeviceType(),
        }
      }
    });

    if (error) {
      // Handle rate limiting gracefully
      if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
        console.log('Analytics rate limited, event skipped');
        return;
      }
      console.error('Analytics tracking error:', error);
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

/**
 * Track a page view via edge function with rate limiting
 */
export async function trackPageView(
  pagePath: string,
  pageTitle: string
) {
  try {
    // Only track for authenticated users
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      console.log('Page view skipped: user not authenticated');
      return;
    }

    const { error } = await supabase.functions.invoke('track-analytics', {
      body: {
        type: 'page_view',
        data: {
          page_path: pagePath,
          page_title: pageTitle,
          session_id: getSessionId(),
          referrer: document.referrer || null,
        }
      }
    });

    if (error) {
      // Handle rate limiting gracefully
      if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
        console.log('Analytics rate limited, page view skipped');
        return;
      }
      console.error('Page view tracking error:', error);
    }
  } catch (error) {
    console.error('Page view tracking error:', error);
  }
}

/**
 * Track button click
 */
export function trackButtonClick(buttonName: string, properties?: Record<string, any>) {
  return trackEvent(buttonName, 'button_click', properties);
}

/**
 * Track form submission
 */
export function trackFormSubmit(formName: string, properties?: Record<string, any>) {
  return trackEvent(formName, 'form_submit', properties);
}

/**
 * Track product view
 */
export function trackProductView(productSku: string, productName: string) {
  return trackEvent('product_view', 'engagement', {
    product_sku: productSku,
    product_name: productName,
  });
}

/**
 * Track purchase intent (e.g., "Buy Now" click)
 */
export function trackPurchaseIntent(productSku: string, productName: string, price: number) {
  return trackEvent('purchase_intent', 'conversion', {
    product_sku: productSku,
    product_name: productName,
    price,
  });
}

/**
 * Track search
 */
export function trackSearch(query: string, resultCount: number) {
  return trackEvent('search', 'engagement', {
    query,
    result_count: resultCount,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(featureName: string, properties?: Record<string, any>) {
  return trackEvent(featureName, 'feature_usage', properties);
}
