import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.642988111ba749c48d3f955402e50443',
  appName: 'morefitlyfe',
  webDir: 'dist',
  server: {
    url: 'https://64298811-1ba7-49c4-8d3f-955402e50443.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    permissions: [
      "android.permission.CAMERA",
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.USE_BIOMETRIC",
      "android.permission.USE_FINGERPRINT"
    ],
    // Deep linking configuration
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    contentInset: "automatic",
    // Deep linking configuration
    scheme: "morefitlyfe"
  },
  plugins: {
    StatusBar: {
      // iOS configuration
      iosOverlaysWebView: false,
      iosStyle: 'light', // White text/icons on iOS
      iosStatusBarPadding: true,
      // Android configuration  
      androidOverlaysWebView: false,
      backgroundColor: '#FF6B35', // Brand orange for Android
      androidStyle: 'light' // White text/icons on Android
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: "#FF6B35",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#FFFFFF",
      splashFullScreen: true,
      splashImmersive: true
    },
    Camera: {
      NSCameraUsageDescription: "This app needs camera access to take photos",
      NSPhotoLibraryUsageDescription: "This app needs photo library access to select images",
      NSPhotoLibraryAddUsageDescription: "This app needs permission to save photos to your library",
      androidPermissions: [
        "android.permission.CAMERA",
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    },
    BiometricAuth: {
      NSFaceIDUsageDescription: "This app uses Face ID to authenticate you securely"
    }
  }
};

export default config;
