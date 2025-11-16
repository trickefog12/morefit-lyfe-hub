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

// Get current user ID (if authenticated)
const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

/**
 * Track a custom event
 */
export async function trackEvent(
  eventName: string,
  eventType: string = 'custom',
  properties?: Record<string, any>
) {
  try {
    const userId = await getCurrentUserId();
    
    await supabase.from('analytics_events').insert({
      event_type: eventType,
      event_name: eventName,
      user_id: userId,
      session_id: getSessionId(),
      properties: properties || {},
      page_path: window.location.pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      device_type: getDeviceType(),
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

/**
 * Track a page view
 */
export async function trackPageView(
  pagePath: string,
  pageTitle: string
) {
  try {
    const userId = await getCurrentUserId();
    
    await supabase.from('analytics_page_views').insert({
      page_path: pagePath,
      page_title: pageTitle,
      user_id: userId,
      session_id: getSessionId(),
      referrer: document.referrer || null,
    });
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
