import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { donTamTruAPI, nhanKhauAPI } from '../../services/api'; // ← SỬA: donTamTruAPIAPI → donTamTruAPI
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function TamTruForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [nhanKhauInfo, setNhanKhauInfo] = useState(null);
  const [formData, setFormData] = useState({
    nhanKhauId: '',
    diaChiTamTru: '',
    tuNgay: '',
    denNgay: '',
    lyDo: '',
    ghiChu: ''
  });

  useEffect(() => {
    fetchNhanKhauInfo();
  }, [user]);

  const fetchNhanKhauInfo = async () => {
    try {
      if (user?.nhanKhauId) {
        const nhanKhauId = user.nhanKhauId._id || user.nhanKhauId;
        const response = await nhanKhauAPI.getById(nhanKhauId);
        const data = response.data.data || response.data;
        setNhanKhauInfo(data);
        setFormData(prev => ({ ...prev, nhanKhauId: data._id }));
      }
    } catch (error) {
      console.error('Fetch nhân khẩu error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nhanKhauId || !formData.diaChiTamTru || !formData.tuNgay || !formData.denNgay || !formData.lyDo) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (new Date(formData.denNgay) <= new Date(formData.tuNgay)) {
      alert('⚠️ Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      setLoading(true);
      await donTamTruAPI.create(formData);
      alert('✅ Đã gửi đơn tạm trú thành công! Tổ trưởng sẽ xem xét và thêm vào danh sách.');
      navigate('/dashboard/don-tam-tru'); // ← SỬA: /tamtru → /don-tam-tru
    } catch (error) {
      console.error('Submit error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Đăng ký tạm trú" />
      <PageBreadcrumb
        pageTitle="Đăng ký tạm trú"
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Đơn Tạm trú', path: '/dashboard/don-tam-tru' },
          { label: 'Đăng ký mới' }
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg">
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg">
              🏘️
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Đăng ký tạm trú
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Khai báo thông tin tạm trú tại địa phương
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* THÔNG TIN NGƯỜI ĐĂNG KÝ */}
          {nhanKhauInfo && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2 flex items-center gap-2">
                <span className="text-xl">👤</span>
                Người đăng ký
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Họ tên:</span>{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{nhanKhauInfo.hoTen}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">CCCD:</span>{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{nhanKhauInfo.canCuocCongDan}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">SĐT:</span>{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{nhanKhauInfo.soDienThoai || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* ĐỊA CHỈ TẠM TRÚ */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <span className="text-lg">📍</span>
              Địa chỉ tạm trú <span className="text-red-500">*</span>
            </label>
            <textarea
              name="diaChiTamTru"
              value={formData.diaChiTamTru}
              onChange={handleChange}
              required
              rows={3}
              placeholder="VD: Số 123, Đường ABC, Phường XYZ, Quận/Huyện, Tỉnh/Thành phố"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-400 transition-all"
            />
          </div>

          {/* THỜI GIAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <span className="text-lg">📅</span>
                Từ ngày <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tuNgay"
                value={formData.tuNgay}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <span className="text-lg">📅</span>
                Đến ngày <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="denNgay"
                value={formData.denNgay}
                onChange={handleChange}
                required
                min={formData.tuNgay}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
              />
            </div>
          </div>

          {/* LÝ DO */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <span className="text-lg">📝</span>
              Lý do tạm trú <span className="text-red-500">*</span>
            </label>
            <textarea
              name="lyDo"
              value={formData.lyDo}
              onChange={handleChange}
              required
              rows={3}
              placeholder="VD: Đi học, đi làm, thăm thân nhân, công tác..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-400 transition-all"
            />
          </div>

          {/* GHI CHÚ */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <span className="text-lg">💬</span>
              Ghi chú (không bắt buộc)
            </label>
            <textarea
              name="ghiChu"
              value={formData.ghiChu}
              onChange={handleChange}
              rows={2}
              placeholder="Thông tin bổ sung (nếu có)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-400 transition-all"
            />
          </div>

          {/* LƯU Ý */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="text-sm text-yellow-800 dark:text-yellow-400">
                <p className="font-semibold mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Đơn sẽ được gửi đến tổ trưởng để xét duyệt</li>
                  <li>Sau khi duyệt, thông tin sẽ được thêm vào danh sách tạm trú chính thức</li>
                  <li>Thời gian tạm trú phải từ 1 ngày trở lên</li>
                </ul>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate('/dashboard/don-tam-tru')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !nhanKhauInfo}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang gửi...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Gửi đơn
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}