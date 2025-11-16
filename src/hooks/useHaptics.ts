import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Hook for haptic feedback on mobile devices
 * Only works on native platforms (iOS/Android)
 */
export const useHaptics = () => {
  const isNative = Capacitor.isNativePlatform();

  /**
   * Light impact - for small interactions like switches, checkboxes
   */
  const light = async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  };

  /**
   * Medium impact - for standard button taps
   */
  const medium = async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  };

  /**
   * Heavy impact - for important actions, confirmations
   */
  const heavy = async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  };

  /**
   * Success notification - for successful actions
   */
  const success = async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  };

  /**
   * Warning notification - for warnings or important info
   */
  const warning = async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  };

  /**
   * Error notification - for errors or failures
   */
  const error = async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  };

  /**
   * Selection changed - for scrolling through values, picker items
   */
  const selectionChanged = async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  };

  /**
   * Vibrate with custom pattern (Android only)
   * @param duration Duration in milliseconds
   */
  const vibrate = async (duration: number = 100) => {
    if (!isNative) return;
    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  };

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selectionChanged,
    vibrate,
    isAvailable: isNative,
  };
};
