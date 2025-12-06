import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MFAFactor {
  id: string;
  friendly_name: string;
  factor_type: 'totp';
  status: 'verified' | 'unverified';
}

export interface EnrollmentData {
  id: string;
  type: 'totp';
  totp: {
    qr_code: string;
    secret: string;
    uri: string;
  };
}

export function useTwoFactorAuth() {
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [assuranceLevel, setAssuranceLevel] = useState<'aal1' | 'aal2' | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkMFAStatus = async () => {
    try {
      setLoading(true);
      
      // Get current assurance level
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (aalError) {
        console.error('Error getting AAL:', aalError);
        return;
      }

      setAssuranceLevel(aalData?.currentLevel || null);

      // List enrolled factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

      if (factorsError) {
        console.error('Error listing factors:', factorsError);
        return;
      }

      const verifiedFactors = factorsData?.totp?.filter(f => f.status === 'verified') || [];
      setFactors(verifiedFactors as MFAFactor[]);
      setIsEnrolled(verifiedFactors.length > 0);
    } catch (error) {
      console.error('MFA status check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const enroll = async (friendlyName: string = 'Authenticator App'): Promise<EnrollmentData | null> => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }

      return data as EnrollmentData;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start enrollment',
        variant: 'destructive',
      });
      return null;
    }
  };

  const verifyEnrollment = async (factorId: string, code: string): Promise<boolean> => {
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) {
        toast({
          title: 'Error',
          description: challengeError.message,
          variant: 'destructive',
        });
        return false;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        toast({
          title: 'Invalid code',
          description: 'Please check your authenticator app and try again.',
          variant: 'destructive',
        });
        return false;
      }

      await checkMFAStatus();
      
      toast({
        title: 'Success',
        description: 'Two-factor authentication has been enabled.',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Verification failed',
        variant: 'destructive',
      });
      return false;
    }
  };

  const verify = async (code: string): Promise<boolean> => {
    try {
      if (factors.length === 0) {
        toast({
          title: 'Error',
          description: 'No authenticator enrolled',
          variant: 'destructive',
        });
        return false;
      }

      const factor = factors[0];
      
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factor.id,
      });

      if (challengeError) {
        toast({
          title: 'Error',
          description: challengeError.message,
          variant: 'destructive',
        });
        return false;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        toast({
          title: 'Invalid code',
          description: 'Please check your authenticator app and try again.',
          variant: 'destructive',
        });
        return false;
      }

      await checkMFAStatus();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Verification failed',
        variant: 'destructive',
      });
      return false;
    }
  };

  const unenroll = async (factorId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      await checkMFAStatus();
      
      toast({
        title: 'Success',
        description: 'Two-factor authentication has been disabled.',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to disable 2FA',
        variant: 'destructive',
      });
      return false;
    }
  };

  const needsVerification = isEnrolled && assuranceLevel === 'aal1';

  return {
    factors,
    isEnrolled,
    assuranceLevel,
    loading,
    needsVerification,
    enroll,
    verifyEnrollment,
    verify,
    unenroll,
    refresh: checkMFAStatus,
  };
}
