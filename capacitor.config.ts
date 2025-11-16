import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.642988111ba749c48d3f955402e50443',
  appName: 'morefitlyfe',
  webDir: 'dist',
  server: {
    url: 'https://64298811-1ba7-49c4-8d3f-955402e50443.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    Camera: {
      // iOS permissions
      NSCameraUsageDescription: "This app needs camera access to take photos",
      NSPhotoLibraryUsageDescription: "This app needs photo library access to select images",
      NSPhotoLibraryAddUsageDescription: "This app needs permission to save photos to your library",
      // Android permissions
      androidPermissions: [
        "android.permission.CAMERA",
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    },
    BiometricAuth: {
      // iOS - Face ID permission
      NSFaceIDUsageDescription: "This app uses Face ID to authenticate you securely"
    }
  },
  android: {
    permissions: [
      "android.permission.CAMERA",
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.USE_BIOMETRIC",
      "android.permission.USE_FINGERPRINT"
    ]
  },
  ios: {
    contentInset: "automatic"
  }
};

export default config;
