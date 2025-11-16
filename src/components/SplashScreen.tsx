import { useEffect, useState } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export const SplashScreenManager = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      // Only run on native platforms
      if (Capacitor.isNativePlatform()) {
        try {
          // Keep splash screen visible while app initializes
          await SplashScreen.show({
            showDuration: 2000,
            autoHide: false,
          });

          // Simulate app initialization (replace with actual initialization logic)
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Hide splash screen with fade animation
          await SplashScreen.hide({
            fadeOutDuration: 500,
          });

          setIsReady(true);
        } catch (error) {
          console.error('Splash screen error:', error);
          setIsReady(true);
        }
      } else {
        // Web platform - show immediately
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  // Optional: Show a loading overlay for web
  if (!isReady && !Capacitor.isNativePlatform()) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#FF6B35] to-[#F7931E]">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-white mb-2 animate-fade-in">MFL</h1>
            <p className="text-xl text-white/90 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              MORE FIT LYFE
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

