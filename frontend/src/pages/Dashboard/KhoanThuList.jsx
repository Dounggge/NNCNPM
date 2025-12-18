import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { khoanThuAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function KhoanThuList() {
  const [khoanThus, setKhoanThus] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchKhoanThus();
  }, []);

  const fetchKhoanThus = async () => {
    try {
      setLoading(true);
      const response = await khoanThuAPI.getAll();
      setKhoanThus(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching khoan thu:', error);
      alert('Lỗi tải danh sách khoản thu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa khoản thu này? Các phiếu thu liên quan sẽ bị ảnh hưởng!')) return;
    
    try {
      await khoanThuAPI.delete(id);
      alert('✅ Xóa thành công!');
      fetchKhoanThus();
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không giới hạn';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getLoaiKhoanThuBadge = (loai) => {
    const badges = {
      'bat_buoc': 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500',
      'dong_gop': 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500',
      'dich_vu': 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500'
    };

    const labels = {
      'bat_buoc': '🔴 Bắt buộc',
      'dong_gop': '🔵 Đóng góp',
      'dich_vu': '🟢 Dịch vụ'
    };

    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badges[loai]}`}>
        {labels[loai]}
      </span>
    );
  };

  return (
    <>
      <PageMeta
        title="Quản lý Khoản thu | Hệ thống Quản lý Khu Dân Cư"
        description="Danh sách các khoản thu phí"
      />
      <PageBreadcrumb pageTitle="Quản lý Khoản thu" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              💰 Danh mục Khoản thu
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Quản lý các loại phí thu: Quản lý, Điện nước, Vệ sinh, Đóng góp...
            </p>
          </div>

          {hasPermission('khoanthu:create') && (
            <Link
              to="/dashboard/khoanthu/create"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              ➕ Tạo khoản thu mới
            </Link>
          )}
        </div>

        {/* Stats cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100 p-4 dark:from-red-500/10 dark:to-red-500/5">
            <div className="text-sm text-red-600 dark:text-red-400">Bắt buộc</div>
            <div className="mt-2 text-2xl font-bold text-red-700 dark:text-red-300">
              {khoanThus.filter(k => k.loaiKhoanThu === 'bat_buoc').length}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-500/10 dark:to-blue-500/5">
            <div className="text-sm text-blue-600 dark:text-blue-400">Đóng góp</div>
            <div className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">
              {khoanThus.filter(k => k.loaiKhoanThu === 'dong_gop').length}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-4 dark:from-green-500/10 dark:to-green-500/5">
            <div className="text-sm text-green-600 dark:text-green-400">Dịch vụ</div>
            <div className="mt-2 text-2xl font-bold text-green-700 dark:text-green-300">
              {khoanThus.filter(k => k.loaiKhoanThu === 'dich_vu').length}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:from-purple-500/10 dark:to-purple-500/5">
            <div className="text-sm text-purple-600 dark:text-purple-400">Tổng cộng</div>
            <div className="mt-2 text-2xl font-bold text-purple-700 dark:text-purple-300">
              {khoanThus.length}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
          </div>
        ) : khoanThus.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mb-4 text-6xl">💰</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Chưa có khoản thu nào
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Tạo khoản thu đầu tiên để bắt đầu quản lý thu phí
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Tên khoản thu
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Loại
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Đơn giá
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Đơn vị
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Thời hạn
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {khoanThus.map((kt) => (
                  <tr key={kt._id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {kt.tenKhoanThu}
                      </div>
                      {kt.moTa && (
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {kt.moTa}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {getLoaiKhoanThuBadge(kt.loaiKhoanThu)}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(kt.donGia)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {kt.donVi}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div>{formatDate(kt.batDau)}</div>
                      <div className="text-xs">→ {formatDate(kt.ketThuc)}</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/dashboard/khoanthu/${kt._id}`}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20"
                        >
                          👁️ Xem
                        </Link>

                        {hasPermission('khoanthu:delete') && (
                          <button
                            onClick={() => handleDelete(kt._id)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                          >
                            🗑️ Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}