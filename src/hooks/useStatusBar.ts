import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

interface StatusBarConfig {
  backgroundColor?: string;
  style?: 'light' | 'dark';
}

export const useStatusBar = (config?: StatusBarConfig) => {
  useEffect(() => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const configureStatusBar = async () => {
      try {
        // Set status bar style (light = white icons, dark = black icons)
        await StatusBar.setStyle({ 
          style: config?.style === 'dark' ? Style.Dark : Style.Light 
        });

        // Set background color (Android only)
        if (config?.backgroundColor && Capacitor.getPlatform() === 'android') {
          await StatusBar.setBackgroundColor({ 
            color: config.backgroundColor 
          });
        }

        // Show the status bar if hidden
        await StatusBar.show();
      } catch (error) {
        console.error('Error configuring status bar:', error);
      }
    };

    configureStatusBar();
  }, [config?.backgroundColor, config?.style]);
};

export const hideStatusBar = async () => {
  if (Capacitor.isNativePlatform()) {
    await StatusBar.hide();
  }
};

export const showStatusBar = async () => {
  if (Capacitor.isNativePlatform()) {
    await StatusBar.show();
  }
};

export const setStatusBarColor = async (color: string) => {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    await StatusBar.setBackgroundColor({ color });
  }
};

export const setStatusBarStyle = async (style: 'light' | 'dark') => {
  if (Capacitor.isNativePlatform()) {
    await StatusBar.setStyle({ 
      style: style === 'dark' ? Style.Dark : Style.Light 
    });
  }
};
