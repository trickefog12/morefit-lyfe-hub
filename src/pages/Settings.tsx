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
import { Keyboard, Languages, Bell, Save, Volume2, Play } from "lucide-react";
import { playNotificationSound, NotificationSoundType } from "@/lib/notificationSound";

interface KeyboardShortcut {
  id: string;
  action: string;
  key: string;
  enabled: boolean;
}

export default function Settings() {
  const { language, toggleLanguage, t } = useLanguage();
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
    auditSounds: true,
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
      title: t("toast_settings_saved"),
      description: t("toast_settings_saved_desc"),
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {t("settings_title")}
          </h1>
          <p className="text-muted-foreground">
            {t("settings_description")}
          </p>
        </div>

        <div className="space-y-6">
          {/* Keyboard Shortcuts Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-primary" />
                <CardTitle>
                  {t("keyboard_shortcuts")}
                </CardTitle>
              </div>
              <CardDescription>
                {t("keyboard_shortcuts_desc")}
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
                {t("keyboard_shortcuts_help")}
              </div>
            </CardContent>
          </Card>

          {/* Language Preferences Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-primary" />
                <CardTitle>
                  {t("language_preferences")}
                </CardTitle>
              </div>
              <CardDescription>
                {t("language_preferences_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">
                    {t("default_language")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {defaultLanguage === 'el' ? t("greek") : t("english")}
                  </p>
                </div>
                <Button variant="outline" onClick={handleLanguageChange}>
                  {t("change")}
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
                  {t("notification_preferences")}
                </CardTitle>
              </div>
              <CardDescription>
                {t("notification_preferences_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">
                    {t("email_notifications")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("email_notifications_desc")}
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
                    {t("push_notifications")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("push_notifications_desc")}
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
                    {t("marketing_emails")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("marketing_emails_desc")}
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
                    {t("system_updates")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("system_updates_desc")}
                  </p>
                </div>
                <Switch
                  checked={notifications.updates}
                  onCheckedChange={() => handleNotificationToggle('updates')}
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      {t("audit_sounds")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("audit_sounds_desc")}
                    </p>
                  </div>
                  <Switch
                    checked={notifications.auditSounds}
                    onCheckedChange={() => handleNotificationToggle('auditSounds')}
                  />
                </div>
                {notifications.auditSounds && (
                  <div className="pl-6 space-y-2">
                    <Label className="text-sm text-muted-foreground">{t("preview_sounds")}</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playNotificationSound('default')}
                        className="gap-2"
                      >
                        <Play className="h-3 w-3" />
                        {t("sound_default")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playNotificationSound('warning')}
                        className="gap-2 border-yellow-500/50 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950"
                      >
                        <Play className="h-3 w-3" />
                        {t("sound_warning")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playNotificationSound('destructive')}
                        className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                      >
                        <Play className="h-3 w-3" />
                        {t("sound_destructive")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} size="lg" className="gap-2">
              <Save className="h-4 w-4" />
              {t("save_settings")}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
