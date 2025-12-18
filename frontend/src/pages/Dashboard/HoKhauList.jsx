import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { hoKhauAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function HoKhauList() {
  const [hoKhaus, setHoKhaus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ khuVuc: '', trangThai: '' });
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchHoKhaus();
  }, [pagination.page, search, filter]);

  const fetchHoKhaus = async () => {
    try {
      setLoading(true);
      const response = await hoKhauAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search,
        ...filter
      });
      setHoKhaus(response.data.hoKhaus || response.data.data || []);
      setPagination(prev => ({ 
        ...prev, 
        total: response.data.pagination?.total || response.data.total || 0 
      }));
    } catch (error) {
      console.error('Error fetching ho khau:', error);
      alert('Lỗi tải danh sách hộ khẩu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa hộ khẩu này?')) return;
    
    try {
      await hoKhauAPI.delete(id);
      alert('Xóa thành công!');
      fetchHoKhaus();
    } catch (error) {
      alert('Lỗi khi xóa: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <>
      <PageMeta
        title="Quản lý Hộ Khẩu | Hệ thống Quản lý Khu Dân Cư"
        description="Danh sách hộ khẩu trong khu dân cư"
      />
      <PageBreadcrumb pageTitle="Quản lý Hộ Khẩu" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header với filters */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              🏘️ Danh sách Hộ Khẩu
            </h3>
            
            {hasPermission('hokhau:create') && (
              <Link
                to="/dashboard/hokhau/new"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Thêm hộ khẩu
              </Link>
            )}
          </div>

          {/* Filters row */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Tìm theo số HK, chủ hộ, địa chỉ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />

            {/* Khu vực */}
            <select
              value={filter.khuVuc}
              onChange={(e) => setFilter({...filter, khuVuc: e.target.value})}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Tất cả khu vực</option>
              <option value="Khu A">Khu A</option>
              <option value="Khu B">Khu B</option>
              <option value="Khu C">Khu C</option>
            </select>

            {/* Trạng thái */}
            <select
              value={filter.trangThai}
              onChange={(e) => setFilter({...filter, trangThai: e.target.value})}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="hoat_dong">Hoạt động</option>
              <option value="tam_vang">Tạm vắng</option>
              <option value="da_chuyen_di">Đã chuyển đi</option>
            </select>

            {/* Export */}
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
        ) : hoKhaus.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mb-4 text-6xl">🏠</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Chưa có hộ khẩu nào
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {hasPermission('hokhau:create') 
                ? 'Nhấn nút "Thêm hộ khẩu" để bắt đầu' 
                : 'Liên hệ admin để thêm hộ khẩu'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Số hộ khẩu
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Chủ hộ
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Địa chỉ thường trú
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Số thành viên
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Khu vực
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Ngày cấp
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {hoKhaus.map((hk) => (
                    <tr key={hk._id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {hk.soHoKhau}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {hk.chuHo?.hoTen || 'Chưa có chủ hộ'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {hk.diaChiThuongTru || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          👥 {hk.thanhVien?.length || 0} người
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {hk.khuVuc || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(hk.ngayCapSo)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/dashboard/hokhau/${hk._id}`}
                            className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20"
                          >
                            👁️ Xem
                          </Link>
                          
                          {hasPermission('hokhau:update') && (
                            <Link
                              to={`/dashboard/hokhau/edit/${hk._id}`}
                              className="rounded-lg bg-green-50 px-3 py-1.5 text-sm text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20"
                            >
                              ✏️ Sửa
                            </Link>
                          )}

                          {hasPermission('hokhau:delete') && (
                            <button
                              onClick={() => handleDelete(hk._id)}
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

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hiển thị {hoKhaus.length} / {pagination.total} hộ khẩu
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