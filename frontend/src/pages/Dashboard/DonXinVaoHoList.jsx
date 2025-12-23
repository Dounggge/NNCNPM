import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { donXinVaoHoAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function DonXinVaoHoList() {
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
      const response = await donXinVaoHoAPI.getAll();
      setDons(response.data.data || []);
    } catch (error) {
      console.error('Error fetching dons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xác nhận xóa đơn này?')) return;

    try {
      await donXinVaoHoAPI.delete(id);
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
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Đơn xin vào hộ" />
      <PageBreadcrumb pageTitle="Đơn xin vào hộ khẩu" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              📋 Danh sách Đơn xin vào hộ
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Tổ trưởng xem thông tin và tự thêm vào hộ khẩu
            </p>
          </div>

          <div className="flex gap-3">
            {/* Nút tạo đơn */}
            <button
              type="button"
              onClick={() => navigate('/dashboard/donxinvaoho/create')}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo đơn mới
            </button>
          </div>
        </div>

        {/* Table */}
        {dons.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">Không có đơn nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Người xin vào
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    CCCD
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Hộ khẩu
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Chủ hộ
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Quan hệ
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Ngày gửi
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {dons.map((don) => (
                  <tr 
                    key={don._id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {don.thongTinNguoiXin?.hoTen || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {don.thongTinNguoiXin?.canCuocCongDan || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {don.hoKhauId?.soHoKhau || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {don.chuHoId?.hoTen || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">
                      {don.quanHeVoiChuHo || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(don.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/donxinvaoho/${don._id}`)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                        >
                          Xem chi tiết →
                        </button>

                        {/* Chỉ người tạo hoặc admin mới xóa được */}
                        {(don.nguoiTao?._id === user?._id || canAccess('admin')) && (
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
    </>
  );
}