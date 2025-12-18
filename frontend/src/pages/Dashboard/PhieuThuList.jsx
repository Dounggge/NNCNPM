import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { phieuThuAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function PhieuThuList() {
  const [phieuThus, setPhieuThus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filter, setFilter] = useState({ trangThai: '', thang: '', nam: new Date().getFullYear() });
  const [search, setSearch] = useState('');
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchPhieuThus();
  }, [pagination.page, filter, search]);

  const fetchPhieuThus = async () => {
    try {
      setLoading(true);
      const response = await phieuThuAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search,
        ...filter
      });
      setPhieuThus(response.data.data || []);
      setPagination(prev => ({ 
        ...prev, 
        total: response.data.pagination?.total || 0 
      }));
    } catch (error) {
      console.error('Error fetching phieu thu:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const badges = {
      'chua_thanh_toan': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500',
      'da_thanh_toan': 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500',
      'qua_han': 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500'
    };

    const labels = {
      'chua_thanh_toan': '⏳ Chưa thanh toán',
      'da_thanh_toan': '✅ Đã thanh toán',
      'qua_han': '❌ Quá hạn'
    };

    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Tính tổng thu
  const tongThu = phieuThus.reduce((sum, pt) => sum + (pt.tongTien || 0), 0);
  const daThu = phieuThus.filter(pt => pt.trangThai === 'da_thanh_toan').reduce((sum, pt) => sum + (pt.tongTien || 0), 0);
  const conNo = tongThu - daThu;

  return (
    <>
      <PageMeta
        title="Quản lý Phiếu thu | Hệ thống Quản lý Khu Dân Cư"
        description="Danh sách phiếu thu phí"
      />
      <PageBreadcrumb pageTitle="Quản lý Phiếu thu" />

      <div className="space-y-6">
        {/* Stats overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:border-gray-800 dark:from-blue-500/10 dark:to-blue-500/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Tổng thu</div>
                <div className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(tongThu)}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-2xl text-white">
                💰
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-green-50 to-green-100 p-6 dark:border-gray-800 dark:from-green-500/10 dark:to-green-500/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-600 dark:text-green-400">Đã thu</div>
                <div className="mt-2 text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(daThu)}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-2xl text-white">
                ✅
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-red-50 to-red-100 p-6 dark:border-gray-800 dark:from-red-500/10 dark:to-red-500/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-red-600 dark:text-red-400">Còn nợ</div>
                <div className="mt-2 text-2xl font-bold text-red-700 dark:text-red-300">
                  {formatCurrency(conNo)}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 text-2xl text-white">
                ⚠️
              </div>
            </div>
          </div>
        </div>

        {/* Main table */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  🧾 Danh sách Phiếu thu
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Tổng: {pagination.total} phiếu
                </p>
              </div>

              {hasPermission('phieuthu:create') && (
                <Link
                  to="/dashboard/phieuthu/create"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  ➕ Tạo phiếu thu
                </Link>
              )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              <input
                type="text"
                placeholder="Tìm theo hộ khẩu, số phiếu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />

              <select
                value={filter.trangThai}
                onChange={(e) => setFilter({...filter, trangThai: e.target.value})}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="chua_thanh_toan">Chưa thanh toán</option>
                <option value="da_thanh_toan">Đã thanh toán</option>
                <option value="qua_han">Quá hạn</option>
              </select>

              <select
                value={filter.thang}
                onChange={(e) => setFilter({...filter, thang: e.target.value})}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Tất cả tháng</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>Tháng {i+1}</option>
                ))}
              </select>

              <select
                value={filter.nam}
                onChange={(e) => setFilter({...filter, nam: e.target.value})}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>Năm {year}</option>
                ))}
              </select>

              <button className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                📥 Xuất Excel
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
            </div>
          ) : phieuThus.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">🧾</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Chưa có phiếu thu nào
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Tạo phiếu thu đầu tiên để bắt đầu quản lý
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        Số phiếu
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        Hộ khẩu
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        Kỳ thu
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        Tổng tiền
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        Hạn thanh toán
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {phieuThus.map((pt) => (
                      <tr key={pt._id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {pt.soPhieuThu || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                          {pt.hoKhauId?.soHoKhau || 'N/A'}
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {pt.hoKhauId?.chuHo?.hoTen}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {pt.thang}/{pt.nam}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {formatCurrency(pt.tongTien)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(pt.hanThanhToan)}
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(pt.trangThai)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link
                            to={`/dashboard/phieuthu/${pt._id}`}
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            Xem chi tiết →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hiển thị {phieuThus.length} / {pagination.total} phiếu
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-700"
                  >
                    ← Trước
                  </button>
                  <span className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    Trang {pagination.page}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page * pagination.limit >= pagination.total}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-700"
                  >
                    Sau →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}