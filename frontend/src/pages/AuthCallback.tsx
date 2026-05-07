import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

/**
 * Google OAuth redirects to /auth/callback?token=<jwt>
 * This page reads the token, stores it, fetches the user, and redirects to dashboard.
 */
export default function AuthCallback() {
  const { handleOAuthCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      toast.error('OAuth login failed — no token received');
      navigate('/login', { replace: true });
      return;
    }

    handleOAuthCallback(token)
      .then(() => {
        toast.success('Signed in with Google!');
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        toast.error('OAuth login failed. Please try again.');
        navigate('/login', { replace: true });
      });
  }, [handleOAuthCallback, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
      <Spinner size="large" />
      <p className="font-sans text-stone-400 text-sm">Completing sign in...</p>
    </div>
  );
}