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
      console.log('👤 User loaded:', response.data.data);
      setUser(response.data.data);
    } catch (error) {
      console.error('❌ Fetch user error:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token, user: userData } = response.data;
    
    localStorage.setItem('token', token);
    setUser(userData);
    
    // ← FORCE RELOAD ĐỂ ĐẢM BẢO DỮ LIỆU MỚI
    window.location.href = '/dashboard';
    
    return response.data;
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/signin';
  };

  const updateUser = (newUserData) => {
    console.log('🔄 Updating user:', newUserData);
    setUser(newUserData);
  };

  const isAdmin = user?.vaiTro === 'admin';

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.vaiTro === 'admin') return true;

    const permissions = {
      to_truong: [
        'nhankhau:read', 'nhankhau:create', 'nhankhau:update', 'nhankhau:delete',
        'hokhau:read', 'hokhau:create', 'hokhau:update', 'hokhau:delete',
        'tamtru:read', 'tamtru:create', 'tamtru:approve',
        'tamvang:read', 'tamvang:create', 'tamvang:approve',
        'phieuthu:read', 'phieuthu:create', 'phieuthu:approve',
        'dashboard:read'
      ],
      ke_toan: [
        'nhankhau:read',
        'hokhau:read',
        'khoanthu:read', 'khoanthu:create', 'khoanthu:update', 'khoanthu:delete',
        'phieuthu:read', 'phieuthu:create', 'phieuthu:update', 'phieuthu:approve',
        'dashboard:read'
      ],
      chu_ho: [
        'nhankhau:read',
        'hokhau:read', 'hokhau:update',
        'phieuthu:read'
      ],
      dan_cu: [
        'nhankhau:read',
        'hokhau:read',
        'phieuthu:read'
      ]
    };

    const userPermissions = permissions[user.vaiTro] || [];
    
    if (permission.includes(':*')) {
      const [resource] = permission.split(':');
      return userPermissions.some(p => p.startsWith(resource + ':'));
    }

    return userPermissions.includes(permission);
  };

  const canAccess = (roles) => {
    if (!user) return false;
    
    if (typeof roles === 'string') {
      return user.vaiTro === roles;
    }
    
    if (Array.isArray(roles)) {
      return roles.includes(user.vaiTro);
    }
    
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin,
      hasPermission,
      canAccess,
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