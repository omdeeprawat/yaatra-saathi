import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, LoginRequest, RegisterRequest } from '@/types';
import { authApi } from '@/services/api';

// import {User} from '@/types';
interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => void;
  handleOAuthCallback: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('access_token'),
    isLoading: true,
    isAuthenticated: false,
  });

  // On mount — if a token exists, verify it and fetch user
  // if access token is expired try to refresh before giving in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authApi
        .getMe()
        .then((user) => {
          setState({ user, token, isLoading: false, isAuthenticated: true });
        })
        .catch(async () => {
          // access token may be expired, try refresh
          try {
            const response = await authApi.refresh();
            localStorage.setItem('access_token', response.access_token);
            setState({ user: response.user, token: response.access_token, isLoading: false, isAuthenticated: true });
          } catch {
            //refresh also failed, user needs to login again
            localStorage.removeItem('access_token');
            setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
          }
        });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    localStorage.setItem('access_token', response.access_token);
    setState({
      user: response.user,
      token: response.access_token,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const register = async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    localStorage.setItem('access_token', response.access_token);
    setState({
      user: response.user,
      token: response.access_token,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const logout = async () => {
    try{ 
      await authApi.logout();
    } catch {
      // even if logout API call fails, we clear local auth state
    }
    localStorage.removeItem('access_token');
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  };

  const googleLogin = () => {
    authApi.googleLogin();
  };

  // Called by AuthCallback page after Google OAuth redirect
  const handleOAuthCallback = useCallback(async (token: string) => {
    localStorage.setItem('access_token', token);
    const user = await authApi.getMe();
    setState({ user, token, isLoading: false, isAuthenticated: true });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, googleLogin, handleOAuthCallback }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

export default AuthContext;