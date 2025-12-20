import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { nhanKhauAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function NhanKhauList() {
  const [nhanKhaus, setNhanKhaus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ 
    page: 1, 
    limit: 10, 
    total: 0,
    totalPages: 0 
  });
  const [search, setSearch] = useState('');
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchNhanKhaus();
  }, [pagination.page, search]);

  const fetchNhanKhaus = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await nhanKhauAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search
      });

      console.log('📊 NhanKhau response:', response.data);

      // ← XỬ LÝ CẢ 2 TRƯỜNG HỢP CẤU TRÚC RESPONSE
      const data = response.data.data || response.data.nhanKhaus || [];
      const paginationData = response.data.pagination || {
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0,
        currentPage: response.data.currentPage || 1
      };

      setNhanKhaus(data);
      setPagination(prev => ({ 
        ...prev, 
        total: paginationData.total,
        totalPages: paginationData.totalPages
      }));
    } catch (error) {
      console.error('❌ Error fetching nhan khau:', error);
      setError(error.response?.data?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          <button
            type="button"
            onClick={fetchNhanKhaus}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Quản lý Nhân Khẩu | Hệ thống Quản lý Khu Dân Cư"
        description="Danh sách nhân khẩu trong khu dân cư"
      />
      <PageBreadcrumb pageTitle="Quản lý Nhân Khẩu" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header với tìm kiếm */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Danh sách Nhân Khẩu
          </h3>
          
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, CCCD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            
            {hasPermission('nhankhau:create') && (
              <Link
                to="/dashboard/nhankhau/create"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Thêm mới
              </Link>
            )}
          </div>
        </div>

        {/* Table */}
        {nhanKhaus.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">Không có dữ liệu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Họ và Tên
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    CCCD
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Ngày sinh
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Giới tính
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Hộ khẩu
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
                {nhanKhaus.map((nk) => (
                  <tr key={nk._id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {nk.hoTen}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {nk.canCuocCongDan}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {nk.ngaySinh ? new Date(nk.ngaySinh).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {nk.gioiTinh}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {nk.hoKhauId?.soHoKhau || 'Chưa có'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        nk.trangThai === 'active' 
                          ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-500'
                          : 'bg-gray-50 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400'
                      }`}>
                        {nk.trangThai === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/dashboard/nhankhau/${nk._id}`}
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
        )}

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Hiển thị {nhanKhaus.length} / {pagination.total} nhân khẩu
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-700"
            >
              Trước
            </button>
            <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Trang {pagination.page} / {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-700"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </>
  );
}