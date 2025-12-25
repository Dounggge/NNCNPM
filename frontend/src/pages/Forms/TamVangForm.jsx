import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { donTamVangAPI, nhanKhauAPI } from '../../services/api';

export default function TamVangForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [nhanKhaus, setNhanKhaus] = useState([]);
  const [formData, setFormData] = useState({
    nhanKhauId: '',
    noiDen: '',
    tuNgay: '',
    denNgay: '',
    lyDo: '',
    ghiChu: ''
  });

  useEffect(() => {
    fetchNhanKhaus();
  }, []);

  const fetchNhanKhaus = async () => {
    try {
      const response = await nhanKhauAPI.getAll({ limit: 1000 });
      setNhanKhaus(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching nhan khau:', error);
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

    if (!formData.nhanKhauId || !formData.noiDen || !formData.tuNgay || !formData.denNgay || !formData.lyDo) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (new Date(formData.denNgay) <= new Date(formData.tuNgay)) {
      alert('⚠️ Ngày về phải sau ngày đi');
      return;
    }

    try {
      setLoading(true);
      await donTamVangAPI.create(formData); // ← SỬA API
      alert('✅ Đã gửi đơn tạm vắng thành công! Vui lòng chờ tổ trưởng duyệt.');
      navigate('/dashboard/tamvang');
    } catch (error) {
      console.error('Submit error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Tạo đơn Tạm vắng mới" />
      <PageBreadcrumb pageTitle="Tạo đơn Tạm vắng" />

      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            ➕ Tạo đơn tạm vắng mới
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Người tạm vắng *
                </label>
                <select
                  name="nhanKhauId"
                  required
                  value={formData.nhanKhauId}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">-- Chọn nhân khẩu --</option>
                  {nhanKhaus.map(nk => (
                    <option key={nk._id} value={nk._id}>
                      {nk.hoTen} - {nk.canCuocCongDan}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nơi đến *
                </label>
                <input
                  type="text"
                  name="noiDen"
                  required
                  value={formData.noiDen}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Địa chỉ nơi đến"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Từ ngày *
                </label>
                <input
                  type="date"
                  name="tuNgay"
                  required
                  value={formData.tuNgay}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Đến ngày *
                </label>
                <input
                  type="date"
                  name="denNgay"
                  required
                  value={formData.denNgay}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lý do tạm vắng *
                </label>
                <input
                  type="text"
                  name="lyDo"
                  required
                  value={formData.lyDo}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="VD: Công tác, Du lịch, Thăm thân..."
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
                onClick={() => navigate('/dashboard/tamvang')}
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : '✅ Tạo đơn'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}