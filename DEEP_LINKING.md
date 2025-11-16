# Deep Linking Configuration Guide

## Overview
Deep linking allows users to open specific pages in your app from external sources like:
- Push notifications
- Email links
- SMS messages
- Social media posts
- QR codes
- Other apps

## URL Schemes

Your app supports two URL schemes:

### Custom Scheme (Recommended for Native)
```
morefitlyfe://path/to/page
```

**Examples:**
- `morefitlyfe://` - Opens app home
- `morefitlyfe://programs` - Opens programs page
- `morefitlyfe://programs/beginner-powerlifting` - Opens specific program
- `morefitlyfe://meal-plans` - Opens meal plans
- `morefitlyfe://mobile-features` - Opens mobile features

### Universal Links (iOS) / App Links (Android)
```
https://yourdomain.com/path/to/page
```

**Examples:**
- `https://morefitlyfe.com/programs`
- `https://morefitlyfe.com/programs/beginner-powerlifting`

## Testing Deep Links

### iOS Simulator
```bash
xcrun simctl openurl booted "morefitlyfe://programs"
```

### Android Emulator
```bash
adb shell am start -W -a android.intent.action.VIEW -d "morefitlyfe://programs" app.lovable.642988111ba749c48d3f955402e50443
```

### Physical Device
Send yourself a test link via:
- **Email**: Create an HTML link: `<a href="morefitlyfe://programs">Open Programs</a>`
- **SMS**: Just paste the URL: `morefitlyfe://programs`
- **QR Code**: Generate a QR code with your deep link URL

## iOS Configuration

### 1. Add URL Scheme (Already Configured)
The URL scheme `morefitlyfe` is already configured in `capacitor.config.ts`.

### 2. Configure Universal Links (Optional)
For production apps with a custom domain:

1. Create an `apple-app-site-association` file on your server:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.app.lovable.642988111ba749c48d3f955402e50443",
        "paths": ["/programs/*", "/meal-plans", "/mobile-features"]
      }
    ]
  }
}
```

2. Host it at: `https://yourdomain.com/.well-known/apple-app-site-association`

3. Add domain to Xcode:
   - Open `ios/App/App.xcodeproj` in Xcode
   - Select your target → Signing & Capabilities
   - Add "Associated Domains" capability
   - Add: `applinks:yourdomain.com`

## Android Configuration

### 1. Custom Scheme (Already Configured)
The custom scheme is automatically configured when you run `npx cap sync`.

### 2. Configure App Links (Optional)
For production apps with a custom domain:

1. Create an `assetlinks.json` file:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "app.lovable.642988111ba749c48d3f955402e50443",
    "sha256_cert_fingerprints": ["YOUR_CERT_FINGERPRINT"]
  }
}]
```

2. Host it at: `https://yourdomain.com/.well-known/assetlinks.json`

3. Get your certificate fingerprint:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

## Using Deep Links in Your App

### From Push Notifications
```typescript
import { PushNotifications } from '@capacitor/push-notifications';

// Send notification with deep link
const notification = {
  title: "New Program Available!",
  body: "Check out our beginner powerlifting program",
  data: {
    deepLink: "morefitlyfe://programs/beginner-powerlifting"
  }
};

// The deep link will automatically open when user taps notification
```

### From Email/SMS Marketing
```html
<!-- Email Template -->
<a href="morefitlyfe://programs">
  View Our Programs
</a>

<!-- Or use universal link for web fallback -->
<a href="https://morefitlyfe.com/programs">
  View Our Programs
</a>
```

### Creating Shareable Links
```typescript
const shareProgram = async () => {
  const deepLink = "morefitlyfe://programs/beginner-powerlifting";
  
  // Share via native share sheet
  if (navigator.share) {
    await navigator.share({
      title: 'Check out this program!',
      text: 'I found this great fitness program',
      url: deepLink
    });
  }
};
```

## Handling Deep Links in Code

The `useDeepLinking` hook automatically handles incoming deep links and navigates to the appropriate page. You can customize the behavior by editing `src/hooks/useDeepLinking.ts`.

### Custom Deep Link Handlers

Add custom logic for specific deep links:

```typescript
// In useDeepLinking.ts
const handleDeepLink = (event: URLOpenListenerEvent) => {
  const url = new URL(event.url);
  const path = url.pathname;
  const params = url.searchParams;

  // Custom handler for referral links
  if (path === '/referral') {
    const code = params.get('code');
    navigate(`/signup?referral=${code}`);
    return;
  }

  // Custom handler for program categories
  if (path.startsWith('/programs/category/')) {
    const category = path.split('/').pop();
    navigate(`/programs?category=${category}`);
    return;
  }

  // Default navigation
  navigate(path);
};
```

## Best Practices

1. **Always provide fallback URLs**: Use universal/app links that work on web if app isn't installed
2. **Test thoroughly**: Test deep links on both iOS and Android before release
3. **Handle authentication**: Check if user is logged in before navigating to protected routes
4. **Track analytics**: Log deep link usage to understand user behavior
5. **Validate parameters**: Always validate query parameters from deep links
6. **Show loading states**: Deep links may take time to process

## Troubleshooting

### Deep Links Not Opening App

**iOS:**
- Verify URL scheme is in `capacitor.config.ts`
- Run `npx cap sync` after changes
- Uninstall and reinstall app
- Check that iOS isn't blocking the URL scheme

**Android:**
- Verify intent filter in `AndroidManifest.xml` (added automatically by Capacitor)
- Run `npx cap sync` after changes
- Clear app data and reinstall
- Check logcat for intent errors: `adb logcat | grep -i intent`

### Universal/App Links Not Working

**iOS:**
- Verify `apple-app-site-association` file is accessible (no redirect, no authentication)
- Check file is served with `Content-Type: application/json`
- Verify Team ID and Bundle ID are correct
- Associated Domains must match exactly (no www if not in config)

**Android:**
- Verify `assetlinks.json` is accessible
- Check SHA256 fingerprint matches your signing key
- Use [Link Tester](https://developers.google.com/digital-asset-links/tools/generator) to validate

### Deep Link Opens Browser Instead of App

This happens when:
- Universal/App Links are not properly configured
- User is on a different device where app isn't installed
- iOS is in "Safari Mode" for the domain

**Solution:** Always provide both custom scheme and universal link options.

## Examples

### Complete Deep Link Setup Example

```typescript
// Send push notification with deep link
const sendNotification = async (userId: string, programId: string) => {
  await fetch('/api/send-notification', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      notification: {
        title: "New Program Available",
        body: "Check out our new program!",
        data: {
          deepLink: `morefitlyfe://programs/${programId}`
        }
      }
    })
  });
};

// Create shareable link
const createShareLink = (programId: string) => {
  const customScheme = `morefitlyfe://programs/${programId}`;
  const universalLink = `https://morefitlyfe.com/programs/${programId}`;
  
  // Return universal link for web compatibility
  return universalLink;
};
```

## Resources

- [Capacitor Deep Links Documentation](https://capacitorjs.com/docs/guides/deep-links)
- [iOS Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)
