export type NotificationSoundType = 'default' | 'destructive' | 'warning';

// Generate notification sounds using Web Audio API with different tones for severity levels
export const playNotificationSound = (type: NotificationSoundType = 'default') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'destructive':
        // Urgent, descending two-tone alarm (lower pitch, more alarming)
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.3);
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.45);
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
        break;

      case 'warning':
        // Attention-getting single higher tone
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(700, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(700, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.35);
        break;

      default:
        // Pleasant notification sound (original two-tone)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showBrowserNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/app-icon.png',
        badge: '/app-icon.png',
        ...options,
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }
};
