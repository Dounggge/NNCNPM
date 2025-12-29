import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { khoanThuAPI } from '../../services/api';

export default function KhoanThuForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tenKhoanThu: '',
    loaiKhoanThu: 'bat_buoc',
    donGia: '',
    donVi: 'VND/thang',
    batDau: '',
    ketThuc: '',
    moTa: '',
  });

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchKhoanThu();
    }
  }, [id]);

  const fetchKhoanThu = async () => {
    try {
      const response = await khoanThuAPI.getById(id);
      const data = response.data;
      setFormData({
        tenKhoanThu: data.tenKhoanThu || '',
        loaiKhoanThu: data.loaiKhoanThu || 'bat_buoc',
        donGia: data.donGia || '',
        donVi: data.donVi || 'VND/thang',
        moTa: data.moTa || '',
        batDau: data.batDau ? data.batDau.split('T')[0] : '',
        ketThuc: data.ketThuc ? data.ketThuc.split('T')[0] : ''
      });
    } catch (error) {
      alert('❌ Lỗi tải dữ liệu: ' + error.message);
      navigate('/dashboard/khoanthu');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (isEditMode) {
        await khoanThuAPI.update(id, formData);
        alert('✅ Cập nhật khoản thu thành công!');
      } else {
        await khoanThuAPI.create(formData);
        alert('✅ Tạo khoản thu thành công!');
      }
      
      navigate('/dashboard/khoanthu');
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title={`${isEditMode ? 'Chỉnh sửa' : 'Tạo'} Khoản thu | Hệ thống Quản lý Khu Dân Cư`}
        description={`${isEditMode ? 'Chỉnh sửa' : 'Tạo mới'} khoản thu phí`}
      />
      <PageBreadcrumb pageTitle={`${isEditMode ? 'Chỉnh sửa' : 'Tạo'} Khoản thu`} />

      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? '✏️ Chỉnh sửa khoản thu' : '➕ Tạo khoản thu mới'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tên khoản thu *
                </label>
                <input
                  type="text"
                  name="tenKhoanThu"
                  required
                  value={formData.tenKhoanThu}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="VD: Phí quản lý chung cư"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Loại khoản thu *
                </label>
                <select
                  name="loaiKhoanThu"
                  required
                  value={formData.loaiKhoanThu}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="bat_buoc">🔴 Bắt buộc</option>
                  <option value="dong_gop">🔵 Đóng góp</option>
                  <option value="dich_vu">🟢 Dịch vụ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Đơn giá *
                </label>
                <input
                  type="number"
                  name="donGia"
                  required
                  value={formData.donGia}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Đơn vị tính
                </label>
                <select
                  name="donVi"
                  value={formData.donVi}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="VND/thang">VNĐ/tháng</option>
                  <option value="VND/V">VNĐ/m²</option>
                  <option value="VND/nguoi">VNĐ/người</option>
                  <option value="VND/lan">VNĐ/lần</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bắt đầu từ
                </label>
                <input
                  type="date"
                  name="batDau"
                  required
                  value={formData.batDau}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kết thúc
                </label>
                <input
                  type="date"
                  name="ketThuc"
                  value={formData.ketThuc}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mô tả
                </label>
                <textarea
                  name="moTa"
                  rows={3}
                  value={formData.moTa}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Mô tả chi tiết về khoản thu..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/dashboard/khoanthu')}
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : (isEditMode ? '✅ Cập nhật' : '✅ Tạo mới')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}