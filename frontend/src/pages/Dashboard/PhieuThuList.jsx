import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { phieuThuAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function PhieuThuList() {
  const [phieuThus, setPhieuThus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ 
    page: 1, 
    limit: 10, 
    total: 0,
    totalPages: 1
  });
  const [filter, setFilter] = useState({ 
    trangThai: '', 
    thang: '', 
    nam: new Date().getFullYear() 
  });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState(null);
  const { hasPermission } = useAuth();
  
  const searchTimeoutRef = useRef(null);

  // Fetch data khi page hoặc filter thay đổi
  useEffect(() => {
    fetchPhieuThus();
  }, [pagination.page, filter]);

  // Xử lý debounce cho tìm kiếm
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filter, search]);

  const fetchPhieuThus = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filter.trangThai && { trangThai: filter.trangThai }),
        ...(filter.thang && { thang: filter.thang }),
        ...(filter.nam && { nam: filter.nam }),
        ...(search && { search: search })
      };

      const response = await phieuThuAPI.getAll(params);
      
      // Kiểm tra cấu trúc response
      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi không xác định');
      }
      
      setPhieuThus(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 1
      }));
      
    } catch (error) {
      console.error('Error fetching phieu thu:', error);
      setError(`❌ Lỗi tải danh sách phiếu thu: ${error.message || 'Vui lòng thử lại sau'}`);
      
      // Fallback: hiển thị mảng rỗng
      setPhieuThus([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPhieuThus();
  };

  const handleClearFilters = () => {
    setFilter({ 
      trangThai: '', 
      thang: '', 
      nam: new Date().getFullYear() 
    });
    setSearch('');
    setSearchInput('');
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'chua_thanh_toan': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500',
      'da_thanh_toan': 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500',
      'qua_han': 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500',
      'Chưa đóng': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500',
      'Đã đóng': 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500'
    };

    const labels = {
      'chua_thanh_toan': '⏳ Chưa thanh toán',
      'da_thanh_toan': '✅ Đã thanh toán',
      'qua_han': '❌ Quá hạn',
      'Chưa đóng': '⏳ Chưa thanh toán',
      'Đã đóng': '✅ Đã thanh toán'
    };

    const badgeClass = badges[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-500';
    const label = labels[status] || status || 'N/A';

    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
        {label}
      </span>
    );
  };

  // Tính tổng thu với fallback
  const tongThu = phieuThus.reduce((sum, pt) => 
    sum + (pt.tongTien || pt.soTien || 0), 0);
  
  const daThu = phieuThus
    .filter(pt => pt.trangThai === 'da_thanh_toan' || pt.trangThai === 'Đã đóng')
    .reduce((sum, pt) => 
      sum + (pt.tongTien || pt.soTien || 0), 0);
  
  const conNo = tongThu - daThu;

  // Tạo danh sách năm từ 2022 đến 2026
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

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
            </div>
          </div>
        </div>

        {/* Main table */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Danh sách Phiếu thu
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Tổng: {pagination.total} phiếu | Trang {pagination.page}/{pagination.totalPages}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">

                {(filter.trangThai || filter.thang || filter.nam !== currentYear || search) && (
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                  Xóa bộ lọc
                  </button>
                )}

                {hasPermission('phieuthu:create') && (
                  <Link
                    to="/dashboard/phieuthu/create"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    ➕ Tạo phiếu thu
                  </Link>
                )}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <span>⚠️</span>
                  <span>{error}</span>
                  <button 
                    onClick={() => setError(null)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm theo số hộ khẩu, tên chủ hộ..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput('');
                      setSearch('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

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
                <option value="">Tất cả năm</option>
                {years.map(year => (
                  <option key={year} value={year}>Năm {year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading state */}
          {loading && !refreshing ? (
            <div className="flex h-64 flex-col items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">❌</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Có lỗi xảy ra
              </h3>
              <p className="mb-4 text-gray-500 dark:text-gray-400">
                Không thể tải danh sách phiếu thu
              </p>
              <button
                onClick={handleRefresh}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          ) : phieuThus.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl"></div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {search || filter.trangThai || filter.thang ? 'Không tìm thấy kết quả' : 'Chưa có phiếu thu nào'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {search || filter.trangThai || filter.thang 
                  ? 'Thử thay đổi điều kiện tìm kiếm hoặc tạo phiếu thu mới'
                  : 'Tạo phiếu thu đầu tiên để bắt đầu quản lý'}
              </p>
              {(search || filter.trangThai || filter.thang) && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
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
                          {pt.soPhieuThu || pt.maPhieuThu || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                          <div className="font-medium">
                            {pt.hoKhauId?.soHoKhau || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {pt.hoKhauId?.chuHo?.hoTen || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {pt.thang || 'N/A'}/{pt.nam || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {formatCurrency(pt.tongTien || pt.soTien || 0)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(pt.hanThanhToan)}
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(pt.trangThai)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/dashboard/phieuthu/${pt._id}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400"
                            >
                              Xem chi tiết
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hiển thị {phieuThus.length} / {pagination.total} phiếu
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ 
                      ...prev, 
                      page: Math.max(1, prev.page - 1) 
                    }))}
                    disabled={pagination.page === 1}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    ← Trước
                  </button>
                  
                  <div className="flex items-center">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      if (pageNum > pagination.totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                          className={`mx-1 rounded-lg px-3 py-1 text-sm ${
                            pagination.page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setPagination(prev => ({ 
                      ...prev, 
                      page: Math.min(pagination.totalPages, prev.page + 1) 
                    }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
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