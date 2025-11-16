import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { toast } from '@/hooks/use-toast';

export const useDeepLinking = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let listenerHandle: any;

    const setupDeepLinking = async () => {
      const handleDeepLink = (event: URLOpenListenerEvent) => {
        try {
          const url = event.url;
          console.log('Deep link received:', url);

          // Parse the URL
          const urlObj = new URL(url);
          const path = urlObj.pathname;
          const params = urlObj.searchParams;

          // Handle different URL schemes
          // Example URLs:
          // morefitlyfe://programs
          // morefitlyfe://programs/beginner-powerlifting
          // https://morefitlyfe.com/programs
          
          if (path) {
            // Navigate to the specified path
            navigate(path);
            
            toast({
              title: "Opening link",
              description: `Navigating to ${path}`,
            });

            // Handle query parameters if needed
            if (params.toString()) {
              console.log('Query parameters:', Object.fromEntries(params));
            }
          }
        } catch (error) {
          console.error('Error handling deep link:', error);
          toast({
            title: "Link error",
            description: "Failed to open the link",
            variant: "destructive",
          });
        }
      };

      // Listen for URL open events
      listenerHandle = await App.addListener('appUrlOpen', handleDeepLink);

      // Check for initial URL when app launches
      const result = await App.getLaunchUrl();
      if (result?.url) {
        handleDeepLink({ url: result.url });
      }
    };

    setupDeepLinking();

    // Cleanup listener on unmount
    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [navigate]);
};
