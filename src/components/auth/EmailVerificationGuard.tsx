import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export function EmailVerificationGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && currentUser && !currentUser.emailVerified) {
      // Google sign-ins are usually auto-verified, but just in case, we only block password accounts
      const isPasswordUser = currentUser.providerData.some((p) => p.providerId === 'password');
      if (isPasswordUser && location.pathname !== '/verify-email' && location.pathname !== '/auth') {
        navigate('/verify-email', { replace: true });
      }
    }
  }, [currentUser, loading, navigate, location]);

  return <>{children}</>;
}
