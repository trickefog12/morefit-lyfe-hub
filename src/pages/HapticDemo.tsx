import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { HapticWrapper } from '@/components/ui/haptic-wrapper';
import { useHaptics } from '@/hooks/useHaptics';
import { Smartphone, Vibrate, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useState } from 'react';

const HapticDemo = () => {
  const haptics = useHaptics();
  const [checked, setChecked] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Smartphone className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Haptic Feedback Demo</h1>
            <p className="text-muted-foreground">
              {haptics.isAvailable 
                ? "Tap the buttons below to feel different haptic patterns"
                : "Haptic feedback is only available on native mobile devices"
              }
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Impact Styles */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Vibrate className="w-5 h-5 text-primary" />
                  <CardTitle>Impact Styles</CardTitle>
                </div>
                <CardDescription>
                  Different intensity levels for various interactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={haptics.light} 
                  className="w-full"
                  variant="outline"
                  haptic={false}
                >
                  Light Impact
                </Button>
                <Button 
                  onClick={haptics.medium} 
                  className="w-full"
                  haptic={false}
                >
                  Medium Impact (Default)
                </Button>
                <Button 
                  onClick={haptics.heavy} 
                  className="w-full"
                  variant="default"
                  haptic={false}
                >
                  Heavy Impact
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Light: switches, checkboxes<br/>
                  Medium: standard buttons<br/>
                  Heavy: important actions
                </p>
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <CardTitle>Notification Types</CardTitle>
                </div>
                <CardDescription>
                  Distinct patterns for different outcomes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={haptics.success} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  haptic={false}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Success
                </Button>
                <Button 
                  onClick={haptics.warning} 
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  haptic={false}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Warning
                </Button>
                <Button 
                  onClick={haptics.error} 
                  className="w-full"
                  variant="destructive"
                  haptic={false}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Error
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Provides feedback for action outcomes
                </p>
              </CardContent>
            </Card>

            {/* Selection Changed */}
            <Card>
              <CardHeader>
                <CardTitle>Selection Changed</CardTitle>
                <CardDescription>
                  Subtle feedback for scrolling through options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={haptics.selectionChanged} 
                  className="w-full"
                  variant="outline"
                  haptic={false}
                >
                  Selection Changed
                </Button>
                <p className="text-xs text-muted-foreground">
                  Used for pickers, sliders, and value changes
                </p>
              </CardContent>
            </Card>

            {/* Custom Vibration */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Vibration</CardTitle>
                <CardDescription>
                  Android-specific custom duration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => haptics.vibrate(50)} 
                  className="w-full"
                  variant="outline"
                  haptic={false}
                >
                  Short (50ms)
                </Button>
                <Button 
                  onClick={() => haptics.vibrate(200)} 
                  className="w-full"
                  variant="outline"
                  haptic={false}
                >
                  Long (200ms)
                </Button>
                <p className="text-xs text-muted-foreground">
                  Android only - custom vibration duration
                </p>
              </CardContent>
            </Card>

            {/* Interactive Components */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Interactive Components</CardTitle>
                <CardDescription>
                  Components with built-in haptic feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="haptic-checkbox" 
                    checked={checked}
                    onCheckedChange={(c) => setChecked(c as boolean)}
                  />
                  <Label htmlFor="haptic-checkbox">
                    Checkbox with haptic feedback
                  </Label>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Buttons with automatic haptics:</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button haptic="light">Light</Button>
                    <Button haptic="medium">Medium</Button>
                    <Button haptic="heavy">Heavy</Button>
                    <Button haptic={false}>No Haptic</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Custom wrapped elements:</p>
                  <HapticWrapper type="light">
                    <div className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                      Tap this card (light haptic)
                    </div>
                  </HapticWrapper>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">How to Use Haptics in Your App:</h3>
            <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
              <li>All buttons automatically have medium haptic feedback</li>
              <li>Checkboxes and switches have light haptic feedback</li>
              <li>Customize button haptics with <code className="bg-background px-1 py-0.5 rounded">haptic</code> prop</li>
              <li>Use <code className="bg-background px-1 py-0.5 rounded">HapticWrapper</code> for custom elements</li>
              <li>Call haptic functions directly with <code className="bg-background px-1 py-0.5 rounded">useHaptics()</code> hook</li>
              <li>Haptics only work on native iOS/Android devices</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HapticDemo;
