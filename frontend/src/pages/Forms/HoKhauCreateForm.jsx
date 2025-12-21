import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hoKhauAPI, authAPI } from '../../services/api';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function HoKhauCreateForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    soHoKhau: '',
    diaChiThuongTru: '',
    ngayLap: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await authAPI.getMe();
      const user = res.data.data || res.data;
      setUserInfo(user);
      
      if (!user.nhanKhauId) {
        alert('⚠️ Bạn cần khai báo thông tin cá nhân trước!');
        navigate('/dashboard/profile-setup');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userInfo?.nhanKhauId) {
      alert('⚠️ Bạn cần khai báo thông tin cá nhân trước!');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        chuHo: userInfo.nhanKhauId._id || userInfo.nhanKhauId,
        thanhVien: [{
          nhanKhauId: userInfo.nhanKhauId._id || userInfo.nhanKhauId,
          quanHeVoiChuHo: 'Chủ hộ'
        }]
      };

      await hoKhauAPI.create(dataToSend);
      alert('✅ Đăng ký hộ khẩu thành công!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Submit error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Đăng ký hộ khẩu mới" />
      <PageBreadcrumb pageTitle="Đăng ký hộ khẩu mới" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          🏠 Đăng ký hộ khẩu mới
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Số hộ khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Số hộ khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="soHoKhau"
              required
              value={formData.soHoKhau}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Ví dụ: HK001, ABC123..."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Số hộ khẩu do ban quản lý cấp
            </p>
          </div>

          {/* Địa chỉ thường trú */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Địa chỉ thường trú <span className="text-red-500">*</span>
            </label>
            <textarea
              name="diaChiThuongTru"
              required
              rows="3"
              value={formData.diaChiThuongTru}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
            />
          </div>

          {/* Ngày lập */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ngày lập <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="ngayLap"
              required
              value={formData.ngayLap}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          {/* Thông tin chủ hộ */}
          {userInfo?.nhanKhauId && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Thông tin chủ hộ:
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Họ tên:</strong> {userInfo.nhanKhauId.hoTen || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>CCCD:</strong> {userInfo.nhanKhauId.canCuocCongDan || 'N/A'}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Đăng ký hộ khẩu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}