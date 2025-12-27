import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { feedbackAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function FeedbackList() {
  const { user, canAccess } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    trangThai: '',
    loaiPhanHoi: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({
    chuaXuLy: 0,
    dangXuLy: 0,
    daXuLy: 0,
    total: 0
  });

  const isTruongOrAdmin = canAccess(['admin', 'to_truong']);

  useEffect(() => {
    fetchFeedbacks();
  }, [filters]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      
      let response;
      if (isTruongOrAdmin) {
        // ← TỔ TRƯỞNG/ADMIN: XEM TẤT CẢ
        response = await feedbackAPI.getAll({
          ...filters,
          page: filters.page,
          limit: filters.limit
        });
      } else {
        // ← USER: CHỈ XEM CỦA MÌNH
        response = await feedbackAPI.getMyFeedbacks();
      }

      if (response.data.success) {
        const data = response.data.data;
        setFeedbacks(data);
        
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }

        // ← TÍNH STATS
        const chuaXuLy = data.filter(f => f.trangThai === 'chua_xu_ly').length;
        const dangXuLy = data.filter(f => f.trangThai === 'dang_xu_ly').length;
        const daXuLy = data.filter(f => f.trangThai === 'da_xu_ly').length;
        
        setStats({
          chuaXuLy,
          dangXuLy,
          daXuLy,
          total: data.length
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      chua_xu_ly: { label: 'Chưa xử lý', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: '⏳' },
      dang_xu_ly: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '🔄' },
      da_xu_ly: { label: 'Đã xử lý', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: '✅' }
    };
    const badge = badges[status] || badges.chua_xu_ly;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <span>{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const badges = {
      gop_y: { label: 'Góp ý', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '💡' },
      khieu_nai: { label: 'Khiếu nại', color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '⚠️' },
      hoi_dap: { label: 'Hỏi đáp', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: '❓' }
    };
    const badge = badges[type] || badges.gop_y;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <span>{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  return (
    <>
      <PageMeta title="Danh sách phản hồi" />
      <PageBreadcrumb
        pageTitle={isTruongOrAdmin ? "Quản lý Phản hồi" : "Phản hồi của tôi"}
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Phản hồi' }
        ]}
      />

      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="text-4xl">💬</span>
              {isTruongOrAdmin ? 'Quản lý Phản hồi' : 'Phản hồi của tôi'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {isTruongOrAdmin 
                ? 'Xem và xử lý phản hồi từ cư dân' 
                : 'Gửi phản hồi và theo dõi trạng thái xử lý'}
            </p>
          </div>
          
          <Link
            to="/dashboard/feedbacks/create"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">Gửi phản hồi mới</span>
          </Link>
        </div>

        {/* STATS CARDS - CHỈ HIỆN CHO TỔ TRƯỞNG/ADMIN */}
        {isTruongOrAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl shadow-lg p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 dark:text-purple-400 mb-1 font-medium">Tổng số</p>
                  <p className="text-4xl font-bold text-purple-600 dark:text-purple-300">{stats.total}</p>
                </div>
                <div className="text-5xl">📊</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-2xl shadow-lg p-6 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-1 font-medium">Chưa xử lý</p>
                  <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-300">{stats.chuaXuLy}</p>
                </div>
                <div className="text-5xl">⏳</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl shadow-lg p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-1 font-medium">Đang xử lý</p>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-300">{stats.dangXuLy}</p>
                </div>
                <div className="text-5xl">🔄</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl shadow-lg p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-400 mb-1 font-medium">Đã xử lý</p>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-300">{stats.daXuLy}</p>
                </div>
                <div className="text-5xl">✅</div>
              </div>
            </div>
          </div>
        )}

        {/* FILTERS */}
        {isTruongOrAdmin && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trạng thái
                </label>
                <select
                  value={filters.trangThai}
                  onChange={(e) => setFilters({ ...filters, trangThai: e.target.value, page: 1 })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">🔍 Tất cả trạng thái</option>
                  <option value="chua_xu_ly">⏳ Chưa xử lý</option>
                  <option value="dang_xu_ly">🔄 Đang xử lý</option>
                  <option value="da_xu_ly">✅ Đã xử lý</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loại phản hồi
                </label>
                <select
                  value={filters.loaiPhanHoi}
                  onChange={(e) => setFilters({ ...filters, loaiPhanHoi: e.target.value, page: 1 })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">📋 Tất cả loại</option>
                  <option value="gop_y">💡 Góp ý</option>
                  <option value="khieu_nai">⚠️ Khiếu nại</option>
                  <option value="hoi_dap">❓ Hỏi đáp</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ trangThai: '', loaiPhanHoi: '', page: 1, limit: 20 })}
                  className="w-full px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  🔄 Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TABLE/LIST */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          {loading ? (
            <div className="flex items-center justify-center p-16">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center p-16">
              <div className="text-8xl mb-4">📭</div>
              <p className="text-gray-500 dark:text-gray-400 text-xl font-medium mb-2">
                Chưa có phản hồi nào
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                {isTruongOrAdmin ? 'Chưa có cư dân nào gửi phản hồi' : 'Bạn chưa gửi phản hồi nào'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <tr>
                    {isTruongOrAdmin && (
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Người gửi
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Ngày gửi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {feedbacks.map((feedback, index) => (
                    <tr 
                      key={feedback._id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {isTruongOrAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {(feedback.nguoiGui?.hoTen || feedback.nguoiGui?.userName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {feedback.nguoiGui?.hoTen || feedback.nguoiGui?.userName || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {feedback.email || 'Không có email'}
                              </p>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">
                          {feedback.tieuDe}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(feedback.loaiPhanHoi)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(feedback.trangThai)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {new Date(feedback.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/dashboard/feedbacks/${feedback._id}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                        >
                          Xem chi tiết
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
              disabled={filters.page === 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              ← Trước
            </button>
            
            <span className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg">
              {filters.page} / {pagination.pages}
            </span>
            
            <button
              onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page + 1) })}
              disabled={filters.page === pagination.pages}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </>
  );
}