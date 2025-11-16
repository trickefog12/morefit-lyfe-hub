import { useState } from 'react';
import { Camera, Smartphone, Fingerprint } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCamera } from '@/hooks/useCamera';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useBiometric } from '@/hooks/useBiometric';

const MobileFeatures = () => {
  const { photo, isLoading: cameraLoading, takePicture, pickFromGallery } = useCamera();
  const { token, isRegistered } = usePushNotifications();
  const { isAvailable: biometricAvailable, biometryType, checkAvailability, authenticate } = useBiometric();

  const handleBiometricAuth = async () => {
    await checkAvailability();
    if (biometricAvailable) {
      await authenticate('Verify your identity to continue');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">Mobile Features</h1>
          <p className="text-muted-foreground text-center mb-12">
            Test native mobile capabilities on your device
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Camera Feature */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Camera className="w-6 h-6 text-primary" />
                  <CardTitle>Camera Access</CardTitle>
                </div>
                <CardDescription>
                  Take photos or select from your gallery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={takePicture} 
                    disabled={cameraLoading}
                    className="flex-1"
                  >
                    Take Photo
                  </Button>
                  <Button 
                    onClick={pickFromGallery} 
                    disabled={cameraLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    From Gallery
                  </Button>
                </div>
                {photo && (
                  <div className="mt-4">
                    <img 
                      src={photo} 
                      alt="Captured" 
                      className="w-full rounded-lg border"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-6 h-6 text-primary" />
                  <CardTitle>Push Notifications</CardTitle>
                </div>
                <CardDescription>
                  Receive notifications on your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <span className={`text-sm ${isRegistered ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {isRegistered ? 'Enabled' : 'Not Registered'}
                    </span>
                  </div>
                  {token && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-xs font-mono break-all">{token}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-4">
                    Push notifications are automatically registered when the app launches. 
                    You'll receive a notification when important events occur.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Biometric Authentication */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-6 h-6 text-primary" />
                  <CardTitle>Biometric Authentication</CardTitle>
                </div>
                <CardDescription>
                  Use Face ID, Touch ID, or fingerprint to authenticate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Availability:</span>
                  <span className={`text-sm ${biometricAvailable ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {biometricAvailable ? `Available (${biometryType})` : 'Not Available'}
                  </span>
                </div>
                <Button 
                  onClick={handleBiometricAuth}
                  className="w-full"
                  disabled={!biometricAvailable}
                >
                  Authenticate with Biometrics
                </Button>
                <p className="text-xs text-muted-foreground">
                  This feature requires biometric authentication to be set up on your device.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Note for Testing:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
              <li>These features require the app to be running on a physical device or emulator</li>
              <li>Camera and biometric features won't work in the web preview</li>
              <li>Push notifications require proper backend setup for production use</li>
              <li>Make sure to run <code className="bg-background px-1 py-0.5 rounded">npx cap sync</code> after pulling from GitHub</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MobileFeatures;
