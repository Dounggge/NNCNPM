import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // ← THÊM
import PageMeta from '../../components/common/PageMeta';
import { userAPI } from '../../services/api';

export default function AccountSettings() {
  const { user, logout } = useAuth(); // ← THÊM logout
  const navigate = useNavigate(); // ← THÊM
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // STATE ĐỔI MẬT KHẨU
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // VALIDATE
    if (!passwordForm.oldPassword) {
      setMessage({ type: 'error', text: '❌ Vui lòng nhập mật khẩu cũ!' });
      return;
    }

    if (!passwordForm.newPassword) {
      setMessage({ type: 'error', text: '❌ Vui lòng nhập mật khẩu mới!' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: '❌ Mật khẩu mới phải có ít nhất 6 ký tự!' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: '❌ Mật khẩu xác nhận không khớp!' });
      return;
    }

    if (passwordForm.oldPassword === passwordForm.newPassword) {
      setMessage({ type: 'error', text: '❌ Mật khẩu mới phải khác mật khẩu cũ!' });
      return;
    }

    try {
      setLoading(true);

      const response = await userAPI.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });

      setMessage({ type: 'success', text: '✅ ' + response.data.message });
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // ← TỰ ĐỘNG ĐĂNG XUẤT SAU 2S
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Change password error:', error);
      setMessage({ 
        type: 'error', 
        text: '❌ ' + (error.response?.data?.message || 'Đổi mật khẩu thất bại!') 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Thông tin tài khoản" />

      <div className="p-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">⚙️</span>
            <span>Thông tin tài khoản</span>
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Quản lý thông tin cá nhân và bảo mật tài khoản
          </p>
        </div>

        {/* TABS */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              📋 Thông tin tài khoản
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'password'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              🔒 Đổi mật khẩu
            </button>
          </nav>
        </div>

        {/* NỘI DUNG */}
        <div className="max-w-2xl">
          {/* TAB: THÔNG TIN TÀI KHOẢN */}
          {activeTab === 'info' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Thông tin tài khoản
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user?.hoTen?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{user?.hoTen || user?.userName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {user?.vaiTro?.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tên đăng nhập</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{user?.userName}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{user?.email || 'Chưa cập nhật'}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Vai trò</p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {user?.vaiTro?.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ĐỔI MẬT KHẨU */}
          {activeTab === 'password' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Đổi mật khẩu
              </h2>

              {/* THÔNG BÁO */}
              {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-6">
                {/* MẬT KHẨU CŨ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mật khẩu cũ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    placeholder="Nhập mật khẩu hiện tại"
                    disabled={loading}
                  />
                </div>

                {/* MẬT KHẨU MỚI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    disabled={loading}
                  />
                </div>

                {/* XÁC NHẬN MẬT KHẨU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    placeholder="Nhập lại mật khẩu mới"
                    disabled={loading}
                  />
                </div>

                {/* GỢI Ý BẢO MẬT */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    💡 Lưu ý bảo mật:
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 ml-4 list-disc">
                    <li>Mật khẩu phải có ít nhất 6 ký tự</li>
                    <li>Nên kết hợp chữ hoa, chữ thường và số</li>
                    <li>Không sử dụng mật khẩu dễ đoán</li>
                    <li>Không chia sẻ mật khẩu với người khác</li>
                  </ul>
                </div>

                {/* NÚT SUBMIT */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Đang xử lý...</span>
                      </span>
                    ) : (
                      '🔒 Đổi mật khẩu'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPasswordForm({
                        oldPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setMessage({ type: '', text: '' });
                    }}
                    disabled={loading}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}