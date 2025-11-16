import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { toast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const initializePushNotifications = async () => {
      // Request permission
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        await PushNotifications.register();
      }
    };

    // Register for push notifications
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      setToken(token.value);
      setIsRegistered(true);
      toast({
        title: "Notifications enabled",
        description: "You'll receive push notifications",
      });
    });

    // Handle registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
      toast({
        title: "Notification error",
        description: "Failed to register for notifications",
        variant: "destructive",
      });
    });

    // Handle push notifications received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ', notification);
      toast({
        title: notification.title || "Notification",
        description: notification.body || "You have a new notification",
      });
    });

    // Handle notification actions
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed', notification.actionId, notification.inputValue);
    });

    initializePushNotifications();

    // Cleanup
    return () => {
      PushNotifications.removeAllListeners();
    };
  }, []);

  return {
    token,
    isRegistered,
  };
};
