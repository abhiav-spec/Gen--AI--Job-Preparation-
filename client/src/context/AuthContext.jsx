import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getProfile, 
  refreshAccessToken, 
  setAccessToken, 
  clearAccessToken, 
  logoutUser 
} from '../api/auth.api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize and Refresh Token
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      // Try to refresh session using refresh token cookie
      const res = await refreshAccessToken();
      const { accessToken, user } = res.data;
      
      if (accessToken) {
        setAccessToken(accessToken);
        setUser(user);
        console.log('✅ Session restored from refresh token');
      }
    } catch (error) {
      console.warn('⚠️ Session refresh failed - user needs to log in again', error.message);
      setUser(null);
      clearAccessToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Handle Logout
  const logout = async (all = false) => {
    try {
      await logoutUser();
      setUser(null);
      clearAccessToken();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Provide state and methods
  const value = {
    user,
    setUser,
    isLoading,
    setIsLoading,
    logout,
    refreshSession: initializeAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
