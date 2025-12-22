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
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (newUserData) => {
    console.log('🔄 Updating user:', newUserData);
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

  // ← HÀM hasPermission
  const hasPermission = (permission) => {
    if (!user) return false;

    // Admin có tất cả quyền
    if (user.vaiTro === 'admin') return true;

    // Định nghĩa permissions theo vai trò
    const permissions = {
      to_truong: [
        'nhankhau:read', 'nhankhau:create', 'nhankhau:update', 'nhankhau:delete',
        'hokhau:read', 'hokhau:create', 'hokhau:update', 'hokhau:delete',
        'tamtru:read', 'tamtru:create', 'tamtru:approve',
        'tamvang:read', 'tamvang:create', 'tamvang:approve',
        'dashboard:read'
      ],
      ke_toan: [
        'nhankhau:read',
        'hokhau:read',
        'khoanthu:read', 'khoanthu:create', 'khoanthu:update', 'khoanthu:delete',
        'phieuthu:read', 'phieuthu:create', 'phieuthu:update',
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
    
    // Hỗ trợ wildcard (vd: 'nhankhau:*')
    if (permission.includes(':*')) {
      const [resource] = permission.split(':');
      return userPermissions.some(p => p.startsWith(resource + ':'));
    }

    return userPermissions.includes(permission);
  };

  // ← HÀM canAccess (KIỂM TRA THEO VAI TRÒ)
  const canAccess = (roles) => {
    if (!user) return false;
    
    // ← HỖ TRỢ CẢ STRING VÀ ARRAY
    if (typeof roles === 'string') {
      return user.vaiTro === roles;
    }
    
    if (Array.isArray(roles)) {
      return roles.includes(user.vaiTro);
    }
    
    return false;
  };

  console.log('🔍 AuthContext state:', { user, isAdmin });

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin,
      hasPermission,  // ← EXPORT hasPermission
      canAccess,      // ← EXPORT canAccess
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