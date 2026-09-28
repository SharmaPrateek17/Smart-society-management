import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState([]);

  useEffect(() => {
    fetchDemoAccounts();
    if (token) {
      fetchCurrentUser();
    } else {
      // Default to auto-login as Resident 1 for instant out-of-the-box demo experience if not logged in
      autoLoginDefaultDemo();
    }
  }, []);

  const fetchDemoAccounts = async () => {
    try {
      const data = await api.get('/auth/demo-accounts');
      if (data.success) {
        setDemoAccounts(data.accounts);
      }
    } catch (err) {
      console.error('Failed to load demo accounts', err);
    }
  };

  const autoLoginDefaultDemo = async () => {
    try {
      const data = await api.get('/auth/demo-accounts');
      if (data.success && data.accounts.length > 0) {
        setDemoAccounts(data.accounts);
        // Default to Society Admin (R. Anand) for instant Society Command dashboard view
        const defaultUser = data.accounts.find(a => a.role === 'ADMIN') || data.accounts[0];
        if (defaultUser) {
          await demoLogin(defaultUser.id);
        }
      }
    } catch (err) {
      console.error('Auto demo login error', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const data = await api.get('/auth/me');
      if (data.success) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Fetch current user error', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.success) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || 'Login failed');
  };

  const demoLogin = async (userId) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/demo-login', { userId });
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.error('Demo login failed', err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    const data = await api.post('/auth/register', formData);
    if (data.success) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        demoAccounts,
        login,
        demoLogin,
        register,
        logout,
        refreshUser: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
