import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tamTruAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function TamTruList() {
  const navigate = useNavigate();
  const { user, canAccess } = useAuth();
  const [tamTrus, setTamTrus] = useState([]); // ← SỬA: dons → tamTrus
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTamTrus(); // ← SỬA: fetchDons → fetchTamTrus
  }, []);

  const fetchTamTrus = async () => { // ← SỬA: Đổi tên hàm
    try {
      setLoading(true);
      const response = await tamTruAPI.getAll({ trangThai: 'da_duyet', limit: 1000 });
      setTamTrus(response.data.data || response.data || []); // ← SỬA: dons → tamTrus
    } catch (error) {
      console.error('Fetch error:', error);
      alert('❌ Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('❓ Xác nhận xóa tạm trú này?')) return;

    try {
      await tamTruAPI.delete(id);
      alert('✅ Đã xóa');
      fetchTamTrus(); // ← SỬA: fetchDons → fetchTamTrus
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Danh sách tạm trú" />
      <PageBreadcrumb pageTitle="Danh sách tạm trú" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg">
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg">
                🏘️
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Danh sách người Tạm trú
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {canAccess(['admin', 'to_truong']) ? 'Quản lý người tạm trú' : 'Danh sách tạm trú của bạn'}
                </p>
              </div>
            </div>

            {canAccess(['admin', 'to_truong', 'ke_toan']) && (
              <button
                type="button"
                onClick={() => navigate('/dashboard/tamtru/create')}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg font-medium flex items-center gap-2 justify-center"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm tạm trú
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="p-6">
          {tamTrus.length === 0 ? ( 
            <div className="py-16 text-center">
              <div className="text-6xl mb-4">🏘️</div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Chưa có người tạm trú nào
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-2 border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">STT</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Người tạm trú</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">CCCD</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Địa chỉ tạm trú</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Thời gian</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {tamTrus.map((tamTru, index) => ( 
                    <tr 
                      key={tamTru._id}
                      className="hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {tamTru.nhanKhauId?.hoTen || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {tamTru.nhanKhauId?.canCuocCongDan || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {tamTru.diaChiTamTru}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div>{new Date(tamTru.tuNgay).toLocaleDateString('vi-VN')}</div>
                        <div className="text-xs">→ {new Date(tamTru.denNgay).toLocaleDateString('vi-VN')}</div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          ✅ Đã duyệt
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/tamtru/${tamTru._id}`)}
                            className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
                          >
                            Xem chi tiết →
                          </button>

                          {canAccess(['admin', 'to_truong']) && (
                            <button
                              onClick={() => handleDelete(tamTru._id)}
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