import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setStatusBarColor, setStatusBarStyle } from '@/hooks/useStatusBar';

/**
 * Component to dynamically control status bar appearance based on current route
 * Add this component if you want different status bar colors for different pages
 */
export const StatusBarController = () => {
  const location = useLocation();

  useEffect(() => {
    const updateStatusBar = async () => {
      // Customize status bar per route
      switch (location.pathname) {
        case '/':
          // Home page - brand orange
          await setStatusBarColor('#FF6B35');
          await setStatusBarStyle('light');
          break;
        
        case '/programs':
        case '/programs/:sku':
          // Programs - brand orange
          await setStatusBarColor('#FF6B35');
          await setStatusBarStyle('light');
          break;
        
        case '/meal-plans':
          // Meal plans - could use a different shade
          await setStatusBarColor('#F7931E');
          await setStatusBarStyle('light');
          break;
        
        case '/mobile-features':
          // Mobile features demo
          await setStatusBarColor('#FF6B35');
          await setStatusBarStyle('light');
          break;
        
        default:
          // Default brand color
          await setStatusBarColor('#FF6B35');
          await setStatusBarStyle('light');
      }
    };

    updateStatusBar();
  }, [location.pathname]);

  return null;
};
