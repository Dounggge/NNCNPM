import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user info khi mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      setUser(response.data.user);
      setPermissions(response.data.permissions);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
    await loadUser(); // Load permissions
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPermissions([]);
  };

  // Check quyền
  const hasPermission = (permission) => {
    if (permissions.includes('all')) return true;
    
    // Check wildcard: nhankhau:* matches nhankhau:read, nhankhau:create, etc
    const hasWildcard = permissions.some(p => {
      if (p.endsWith(':*')) {
        const prefix = p.replace(':*', '');
        return permission.startsWith(prefix);
      }
      return p === permission;
    });

    return hasWildcard || permissions.includes(permission);
  };

  const hasRole = (...roles) => {
    return user && roles.includes(user.vaiTro);
  };

  return (
    <AuthContext.Provider value={{
      user,
      permissions,
      loading,
      login,
      logout,
      loadUser,
      hasPermission,
      hasRole,
      isAdmin: user?.vaiTro === 'admin',
      isToTruong: user?.vaiTro === 'to_truong',
      isKeToan: user?.vaiTro === 'ke_toan',
      isChuHo: user?.vaiTro === 'chu_ho',
      isDanCu: user?.vaiTro === 'dan_cu'
    }}>
      {children}
    </AuthContext.Provider>
  );
};