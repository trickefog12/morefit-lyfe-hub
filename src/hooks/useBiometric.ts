import { useState } from 'react';
import { BiometricAuth, BiometryType } from '@aparajita/capacitor-biometric-auth';
import { toast } from '@/hooks/use-toast';

export const useBiometric = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryType | null>(null);

  const checkAvailability = async () => {
    try {
      const result = await BiometricAuth.checkBiometry();
      setIsAvailable(result.isAvailable);
      setBiometryType(result.biometryType);
      return result;
    } catch (error) {
      console.error('Biometric check error:', error);
      return { isAvailable: false, biometryType: BiometryType.none };
    }
  };

  const authenticate = async (reason: string = 'Authenticate to continue') => {
    try {
      const result = await checkAvailability();
      
      if (!result.isAvailable) {
        toast({
          title: "Biometric unavailable",
          description: "Biometric authentication is not available on this device",
          variant: "destructive",
        });
        return false;
      }

      await BiometricAuth.authenticate({
        reason,
        cancelTitle: 'Cancel',
        allowDeviceCredential: true,
        iosFallbackTitle: 'Use Passcode',
      });

      toast({
        title: "Authentication successful",
        description: "You've been authenticated successfully",
      });
      return true;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      toast({
        title: "Authentication failed",
        description: "Failed to authenticate with biometrics",
        variant: "destructive",
      });
      return false;
    }
  };


  return {
    isAvailable,
    biometryType,
    checkAvailability,
    authenticate,
  };
};
