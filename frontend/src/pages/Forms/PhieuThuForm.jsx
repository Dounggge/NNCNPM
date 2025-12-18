import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { phieuThuAPI, hoKhauAPI, khoanThuAPI } from '../../services/api';

export default function PhieuThuForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hoKhaus, setHoKhaus] = useState([]);
  const [khoanThus, setKhoanThus] = useState([]);
  const [formData, setFormData] = useState({
    hoKhauId: '',
    thang: new Date().getMonth() + 1,
    nam: new Date().getFullYear(),
    cacKhoanThu: [],
    hanThanhToan: '',
    ghiChu: ''
  });

  const isEditMode = !!id;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [hoKhauRes, khoanThuRes] = await Promise.all([
        hoKhauAPI.getAll({ limit: 1000 }),
        khoanThuAPI.getAll()
      ]);
      
      setHoKhaus(hoKhauRes.data.hoKhaus || hoKhauRes.data.data || []);
      setKhoanThus(khoanThuRes.data.data || khoanThuRes.data || []);
    } catch (error) {
      alert('❌ Lỗi tải dữ liệu: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleKhoanThuChange = (khoanThuId, checked) => {
    setFormData(prev => ({
      ...prev,
      cacKhoanThu: checked 
        ? [...prev.cacKhoanThu, khoanThuId]
        : prev.cacKhoanThu.filter(id => id !== khoanThuId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.cacKhoanThu.length === 0) {
      alert('⚠️ Vui lòng chọn ít nhất 1 khoản thu');
      return;
    }

    try {
      setLoading(true);
      await phieuThuAPI.create(formData);
      alert('✅ Tạo phiếu thu thành công!');
      navigate('/dashboard/phieuthu');
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const tongTien = khoanThus
    .filter(kt => formData.cacKhoanThu.includes(kt._id))
    .reduce((sum, kt) => sum + (kt.donGia || 0), 0);

  return (
    <>
      <PageMeta title="Tạo Phiếu thu mới" />
      <PageBreadcrumb pageTitle="Tạo Phiếu thu" />

      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            ➕ Tạo phiếu thu mới
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hộ khẩu *
                </label>
                <select
                  name="hoKhauId"
                  required
                  value={formData.hoKhauId}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">-- Chọn hộ khẩu --</option>
                  {hoKhaus.map(hk => (
                    <option key={hk._id} value={hk._id}>
                      {hk.soHoKhau} - {hk.chuHo?.hoTen}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hạn thanh toán *
                </label>
                <input
                  type="date"
                  name="hanThanhToan"
                  required
                  value={formData.hanThanhToan}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tháng *
                </label>
                <select
                  name="thang"
                  required
                  value={formData.thang}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>Tháng {i+1}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Năm *
                </label>
                <input
                  type="number"
                  name="nam"
                  required
                  value={formData.nam}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Chọn khoản thu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Các khoản thu *
              </label>
              <div className="mt-2 space-y-2 rounded-lg border border-gray-300 p-4 dark:border-gray-700">
                {khoanThus.map(kt => (
                  <label key={kt._id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.cacKhoanThu.includes(kt._id)}
                      onChange={(e) => handleKhoanThuChange(kt._id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {kt.tenKhoanThu}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(kt.donGia)} / {kt.donVi}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Tổng tiền */}
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-500/10">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tổng tiền:
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tongTien)}
                </span>
              </div>
            </div>

            <div>
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

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/dashboard/phieuthu')}
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : '✅ Tạo phiếu thu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}