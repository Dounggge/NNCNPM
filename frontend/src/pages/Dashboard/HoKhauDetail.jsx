import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { hoKhauAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function HoKhauDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, canAccess } = useAuth();
  const [hoKhau, setHoKhau] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHoKhauDetail();
  }, [id]);

  const fetchHoKhauDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await hoKhauAPI.getById(id);
      console.log('📊 HoKhau detail response:', response.data);
      
      const data = response.data.data || response.data;
      setHoKhau(data);
    } catch (error) {
      console.error('❌ Error fetching ho khau detail:', error);
      
      // ← KIỂM TRA LỖI 403 (KHÔNG CÓ QUYỀN)
      if (error.response?.status === 403) {
        setError('Bạn không có quyền xem hộ khẩu này');
      } else {
        setError(error.response?.data?.message || 'Lỗi tải dữ liệu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('⚠️ Xác nhận xóa hộ khẩu này?\n\nHành động không thể hoàn tác!')) {
      return;
    }

    try {
      await hoKhauAPI.delete(id);
      alert('✅ Đã xóa hộ khẩu');
      navigate('/dashboard/hokhau');
    } catch (error) {
      console.error('❌ Delete error:', error);
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
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg max-w-md">
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            ← Về Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!hoKhau) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-yellow-600 dark:text-yellow-400 text-lg">Không tìm thấy hộ khẩu</p>
        </div>
      </div>
    );
  }

  // ← KIỂM TRA QUYỀN CHỈNH SỬA/XÓA
  const canEdit = canAccess(['admin', 'to_truong', 'chu_ho']);
  const canDelete = canAccess(['admin', 'to_truong']);

  return (
    <>
      <PageMeta
        title={`Hộ khẩu ${hoKhau.soHoKhau} | Chi tiết`}
        description={`Thông tin chi tiết hộ khẩu ${hoKhau.soHoKhau}`}
      />
      <PageBreadcrumb
        pageTitle="Chi tiết Hộ Khẩu"
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Hộ khẩu', path: '/dashboard/hokhau' },
          { label: hoKhau.soHoKhau }
        ]}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Hộ khẩu: {hoKhau.soHoKhau}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {hoKhau.diaChiThuongTru}
            </p>
          </div>

          <div className="flex gap-3">
            {canEdit && (
              <Link
                to={`/dashboard/hokhau/${id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Chỉnh sửa
              </Link>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Thông tin cơ bản */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            📋 Thông tin hộ khẩu
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Số hộ khẩu
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {hoKhau.soHoKhau}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Chủ hộ
              </label>
              <p className="text-base text-gray-900 dark:text-white">
                {hoKhau.chuHo?.hoTen || 'Chưa có'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Ngày lập
              </label>
              <p className="text-base text-gray-900 dark:text-white">
                {new Date(hoKhau.ngayLap).toLocaleDateString('vi-VN')}
              </p>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Địa chỉ thường trú
              </label>
              <p className="text-base text-gray-900 dark:text-white">
                {hoKhau.diaChiThuongTru}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Số thành viên
              </label>
              <p className="text-base text-gray-900 dark:text-white">
                {hoKhau.thanhVien?.length || 0} người
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Trạng thái
              </label>
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(hoKhau.trangThai)}`}>
                {getStatusText(hoKhau.trangThai)}
              </span>
            </div>
          </div>
        </div>

        {/* Danh sách thành viên */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              👥 Danh sách thành viên ({hoKhau.thanhVien?.length || 0})
            </h2>

            {canAccess(['admin', 'to_truong']) && (
              <button
                type="button"
                onClick={() => navigate(`/dashboard/hokhau/${id}/add-member`)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm thành viên
              </button>
            )}
          </div>

          {hoKhau.thanhVien && hoKhau.thanhVien.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">STT</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Họ và tên</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">CCCD</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ngày sinh</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Giới tính</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Quan hệ với chủ hộ</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {hoKhau.thanhVien.map((tv, index) => (
                    <tr key={tv._id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{index + 1}</td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {tv.hoTen || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {tv.canCuocCongDan || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {tv.ngaySinh ? new Date(tv.ngaySinh).toLocaleDateString('vi-VN') : 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {tv.gioiTinh || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {tv.quanHeVoiChuHo || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          to={`/dashboard/nhankhau/${tv._id}`}
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
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Chưa có thành viên nào
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Ngày tạo:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {new Date(hoKhau.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Cập nhật lần cuối:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {new Date(hoKhau.updatedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}