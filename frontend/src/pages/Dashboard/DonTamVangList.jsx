import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { donTamVangAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function DonTamVangList() {
  const navigate = useNavigate();
  const { user, canAccess } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dons, setDons] = useState([]);
  const [filter, setFilter] = useState('cho_xu_ly');

  useEffect(() => {
    fetchDons();
  }, [filter]);

  const fetchDons = async () => {
    try {
      setLoading(true);
      const params = filter === 'all' ? {} : { trangThai: filter };
      const response = await donTamVangAPI.getAll(params);
      setDons(response.data.data || response.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('❌ Lỗi tải dữ liệu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('✅ Xác nhận DUYỆT đơn tạm vắng này?')) return;

    try {
      await donTamVangAPI.approve(id);
      alert('✅ Đã duyệt đơn thành công!');
      fetchDons();
    } catch (error) {
      console.error('Approve error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async (id) => {
    const lyDoTuChoi = prompt('❌ Nhập lý do từ chối:');
    if (!lyDoTuChoi) return;

    try {
      await donTamVangAPI.reject(id, { lyDoTuChoi });
      alert('❌ Đã từ chối đơn');
      fetchDons();
    } catch (error) {
      console.error('Reject error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Xác nhận XÓA đơn này?')) return;

    try {
      await donTamVangAPI.delete(id);
      alert('✅ Đã xóa đơn');
      fetchDons();
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusBadge = (trangThai, lyDoTuChoi) => {
    if (trangThai === 'cho_xu_ly') {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">⏳ Chờ xử lý</span>;
    }
    if (trangThai === 'da_xu_ly') {
      if (lyDoTuChoi) {
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">❌ Từ chối</span>;
      }
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">✅ Đã duyệt</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">❓ Không rõ</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Danh sách đơn Tạm vắng" />
      <PageBreadcrumb
        pageTitle="Danh sách đơn Tạm vắng"
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Đơn Tạm vắng' }
        ]}
      />

      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📤 Đơn Tạm vắng
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {canAccess(['admin', 'to_truong']) 
                ? 'Quản lý và duyệt đơn tạm vắng' 
                : 'Danh sách đơn tạm vắng của bạn'}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/dashboard/tamvang/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo đơn mới
            </Link>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setFilter('cho_xu_ly')}
            className={`px-4 py-2 font-medium transition-all ${
              filter === 'cho_xu_ly'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            ⏳ Chờ xử lý ({dons.filter(d => d.trangThai === 'cho_xu_ly').length})
          </button>
          <button
            onClick={() => setFilter('da_xu_ly')}
            className={`px-4 py-2 font-medium transition-all ${
              filter === 'da_xu_ly'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            ✅ Đã xử lý ({dons.filter(d => d.trangThai === 'da_xu_ly').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium transition-all ${
              filter === 'all'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📋 Tất cả ({dons.length})
          </button>
        </div>

        {/* TABLE */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-lg">
          {dons.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Không có đơn nào
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tạm vắng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nơi đến</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lý do</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {dons.map((don, index) => (
                    <tr key={don._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {don.nhanKhauId?.hoTen || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          CCCD: {don.nhanKhauId?.canCuocCongDan || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {don.noiDen}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div>{new Date(don.tuNgay).toLocaleDateString('vi-VN')}</div>
                        <div className="text-xs">→ {new Date(don.denNgay).toLocaleDateString('vi-VN')}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {don.lyDo}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(don.trangThai, don.lyDoTuChoi)}
                        {don.lyDoTuChoi && (
                          <div className="text-xs text-red-500 mt-1">
                            Lý do: {don.lyDoTuChoi}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/dashboard/don-tam-vang/${don._id}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>

                          {canAccess(['admin', 'to_truong']) && don.trangThai === 'cho_xu_ly' && (
                            <>
                              <button
                                onClick={() => handleApprove(don._id)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400"
                                title="Duyệt"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleReject(don._id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400"
                                title="Từ chối"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            </>
                          )}

                          {(don.nguoiTao?._id === user?._id || canAccess('admin')) && don.trangThai === 'cho_xu_ly' && (
                            <button
                              onClick={() => handleDelete(don._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400"
                              title="Xóa"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
      </div>
    </>
  );
}