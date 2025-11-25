import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Keyboard, Languages, Bell, Save } from "lucide-react";

interface KeyboardShortcut {
  id: string;
  action: string;
  key: string;
  enabled: boolean;
}

export default function Settings() {
  const { language, toggleLanguage } = useLanguage();
  const { toast } = useToast();
  
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([
    { id: 'home', action: language === 'el' ? 'Αρχική σελίδα' : 'Home', key: 'Ctrl+H', enabled: true },
    { id: 'programs', action: language === 'el' ? 'Προγράμματα' : 'Programs', key: 'Ctrl+P', enabled: true },
    { id: 'meals', action: language === 'el' ? 'Διατροφή' : 'Meal Plans', key: 'Ctrl+M', enabled: true },
    { id: 'language', action: language === 'el' ? 'Αλλαγή γλώσσας' : 'Toggle Language', key: 'Ctrl+L', enabled: true },
  ]);

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
    updates: true,
  });

  const [defaultLanguage, setDefaultLanguage] = useState(language);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedShortcuts = localStorage.getItem('keyboard-shortcuts');
    const savedNotifications = localStorage.getItem('notification-preferences');
    const savedLanguage = localStorage.getItem('morefitlyfe-language');

    if (savedShortcuts) {
      setShortcuts(JSON.parse(savedShortcuts));
    }
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    if (savedLanguage && (savedLanguage === 'el' || savedLanguage === 'en')) {
      setDefaultLanguage(savedLanguage as 'el' | 'en');
    }
  }, []);

  const handleShortcutToggle = (id: string) => {
    setShortcuts(prev => prev.map(shortcut => 
      shortcut.id === id 
        ? { ...shortcut, enabled: !shortcut.enabled }
        : shortcut
    ));
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLanguageChange = () => {
    const newLanguage = defaultLanguage === 'el' ? 'en' : 'el';
    setDefaultLanguage(newLanguage);
    if (newLanguage !== language) {
      toggleLanguage();
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('keyboard-shortcuts', JSON.stringify(shortcuts));
    localStorage.setItem('notification-preferences', JSON.stringify(notifications));
    localStorage.setItem('morefitlyfe-language', defaultLanguage);

    toast({
      title: language === 'el' ? 'Οι ρυθμίσεις αποθηκεύτηκαν' : 'Settings saved',
      description: language === 'el' 
        ? 'Οι προτιμήσεις σας ενημερώθηκαν επιτυχώς' 
        : 'Your preferences have been updated successfully',
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {language === 'el' ? 'Ρυθμίσεις' : 'Settings'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'el' 
              ? 'Διαχειριστείτε τις προτιμήσεις και τις ρυθμίσεις του λογαριασμού σας' 
              : 'Manage your account preferences and settings'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Keyboard Shortcuts Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-primary" />
                <CardTitle>
                  {language === 'el' ? 'Συντομεύσεις πληκτρολογίου' : 'Keyboard Shortcuts'}
                </CardTitle>
              </div>
              <CardDescription>
                {language === 'el' 
                  ? 'Ενεργοποιήστε ή απενεργοποιήστε συντομεύσεις πληκτρολογίου για γρήγορη πλοήγηση' 
                  : 'Enable or disable keyboard shortcuts for faster navigation'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.id} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">{shortcut.action}</Label>
                    <div className="text-sm text-muted-foreground">
                      <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                        {shortcut.key}
                      </kbd>
                    </div>
                  </div>
                  <Switch
                    checked={shortcut.enabled}
                    onCheckedChange={() => handleShortcutToggle(shortcut.id)}
                  />
                </div>
              ))}
              <div className="pt-4 text-sm text-muted-foreground">
                {language === 'el' 
                  ? 'Πατήστε ? για να δείτε όλες τις διαθέσιμες συντομεύσεις' 
                  : 'Press ? to view all available shortcuts'}
              </div>
            </CardContent>
          </Card>

          {/* Language Preferences Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-primary" />
                <CardTitle>
                  {language === 'el' ? 'Προτιμήσεις γλώσσας' : 'Language Preferences'}
                </CardTitle>
              </div>
              <CardDescription>
                {language === 'el' 
                  ? 'Επιλέξτε την προτιμώμενη γλώσσα για τη διεπαφή' 
                  : 'Choose your preferred language for the interface'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">
                    {language === 'el' ? 'Προεπιλεγμένη γλώσσα' : 'Default Language'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {defaultLanguage === 'el' ? 'Ελληνικά' : 'English'}
                  </p>
                </div>
                <Button variant="outline" onClick={handleLanguageChange}>
                  {language === 'el' ? 'Αλλαγή' : 'Change'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>
                  {language === 'el' ? 'Προτιμήσεις ειδοποιήσεων' : 'Notification Preferences'}
                </CardTitle>
              </div>
              <CardDescription>
                {language === 'el' 
                  ? 'Διαχειριστείτε πώς και πότε θέλετε να λαμβάνετε ειδοποιήσεις' 
                  : 'Manage how and when you want to receive notifications'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">
                    {language === 'el' ? 'Ειδοποιήσεις email' : 'Email Notifications'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'el' 
                      ? 'Λήψη ειδοποιήσεων μέσω email' 
                      : 'Receive notifications via email'}
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={() => handleNotificationToggle('email')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">
                    {language === 'el' ? 'Push ειδοποιήσεις' : 'Push Notifications'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'el' 
                      ? 'Λήψη push ειδοποιήσεων στη συσκευή σας' 
                      : 'Receive push notifications on your device'}
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={() => handleNotificationToggle('push')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">
                    {language === 'el' ? 'Marketing emails' : 'Marketing Emails'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'el' 
                      ? 'Λήψη προσφορών και ενημερώσεων προϊόντων' 
                      : 'Receive special offers and product updates'}
                  </p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={() => handleNotificationToggle('marketing')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">
                    {language === 'el' ? 'Ενημερώσεις συστήματος' : 'System Updates'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'el' 
                      ? 'Σημαντικές ειδοποιήσεις για το λογαριασμό σας' 
                      : 'Important notifications about your account'}
                  </p>
                </div>
                <Switch
                  checked={notifications.updates}
                  onCheckedChange={() => handleNotificationToggle('updates')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} size="lg" className="gap-2">
              <Save className="h-4 w-4" />
              {language === 'el' ? 'Αποθήκευση ρυθμίσεων' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
