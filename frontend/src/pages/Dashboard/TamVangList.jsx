import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { tamVangAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function TamVangList() {
  const [tamVangs, setTamVangs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ trangThai: '' });
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchTamVangs();
  }, [pagination.page, search, filter]);

  const fetchTamVangs = async () => {
    try {
      setLoading(true);
      const response = await tamVangAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search,
        ...filter
      });
      setTamVangs(response.data.data || []);
      setPagination(prev => ({ 
        ...prev, 
        total: response.data.pagination?.total || 0 
      }));
    } catch (error) {
      console.error('Error fetching tam vang:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const badges = {
      'dang_xu_ly': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500',
      'da_duyet': 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500',
      'tu_choi': 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500',
      'da_ve': 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500'
    };

    const labels = {
      'dang_xu_ly': 'Đang xử lý',
      'da_duyet': 'Đã duyệt',
      'tu_choi': 'Từ chối',
      'da_ve': 'Đã về'
    };

    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <>
      <PageMeta
        title="Danh sách Tạm vắng | Hệ thống Quản lý Khu Dân Cư"
        description="Quản lý đăng ký tạm vắng"
      />
      <PageBreadcrumb pageTitle="Danh sách Tạm vắng" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                📤 Danh sách Tạm vắng
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tổng: {pagination.total} đơn đăng ký
              </p>
            </div>
            
            {hasPermission('tamvang:create') && (
              <Link
                to="/dashboard/tamvang/create"
                className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
              >
                ➕ Tạo đơn mới
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              type="text"
              placeholder="Tìm theo tên, CCCD, nơi đến..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />

            <select
              value={filter.trangThai}
              onChange={(e) => setFilter({...filter, trangThai: e.target.value})}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="dang_xu_ly">Đang xử lý</option>
              <option value="da_duyet">Đã duyệt</option>
              <option value="tu_choi">Từ chối</option>
              <option value="da_ve">Đã về</option>
            </select>

            <button className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              📥 Xuất Excel
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-yellow-500"></div>
          </div>
        ) : tamVangs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mb-4 text-6xl">📤</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Chưa có đơn tạm vắng nào
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {hasPermission('tamvang:create') 
                ? 'Nhấn nút "Tạo đơn mới" để bắt đầu' 
                : 'Chưa có dữ liệu'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Họ tên
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      CCCD
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Nơi đến
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Từ ngày
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Đến ngày
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
                  {tamVangs.map((tv) => (
                    <tr key={tv._id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {tv.nhanKhauId?.hoTen || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {tv.nhanKhauId?.canCuocCongDan || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {tv.noiDen || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(tv.tuNgay)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(tv.denNgay)}
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(tv.trangThai)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          to={`/dashboard/tamvang/${tv._id}`}
                          className="text-sm text-yellow-600 hover:text-yellow-700 dark:text-yellow-400"
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
                Hiển thị {tamVangs.length} / {pagination.total} đơn
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
    </>
  );
}