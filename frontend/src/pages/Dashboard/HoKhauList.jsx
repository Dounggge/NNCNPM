import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { hoKhauAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function HoKhauList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoKhaus, setHoKhaus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    trangThai: 'all',
    search: ''
  });

  // ← KIỂM TRA QUYỀN TRUY CẬP
  useEffect(() => {
    if (!user) return;

    const allowedRoles = ['admin', 'to_truong', 'ke_toan'];
    
    if (!allowedRoles.includes(user.vaiTro)) {
      alert('⚠️ Bạn không có quyền truy cập trang này!\n\nChỉ Admin/Tổ trưởng/Kế toán mới có thể xem danh sách hộ khẩu.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchHoKhaus();
  }, [filter]);

  const fetchHoKhaus = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await hoKhauAPI.getAll();
      console.log('📊 HoKhau response:', response.data);

      let data = response.data.data || [];

      // ← LỌC THEO TRẠNG THÁI
      if (filter.trangThai !== 'all') {
        data = data.filter(hk => hk.trangThai === filter.trangThai);
      }

      // ← TÌM KIẾM
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        data = data.filter(hk => 
          hk.soHoKhau?.toLowerCase().includes(searchLower) ||
          hk.chuHo?.hoTen?.toLowerCase().includes(searchLower) ||
          hk.diaChiThuongTru?.toLowerCase().includes(searchLower)
        );
      }

      setHoKhaus(data);
    } catch (error) {
      console.error('❌ Error fetching ho khau:', error);
      setError(error.response?.data?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // ← THÊM FUNCTION DUYỆT HỘ KHẨU
  const handleApprove = async (id) => {
    if (!window.confirm('Xác nhận duyệt hộ khẩu này?')) return;

    try {
      await hoKhauAPI.approve(id);
      alert('✅ Đã duyệt hộ khẩu thành công!');
      fetchHoKhaus(); // Reload danh sách
    } catch (error) {
      console.error('❌ Approve error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  // ← THÊM FUNCTION TỪ CHỐI HỘ KHẨU
  const handleReject = async (id) => {
    const reason = window.prompt('Nhập lý do từ chối:');
    if (!reason) return;

    try {
      await hoKhauAPI.reject(id, { reason });
      alert('✅ Đã từ chối hộ khẩu!');
      fetchHoKhaus();
    } catch (error) {
      console.error('❌ Reject error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ duyệt',
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
      rejected: 'Đã từ chối'
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          <button
            type="button"
            onClick={fetchHoKhaus}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // ← KIỂM TRA QUYỀN DUYỆT
  const canApprove = user && ['admin', 'to_truong'].includes(user.vaiTro);

  return (
    <>
      <PageMeta
        title="Quản lý Hộ Khẩu | Hệ thống Quản lý Khu Dân Cư"
        description="Danh sách hộ khẩu trong khu dân cư"
      />
      <PageBreadcrumb pageTitle="Quản lý Hộ Khẩu" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            🏠 Danh sách Hộ Khẩu
          </h3>
          
          <div className="flex gap-3">
            {/* Tìm kiếm */}
            <input
              type="text"
              placeholder="Tìm kiếm số HK, chủ hộ, địa chỉ..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />

            {/* Lọc trạng thái */}
            <select
              value={filter.trangThai}
              onChange={(e) => setFilter({ ...filter, trangThai: e.target.value })}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
        </div>

        {/* Thống kê */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng hộ khẩu</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{hoKhaus.length}</p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Chờ duyệt</p>
            <p className="text-2xl font-bold text-yellow-600">
              {hoKhaus.filter(hk => hk.trangThai === 'pending').length}
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Hoạt động</p>
            <p className="text-2xl font-bold text-green-600">
              {hoKhaus.filter(hk => hk.trangThai === 'active').length}
            </p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Đã từ chối</p>
            <p className="text-2xl font-bold text-red-600">
              {hoKhaus.filter(hk => hk.trangThai === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Table */}
        {hoKhaus.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">Không có dữ liệu</p>
          </div>
        ) : (
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
                    Ngày cập nhật
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
                {hoKhaus.map((hk) => (
                  <tr key={hk._id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {hk.soHoKhau}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {hk.chuHo?.hoTen || 'Chưa có'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {hk.diaChiThuongTru}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {hk.thanhVien?.length || 0} người
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(hk.updatedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(hk.trangThai)}`}>
                        {getStatusText(hk.trangThai)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* ← NÚT DUYỆT (CHỈ HIỆN NẾU PENDING VÀ CÓ QUYỀN) */}
                        {hk.trangThai === 'pending' && canApprove && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(hk._id)}
                              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              ✅ Duyệt
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(hk._id)}
                              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              ❌ Từ chối
                            </button>
                          </>
                        )}
                        
                        <Link
                          to={`/dashboard/hokhau/${hk._id}`}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          Xem chi tiết →
                        </Link>
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