import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';

/**
 * Hook to automatically track page views
 * Add this to your App component or any top-level component
 */
export const usePageViewTracking = () => {
  const location = useLocation();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Track page view
    const pageTitle = document.title || 'Unknown Page';
    trackPageView(location.pathname, pageTitle);
    
    // Reset start time for duration tracking
    startTimeRef.current = Date.now();

    // Optional: Track page duration when leaving
    return () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (duration > 0) {
        // You can track duration here if needed
        console.log(`User spent ${duration}s on ${location.pathname}`);
      }
    };
  }, [location.pathname]);
};

/**
 * Hook to get analytics tracking functions
 */
export const useAnalytics = () => {
  return {
    trackEvent: async (eventName: string, eventType?: string, properties?: Record<string, any>) => {
      const { trackEvent } = await import('@/lib/analytics');
      return trackEvent(eventName, eventType, properties);
    },
    trackButtonClick: async (buttonName: string, properties?: Record<string, any>) => {
      const { trackButtonClick } = await import('@/lib/analytics');
      return trackButtonClick(buttonName, properties);
    },
    trackFormSubmit: async (formName: string, properties?: Record<string, any>) => {
      const { trackFormSubmit } = await import('@/lib/analytics');
      return trackFormSubmit(formName, properties);
    },
    trackProductView: async (productSku: string, productName: string) => {
      const { trackProductView } = await import('@/lib/analytics');
      return trackProductView(productSku, productName);
    },
    trackPurchaseIntent: async (productSku: string, productName: string, price: number) => {
      const { trackPurchaseIntent } = await import('@/lib/analytics');
      return trackPurchaseIntent(productSku, productName, price);
    },
    trackFeatureUsage: async (featureName: string, properties?: Record<string, any>) => {
      const { trackFeatureUsage } = await import('@/lib/analytics');
      return trackFeatureUsage(featureName, properties);
    },
  };
};
