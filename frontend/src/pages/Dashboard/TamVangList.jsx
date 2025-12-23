import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tamVangAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function TamVangList() {
  const navigate = useNavigate();
  const { user, canAccess } = useAuth();
  const [dons, setDons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDons();
  }, []);

  const fetchDons = async () => {
    try {
      setLoading(true);
      const response = await tamVangAPI.getAll();
      setDons(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tạm vắng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('❓ Xác nhận xóa đơn tạm vắng này?')) return;

    try {
      await tamVangAPI.delete(id);
      alert('✅ Đã xóa đơn');
      fetchDons();
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Danh sách tạm vắng" />
      <PageBreadcrumb pageTitle="Danh sách tạm vắng" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg">
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 flex items-center justify-center text-3xl shadow-lg">
                ✈️
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Danh sách tạm vắng
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Tổ trưởng xem thông tin và tự thêm vào danh sách
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard/tamvang/create')}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:from-rose-600 hover:to-red-600 transition-all shadow-lg font-medium flex items-center gap-2 justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Đăng ký tạm vắng
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="p-6">
          {dons.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-6xl mb-4">✈️</div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Chưa có đơn tạm vắng nào
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-2 border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Người đăng ký
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      CCCD
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Nơi đến
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Thời gian
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {dons.map((don) => (
                    <tr 
                      key={don._id}
                      className="hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dashboard/tamvang/${don._id}`)}
                    >
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {don.nhanKhauId?.hoTen || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {don.nhanKhauId?.canCuocCongDan || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {don.noiDen}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(don.tuNgay).toLocaleDateString('vi-VN')} 
                        {' → '} 
                        {new Date(don.denNgay).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Chờ xử lý
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/tamvang/${don._id}`);
                            }}
                            className="text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium"
                          >
                            Xem →
                          </button>

                          {(don.nhanKhauId?._id === user?.nhanKhauId?._id || 
                            don.nhanKhauId?._id === user?.nhanKhauId || 
                            canAccess('admin', 'to_truong')) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(don._id);
                              }}
                              className="text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                              Xóa
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