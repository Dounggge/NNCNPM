import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { feedbackAPI } from '../../services/api';

export default function FeedbackForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loaiPhanHoi: 'gop_y',
    tieuDe: '',
    noiDung: '',
    email: user?.email || '',
    soDienThoai: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ← THAY THẾ HÀM NÀY
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tieuDe || !formData.noiDung) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.noiDung.length < 20) {
      alert('⚠️ Nội dung phải có ít nhất 20 ký tự');
      return;
    }

    try {
      setLoading(true);

      // ← GỬI VÀO DATABASE (THAY VÌ MAILTO)
      await feedbackAPI.create(formData);

      alert('✅ Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ xem xét và phản hồi sớm nhất.');
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
      <PageMeta title="Gửi phản hồi" />
      <PageBreadcrumb
        pageTitle="Gửi phản hồi"
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Gửi phản hồi' }
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            💬 Gửi phản hồi cho Ban quản lý
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mọi ý kiến đóng góp của bạn sẽ giúp chúng tôi cải thiện dịch vụ tốt hơn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* THÔNG TIN NGƯỜI GỬI */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              👤 Thông tin người gửi
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.hoTen || user?.userName || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email liên hệ
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Số điện thoại (tùy chọn)
                </label>
                <input
                  type="tel"
                  name="soDienThoai"
                  value={formData.soDienThoai}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="0123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loại phản hồi <span className="text-red-500">*</span>
                </label>
                <select
                  name="loaiPhanHoi"
                  required
                  value={formData.loaiPhanHoi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="gop_y">💡 Góp ý</option>
                  <option value="khieu_nai">⚠️ Khiếu nại</option>
                  <option value="hoi_dap">❓ Hỏi đáp</option>
                </select>
              </div>
            </div>
          </div>

          {/* TIÊU ĐỀ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tieuDe"
              required
              value={formData.tieuDe}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Vui lòng nhập tiêu đề ngắn gọn..."
            />
          </div>

          {/* NỘI DUNG */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nội dung chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              name="noiDung"
              required
              rows={8}
              value={formData.noiDung}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Vui lòng mô tả chi tiết vấn đề bạn muốn phản ánh..."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Tối thiểu 20 ký tự
            </p>
          </div>

          {/* HƯỚNG DẪN */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-500 mb-1">
                  Lưu ý khi gửi phản hồi:
                </h4>
                <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1 list-disc list-inside">
                  <li>Mô tả rõ ràng, chi tiết vấn đề bạn gặp phải</li>
                  <li>Cung cấp email/số điện thoại để chúng tôi có thể liên hệ lại</li>
                  <li>Chúng tôi sẽ phản hồi trong vòng 3-5 ngày làm việc</li>
                  <li>Tránh sử dụng ngôn từ không phù hợp</li>
                </ul>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
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
                  Đang gửi...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Gửi phản hồi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}