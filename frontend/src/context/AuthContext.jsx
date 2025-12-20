import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await authAPI.getMe();
      console.log('👤 User loaded:', response.data.data); // ← DEBUG
      setUser(response.data.data);
    } catch (error) {
      console.error('❌ Fetch user error:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (newUserData) => {
    console.log('🔄 Updating user:', newUserData); // ← DEBUG
    setUser(newUserData);
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/signin';
  };

  // ← KIỂM TRA ADMIN
  const isAdmin = user?.vaiTro === 'admin';

  console.log('🔍 AuthContext state:', { user, isAdmin }); // ← DEBUG

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin,
      login, 
      logout, 
      updateUser,
      fetchUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};