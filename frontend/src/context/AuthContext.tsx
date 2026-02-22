import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthState, LoginRequest, RegisterRequest } from '@/types';
import { authApi } from '@/services/api';

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
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
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authApi
        .getMe()
        .then((user) => {
          setState({ user, token, isLoading: false, isAuthenticated: true });
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
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

  const logout = () => {
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