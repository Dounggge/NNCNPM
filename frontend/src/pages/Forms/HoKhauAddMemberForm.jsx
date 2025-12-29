import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nhanKhauAPI, hoKhauAPI } from '../../services/api';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function HoKhauAddMemberForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hoKhau, setHoKhau] = useState(null);
  const [availableNhanKhau, setAvailableNhanKhau] = useState([]);
  const [formData, setFormData] = useState({
    nhanKhauId: '',
    quanHeVoiChuHo: ''
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // ← FETCH HỘ KHẨU
      const hkRes = await hoKhauAPI.getById(id);
      setHoKhau(hkRes.data.data || hkRes.data);

      // ← FETCH NHÂN KHẨU KHẢ DỤNG (SỬA API MỚI)
      const nkRes = await nhanKhauAPI.getAvailableForHoKhau(id);
      setAvailableNhanKhau(nkRes.data.data || []);

      console.log('✅ Available nhân khẩu:', nkRes.data.data?.length);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('❌ Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nhanKhauId || !formData.quanHeVoiChuHo) {
      alert('⚠️ Vui lòng chọn nhân khẩu và quan hệ với chủ hộ');
      return;
    }

    try {
      setLoading(true);
      await hoKhauAPI.addMember(id, formData);
      alert('✅ Đã thêm thành viên vào hộ khẩu!');
      navigate(`/dashboard/hokhau/${id}`);
    } catch (error) {
      console.error('Add member error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !hoKhau) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`Thêm thành viên vào hộ ${hoKhau?.soHoKhau}`} />
      <PageBreadcrumb
        pageTitle="Thêm thành viên vào hộ khẩu"
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Hộ khẩu', path: '/dashboard/hokhau' },
          { label: hoKhau?.soHoKhau || 'Chi tiết', path: `/dashboard/hokhau/${id}` },
          { label: 'Thêm thành viên' }
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ➕ Thêm thành viên vào hộ khẩu
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hộ khẩu: <span className="font-semibold">{hoKhau?.soHoKhau}</span>
            {' - '}
            Chủ hộ: <span className="font-semibold">{hoKhau?.chuHo?.hoTen}</span>
          </p>
        </div>

        {/* ← HIỂN THỊ WARNING NẾU KHÔNG CÓ NHÂN KHẨU */}
        {availableNhanKhau.length === 0 && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-500 mb-1">
                  Không có nhân khẩu khả dụng
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  Hiện tại không có nhân khẩu nào chưa thuộc hộ khẩu này. 
                  Vui lòng tạo nhân khẩu mới hoặc kiểm tra lại.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn nhân khẩu <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.nhanKhauId}
              onChange={(e) => setFormData({ ...formData, nhanKhauId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              disabled={availableNhanKhau.length === 0}
            >
              <option value="">-- Chọn nhân khẩu --</option>
              {availableNhanKhau.map(nk => (
                <option key={nk._id} value={nk._id}>
                  {nk.hoTen} - {nk.canCuocCongDan} 
                  {nk.hoKhauId && ` (Hiện thuộc hộ: ${nk.hoKhauId.soHoKhau})`}
                </option>
              ))}
            </select>
            {availableNhanKhau.length === 0 && (
              <p className="mt-1 text-xs text-red-500">
                ⚠️ Không có nhân khẩu nào khả dụng
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quan hệ với chủ hộ <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.quanHeVoiChuHo}
              onChange={(e) => setFormData({ ...formData, quanHeVoiChuHo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">-- Chọn quan hệ --</option>
              <option value="Vợ">Vợ</option>
              <option value="Chồng">Chồng</option>
              <option value="Con">Con</option>
              <option value="Con dâu">Con dâu</option>
              <option value="Con rể">Con rể</option>
              <option value="Cha">Cha</option>
              <option value="Mẹ">Mẹ</option>
              <option value="Anh">Anh</option>
              <option value="Chị">Chị</option>
              <option value="Em">Em</option>
              <option value="Ông">Ông</option>
              <option value="Bà">Bà</option>
              <option value="Cháu">Cháu</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/hokhau/${id}`)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || availableNhanKhau.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm thành viên
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}