import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTwoFactorAuth } from '@/hooks/useTwoFactorAuth';
import { TwoFactorVerification } from '@/components/TwoFactorVerification';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const { needsVerification, loading: mfaLoading, refresh: refreshMFA } = useTwoFactorAuth();
  const [show2FAModal, setShow2FAModal] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      setChecking(true);
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      setIsAdmin(error ? false : (data || false));
      setChecking(false);
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    // Show 2FA modal when admin is verified but needs MFA verification
    if (isAdmin && !checking && needsVerification && !mfaLoading) {
      setShow2FAModal(true);
    }
  }, [isAdmin, checking, needsVerification, mfaLoading]);

  const handle2FASuccess = () => {
    setShow2FAModal(false);
    refreshMFA();
  };

  const handle2FACancel = () => {
    setShow2FAModal(false);
    // Redirect to home if they cancel 2FA verification
    window.location.href = '/';
  };

  if (loading || checking || mfaLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Show 2FA verification modal if needed
  if (needsVerification) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Verifying security...</div>
        </div>
        <TwoFactorVerification
          open={show2FAModal}
          onSuccess={handle2FASuccess}
          onCancel={handle2FACancel}
        />
      </>
    );
  }

  return <>{children}</>;
};
