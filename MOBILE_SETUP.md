# Mobile App Setup Guide

## App Icons Configuration

### Automatic Icon & Splash Screen Generation (Recommended)

After pulling the project from GitHub, you can use Capacitor's asset generation tool:

1. Place your app icon at `public/app-icon.png` (1024x1024px, already generated)
2. Place your splash screen at `public/splash.png` (1920x1920px, already generated)
3. Install the asset generator:
   ```bash
   npm install -g @capacitor/assets
   ```
4. Generate all required icon and splash screen sizes:
   ```bash
   npx capacitor-assets generate --iconBackgroundColor '#FF6B35' --iconBackgroundColorDark '#F7931E' --splashBackgroundColor '#FF6B35'
   ```

This will automatically create:
- iOS app icons in all required sizes
- Android adaptive icons with proper backgrounds
- Splash screens for both platforms in all required sizes
- Dark mode variants

### Manual Icon Setup (Alternative)

#### iOS Icons
Place icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`:
- Icon-20@2x.png (40x40)
- Icon-20@3x.png (60x60)
- Icon-29@2x.png (58x58)
- Icon-29@3x.png (87x87)
- Icon-40@2x.png (80x80)
- Icon-40@3x.png (120x120)
- Icon-60@2x.png (120x120)
- Icon-60@3x.png (180x180)
- Icon-76.png (76x76)
- Icon-76@2x.png (152x152)
- Icon-83.5@2x.png (167x167)
- Icon-1024.png (1024x1024)

#### Android Icons
Place icons in `android/app/src/main/res/`:
- mipmap-mdpi/ic_launcher.png (48x48)
- mipmap-hdpi/ic_launcher.png (72x72)
- mipmap-xhdpi/ic_launcher.png (96x96)
- mipmap-xxhdpi/ic_launcher.png (144x144)
- mipmap-xxxhdpi/ic_launcher.png (192x192)

## Splash Screen Configuration

A branded splash screen has been configured with:
- 2-second display duration
- Smooth fade-out animation (500ms)
- Orange gradient background matching brand colors
- Automatic hiding after app initialization
- Full-screen immersive mode on Android

The splash screen will automatically show when the app launches and hide once initialization is complete.

### Customizing Splash Screen Timing

To adjust the splash screen display duration, edit `capacitor.config.ts`:
```typescript
SplashScreen: {
  launchShowDuration: 2000, // Change this value (milliseconds)
  launchFadeOutDuration: 500, // Fade animation duration
  // ... other options
}
```

## Permissions Configuration

All required permissions have been configured in `capacitor.config.ts`:

### iOS Permissions (Info.plist)
- **Camera**: `NSCameraUsageDescription`
- **Photo Library**: `NSPhotoLibraryUsageDescription`
- **Photo Library Add**: `NSPhotoLibraryAddUsageDescription`
- **Face ID**: `NSFaceIDUsageDescription`

These will be automatically added to your iOS project's Info.plist when you run `npx cap sync`.

### Android Permissions (AndroidManifest.xml)
- Camera access
- Photo library access
- Push notifications
- Biometric authentication (fingerprint/face)

These permissions are automatically added to AndroidManifest.xml when you run `npx cap sync`.

## Build & Deploy Steps

### Initial Setup
1. Export project to GitHub
2. Clone locally: `git clone <your-repo-url>`
3. Install dependencies: `npm install`
4. Add platforms:
   ```bash
   npx cap add ios
   npx cap add android
   ```

### Development Workflow
1. Make changes in Lovable or locally
2. Build the web app: `npm run build`
3. Sync changes to native projects: `npx cap sync`
4. Run on device/emulator:
   ```bash
   # Android
   npx cap run android
   
   # iOS (requires Mac)
   npx cap run ios
   ```

### Important Notes
- Always run `npx cap sync` after:
  - Adding new native plugins
  - Changing configuration
  - Building a new version of your web app
  
- For iOS development, you need:
  - macOS
  - Xcode installed
  - Apple Developer account (for device testing)

- For Android development, you need:
  - Android Studio installed
  - Android SDK configured

## Testing Native Features

Visit `/mobile-features` in your app to test:
- Camera access
- Push notifications
- Biometric authentication

These features only work on physical devices or emulators, not in web preview.

## Production Build

### iOS (App Store)
1. Open project in Xcode: `npx cap open ios`
2. Configure signing & capabilities
3. Archive and upload to App Store Connect

### Android (Google Play)
1. Open project in Android Studio: `npx cap open android`
2. Generate signed APK or App Bundle
3. Upload to Google Play Console

## Troubleshooting

### Permissions Not Working
- Make sure you've run `npx cap sync` after configuration changes
- Check that permission descriptions are present in Info.plist (iOS) or AndroidManifest.xml (Android)
- Uninstall and reinstall the app to reset permission prompts

### Icons Not Showing
- Verify icon files are in correct directories
- Run `npx cap sync` to copy resources
- Clean and rebuild the project

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Update Capacitor CLI: `npm install -g @capacitor/cli`
- Check that Node.js version is compatible (v16 or higher recommended)

## Resources
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Material Design](https://material.io/design)
