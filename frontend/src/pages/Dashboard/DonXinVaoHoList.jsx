import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { donXinVaoHoAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function DonXinVaoHoList() {
  const navigate = useNavigate();
  const { user, canAccess } = useAuth();
  const [dons, setDons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDon, setSelectedDon] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    trangThai: 'da_duyet',
    ghiChuDuyet: ''
  });

  useEffect(() => {
    fetchDons();
  }, [filter]);

  const fetchDons = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { trangThai: filter } : {};
      const response = await donXinVaoHoAPI.getAll(params);
      setDons(response.data.data || []);
    } catch (error) {
      console.error('Error fetching dons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedDon) return;

    try {
      await donXinVaoHoAPI.approve(selectedDon._id, approvalData);
      alert(approvalData.trangThai === 'da_duyet' 
        ? '✅ Đã duyệt đơn và thêm vào hộ khẩu!'
        : '❌ Đã từ chối đơn'
      );
      setShowApprovalModal(false);
      setSelectedDon(null);
      fetchDons();
    } catch (error) {
      console.error('Approval error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa đơn này?')) return;

    try {
      await donXinVaoHoAPI.delete(id);
      alert('✅ Đã xóa đơn');
      fetchDons();
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      cho_duyet: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      da_duyet: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      tu_choi: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      cho_duyet: 'Chờ duyệt',
      da_duyet: 'Đã duyệt',
      tu_choi: 'Từ chối'
    };
    return texts[status] || status;
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
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Danh sách Đơn xin vào hộ
          </h3>

          <div className="flex gap-3">
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="cho_duyet">Chờ duyệt</option>
              <option value="da_duyet">Đã duyệt</option>
              <option value="tu_choi">Từ chối</option>
            </select>

            {/* Nút tạo đơn (chỉ Chủ hộ) */}
            {canAccess('chu_ho') && (
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
            )}
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
                    Quan hệ
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Ngày gửi
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {dons.map((don) => (
                  <tr key={don._id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {don.thongTinNguoiXin.hoTen}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {don.thongTinNguoiXin.canCuocCongDan}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {don.hoKhauId?.soHoKhau}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {don.quanHeVoiChuHo}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(don.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(don.trangThai)}`}>
                        {getStatusText(don.trangThai)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right space-x-2">
                      <Link
                        to={`/dashboard/donxinvaoho/${don._id}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Chi tiết
                      </Link>
                      
                      {/* Nút Duyệt (Tổ trưởng + đơn chờ duyệt) */}
                      {canAccess(['admin', 'to_truong']) && don.trangThai === 'cho_duyet' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDon(don);
                            setShowApprovalModal(true);
                          }}
                          className="text-sm text-green-600 hover:text-green-700"
                        >
                          Duyệt
                        </button>
                      )}

                      {/* Nút Xóa (Chủ hộ + đơn chờ duyệt) */}
                      {canAccess('chu_ho') && don.trangThai === 'cho_duyet' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(don._id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Duyệt/Từ chối */}
      {showApprovalModal && selectedDon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Duyệt đơn xin vào hộ
            </h3>

            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Người xin vào:</strong> {selectedDon.thongTinNguoiXin.hoTen}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>CCCD:</strong> {selectedDon.thongTinNguoiXin.canCuocCongDan}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Quan hệ:</strong> {selectedDon.quanHeVoiChuHo}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quyết định <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="approval"
                      value="da_duyet"
                      checked={approvalData.trangThai === 'da_duyet'}
                      onChange={(e) => setApprovalData({ ...approvalData, trangThai: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-sm text-green-600 font-medium">✅ Duyệt</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="approval"
                      value="tu_choi"
                      checked={approvalData.trangThai === 'tu_choi'}
                      onChange={(e) => setApprovalData({ ...approvalData, trangThai: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-sm text-red-600 font-medium">❌ Từ chối</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ghi chú
                </label>
                <textarea
                  rows="3"
                  value={approvalData.ghiChuDuyet}
                  onChange={(e) => setApprovalData({ ...approvalData, ghiChuDuyet: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Lý do từ chối hoặc ghi chú..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedDon(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className={`px-4 py-2 text-white rounded-lg ${
                  approvalData.trangThai === 'da_duyet'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}