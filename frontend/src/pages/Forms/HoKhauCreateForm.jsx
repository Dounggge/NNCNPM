import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hoKhauAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function HoKhauCreateForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    soHoKhau: '',
    diaChiThuongTru: '',
    ngayLap: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // ← KIỂM TRA USER ĐÃ CÓ PROFILE CHƯA
    if (!user) {
      navigate('/signin');
      return;
    }

    if (!user.nhanKhauId) {
      alert('⚠️ Bạn chưa khai báo thông tin cá nhân. Vui lòng hoàn thành trước.');
      navigate('/dashboard/profile-setup');
      return;
    }

    // ← LƯU THÔNG TIN USER
    const nhanKhauData = user.nhanKhauId._id ? user.nhanKhauId : { _id: user.nhanKhauId };
    setUserProfile(nhanKhauData);

  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.soHoKhau || !formData.diaChiThuongTru) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);

      // ← ĐẢM BẢO GỬI ĐÚNG FORMAT
      const submitData = {
        soHoKhau: formData.soHoKhau.trim(),
        chuHoId: userProfile._id, // ← CHỦ HỘ LÀ CHÍNH USER
        diaChiThuongTru: formData.diaChiThuongTru.trim(),
        ngayLap: formData.ngayLap
      };

      console.log('📤 Submitting:', submitData);

      const response = await hoKhauAPI.create(submitData);
      
      console.log('✅ Response:', response.data);
      
      alert(response.data.message || '✅ Đăng ký hộ khẩu thành công! Vui lòng chờ duyệt.');
      navigate('/dashboard/hokhau');
    } catch (error) {
      console.error('❌ Error:', error);
      console.error('❌ Response data:', error.response?.data);
      
      alert('❌ ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Đăng ký hộ khẩu mới" />
      <PageBreadcrumb
        pageTitle="Đăng ký hộ khẩu mới"
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Hộ khẩu', path: '/dashboard/hokhau' },
          { label: 'Đăng ký mới' }
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-lg">
        {/* HEADER */}
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-3xl">🏠</span>
            Đăng ký hộ khẩu mới
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Điền thông tin để đăng ký hộ khẩu mới. Bạn sẽ là chủ hộ.
          </p>
        </div>

        {/* THÔNG TIN CHỦ HỘ */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2 flex items-center gap-2">
            <span className="text-xl">👤</span>
            Thông tin chủ hộ
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <p><strong>Họ tên:</strong> {userProfile.hoTen || user.hoTen}</p>
            <p><strong>CCCD:</strong> {userProfile.canCuocCongDan || 'Chưa có'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SỐ HỘ KHẨU */}
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
              placeholder="VD: NGAN0103"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Số hộ khẩu do ban quản lý cấp
            </p>
          </div>

          {/* ĐỊA CHỈ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Địa chỉ thường trú <span className="text-red-500">*</span>
            </label>
            <textarea
              name="diaChiThuongTru"
              required
              rows={3}
              value={formData.diaChiThuongTru}
              onChange={handleChange}
              placeholder="VD: Số 123, Đường ABC, Phường XYZ, Quận DEF, Thành phố GHI"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
            />
          </div>

          {/* NGÀY LẬP */}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
            />
          </div>

          {/* LƯU Ý */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="text-sm text-yellow-800 dark:text-yellow-400">
                <p className="font-semibold mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Bạn sẽ trở thành chủ hộ của hộ khẩu này</li>
                  <li>Hộ khẩu cần được tổ trưởng duyệt trước khi có hiệu lực</li>
                  <li>Vui lòng điền đầy đủ và chính xác thông tin</li>
                </ul>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate('/dashboard/hokhau')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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