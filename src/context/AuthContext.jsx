import { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredCredentials,
  setStoredCredentials,
  clearStoredCredentials,
  createApiInstance,
  testConnection,
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [host, setHost] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const { host: storedHost, token: storedToken } = getStoredCredentials();

      if (!storedHost || !storedToken) {
        setLoading(false);
        return;
      }

      try {
        await testConnection(storedHost, storedToken);
        setHost(storedHost);
        setToken(storedToken);
      } catch {
        clearStoredCredentials();
        setHost('');
        setToken('');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (newHost, newToken) => {
    setStoredCredentials(newHost, newToken);
    setHost(newHost);
    setToken(newToken);
  };

  const logout = () => {
    clearStoredCredentials();
    setHost('');
    setToken('');
  };

  const isAuthenticated = !!(host && token);
  const api = isAuthenticated ? createApiInstance(host, token) : null;

  return (
    <AuthContext.Provider
      value={{
        host,
        token,
        api,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
