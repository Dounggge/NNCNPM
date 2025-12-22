import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hoKhauAPI, nhanKhauAPI } from '../../services/api';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function HoKhauAddMemberForm() {
  const { id } = useParams(); // hoKhauId
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hoKhau, setHoKhau] = useState(null);
  const [availableNhanKhaus, setAvailableNhanKhaus] = useState([]);
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

      // ← LẤY THÔNG TIN HỘ KHẨU
      const hoKhauRes = await hoKhauAPI.getById(id);
      setHoKhau(hoKhauRes.data.data || hoKhauRes.data);

      // ← LẤY DANH SÁCH NHÂN KHẨU CHƯA CÓ HỘ KHẨU
      const nhanKhauRes = await nhanKhauAPI.getAll({ limit: 1000 });
      const allNhanKhaus = nhanKhauRes.data.data || [];

      // ← LỌC NHÂN KHẨU CHƯA CÓ hoKhauId
      const available = allNhanKhaus.filter(nk => !nk.hoKhauId);
      setAvailableNhanKhaus(available);

      console.log('📊 Available NhanKhaus:', available.length);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('❌ Lỗi tải dữ liệu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nhanKhauId || !formData.quanHeVoiChuHo) {
      alert('⚠️ Vui lòng chọn đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      await hoKhauAPI.addMember(id, formData);
      alert('✅ Đã thêm thành viên vào hộ khẩu!');
      navigate(`/dashboard/hokhau/${id}`);
    } catch (error) {
      console.error('Submit error:', error);
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

  if (!hoKhau) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">Không tìm thấy hộ khẩu</p>
          <button
            onClick={() => navigate('/dashboard/hokhau')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Thêm thành viên vào hộ khẩu" />
      <PageBreadcrumb
        pageTitle="Thêm thành viên vào hộ khẩu"
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Hộ khẩu', path: '/dashboard/hokhau' },
          { label: hoKhau.soHoKhau, path: `/dashboard/hokhau/${id}` },
          { label: 'Thêm thành viên' }
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Thêm thành viên vào hộ khẩu
        </h2>

        {/* Thông tin hộ khẩu */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Hộ khẩu: {hoKhau.soHoKhau}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Chủ hộ: {hoKhau.chuHo?.hoTen || 'N/A'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Địa chỉ: {hoKhau.diaChiThuongTru}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Số thành viên hiện tại: {hoKhau.thanhVien?.length || 0}
          </p>
        </div>

        {/* Thông báo nếu không có nhân khẩu khả dụng */}
        {availableNhanKhaus.length === 0 ? (
          <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
            <p className="text-yellow-600 dark:text-yellow-400 mb-4">
              ⚠️ Không có nhân khẩu nào chưa thuộc hộ khẩu
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Tất cả nhân khẩu trong hệ thống đã được đăng ký vào hộ khẩu.
            </p>
            <button
              onClick={() => navigate(`/dashboard/hokhau/${id}`)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              ← Quay lại hộ khẩu
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Chọn nhân khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chọn nhân khẩu <span className="text-red-500">*</span>
              </label>
              <select
                name="nhanKhauId"
                required
                value={formData.nhanKhauId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="">-- Chọn nhân khẩu --</option>
                {availableNhanKhaus.map(nk => (
                  <option key={nk._id} value={nk._id}>
                    {nk.hoTen} - {nk.canCuocCongDan} ({nk.gioiTinh}, {new Date(nk.ngaySinh).getFullYear()})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Có {availableNhanKhaus.length} nhân khẩu chưa thuộc hộ khẩu nào
              </p>
            </div>

            {/* Quan hệ với chủ hộ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quan hệ với chủ hộ <span className="text-red-500">*</span>
              </label>
              <select
                name="quanHeVoiChuHo"
                required
                value={formData.quanHeVoiChuHo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="">-- Chọn quan hệ --</option>
                <option value="Vợ">Vợ</option>
                <option value="Chồng">Chồng</option>
                <option value="Con">Con</option>
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

            {/* Hiển thị thông tin nhân khẩu đã chọn */}
            {formData.nhanKhauId && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Thông tin nhân khẩu đã chọn:
                </h4>
                {(() => {
                  const selected = availableNhanKhaus.find(nk => nk._id === formData.nhanKhauId);
                  return selected ? (
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p><strong>Họ tên:</strong> {selected.hoTen}</p>
                      <p><strong>CCCD:</strong> {selected.canCuocCongDan}</p>
                      <p><strong>Ngày sinh:</strong> {new Date(selected.ngaySinh).toLocaleDateString('vi-VN')}</p>
                      <p><strong>Giới tính:</strong> {selected.gioiTinh}</p>
                      <p><strong>Dân tộc:</strong> {selected.danToc}</p>
                      <p><strong>Nghề nghiệp:</strong> {selected.ngheNghiep}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* Buttons */}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm thành viên
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}