import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const userData = await api.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        api.setStoredUser(userData);
      }
    } catch (error) {
      // Invalid token or not authenticated
      api.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (authData) => {
    const { access_token, user: userData } = authData;
    api.setAuthToken(access_token);
    api.setStoredUser(userData);
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const register = async (userData) => {
    const authData = await api.register(userData);
    return login(authData);
  };

  const requestMagicLink = async (email) => {
    return api.requestMagicLink(email);
  };

  const verifyMagicLink = async (token) => {
    const authData = await api.verifyMagicLink(token);
    return login(authData);
  };

  const logout = () => {
    api.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    requestMagicLink,
    verifyMagicLink,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;