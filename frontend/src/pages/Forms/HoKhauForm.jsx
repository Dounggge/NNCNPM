import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { hoKhauAPI, nhanKhauAPI } from '../../services/api';

export default function HoKhauForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [nhanKhaus, setNhanKhaus] = useState([]);
  const [formData, setFormData] = useState({
    soHoKhau: '',
    chuHo: '',
    diaChiThuongTru: '',
    ngayDangKy: '',
    ghiChu: ''
  });

  const isEditMode = !!id;

  useEffect(() => {
    fetchNhanKhaus();
    if (isEditMode) {
      fetchHoKhau();
    }
  }, [id]);

  const fetchNhanKhaus = async () => {
    try {
      const response = await nhanKhauAPI.getAll({ limit: 1000 });
      setNhanKhaus(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching nhan khau:', error);
    }
  };

  const fetchHoKhau = async () => {
    try {
      const response = await hoKhauAPI.getById(id);
      const data = response.data;
      setFormData({
        soHoKhau: data.soHoKhau || '',
        chuHo: data.chuHo?._id || '',
        diaChiThuongTru: data.diaChiThuongTru || '',
        ngayDangKy: data.ngayDangKy ? data.ngayDangKy.split('T')[0] : '',
        ghiChu: data.ghiChu || ''
      });
    } catch (error) {
      alert('❌ Lỗi tải dữ liệu: ' + error.message);
      navigate('/dashboard/hokhau');
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
        await hoKhauAPI.update(id, formData);
        alert('✅ Cập nhật hộ khẩu thành công!');
      } else {
        await hoKhauAPI.create(formData);
        alert('✅ Tạo hộ khẩu thành công!');
      }
      
      navigate('/dashboard/hokhau');
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title={`${isEditMode ? 'Chỉnh sửa' : 'Tạo'} Hộ khẩu | Hệ thống Quản lý Khu Dân Cư`}
        description={`${isEditMode ? 'Chỉnh sửa' : 'Tạo mới'} hộ khẩu`}
      />
      <PageBreadcrumb pageTitle={`${isEditMode ? 'Chỉnh sửa' : 'Tạo'} Hộ khẩu`} />

      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? '✏️ Chỉnh sửa hộ khẩu' : '➕ Tạo hộ khẩu mới'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Số hộ khẩu *
                </label>
                <input
                  type="text"
                  name="soHoKhau"
                  required
                  value={formData.soHoKhau}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="VD: HK001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chủ hộ *
                </label>
                <select
                  name="chuHo"
                  required
                  value={formData.chuHo}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">-- Chọn chủ hộ --</option>
                  {nhanKhaus.map(nk => (
                    <option key={nk._id} value={nk._id}>
                      {nk.hoTen} - {nk.canCuocCongDan}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Địa chỉ thường trú *
                </label>
                <input
                  type="text"
                  name="diaChiThuongTru"
                  required
                  value={formData.diaChiThuongTru}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ngày đăng ký
                </label>
                <input
                  type="date"
                  name="ngayDangKy"
                  value={formData.ngayDangKy}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ghi chú
                </label>
                <textarea
                  name="ghiChu"
                  rows={3}
                  value={formData.ghiChu}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Ghi chú thêm..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/dashboard/hokhau')}
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