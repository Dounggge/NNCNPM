import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { hoKhauAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function HoKhauDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [hoKhau, setHoKhau] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHoKhauDetail();
  }, [id]);

  const fetchHoKhauDetail = async () => {
    try {
      setLoading(true);
      const response = await hoKhauAPI.getById(id);
      setHoKhau(response.data);
    } catch (error) {
      console.error('Error fetching ho khau detail:', error);
      alert('Không thể tải thông tin hộ khẩu');
      navigate('/dashboard/hokhau');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa hộ khẩu này? Thao tác này không thể hoàn tác!')) return;
    
    try {
      await hoKhauAPI.delete(id);
      alert('Xóa hộ khẩu thành công!');
      navigate('/dashboard/hokhau');
    } catch (error) {
      alert('Lỗi khi xóa: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!hoKhau) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">🏠</div>
          <h3 className="mb-2 text-lg font-semibold text-red-600">
            Không tìm thấy hộ khẩu
          </h3>
          <Link to="/dashboard/hokhau" className="text-blue-600 hover:underline">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Hộ khẩu ${hoKhau.soHoKhau} | Chi tiết`}
        description={`Thông tin chi tiết hộ khẩu số ${hoKhau.soHoKhau}`}
      />
      <PageBreadcrumb pageTitle={`Hộ khẩu: ${hoKhau.soHoKhau}`} />

      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🏠 Hộ khẩu: {hoKhau.soHoKhau}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Chủ hộ: {hoKhau.chuHo?.hoTen || 'Chưa có'}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/dashboard/hokhau"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
            >
              ← Quay lại
            </Link>

            {hasPermission('hokhau:update') && (
              <Link
                to={`/dashboard/hokhau/edit/${id}`}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                ✏️ Chỉnh sửa
              </Link>
            )}

            {hasPermission('hokhau:delete') && (
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                🗑️ Xóa
              </button>
            )}
          </div>
        </div>

        {/* Thông tin hộ khẩu */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            📋 Thông tin hộ khẩu
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InfoItem label="Số hộ khẩu" value={hoKhau.soHoKhau} />
            <InfoItem label="Chủ hộ" value={hoKhau.chuHo?.hoTen || 'Chưa có'} />
            <InfoItem 
              label="Địa chỉ thường trú" 
              value={hoKhau.diaChiThuongTru} 
              className="md:col-span-2"
            />
            <InfoItem label="Khu vực" value={hoKhau.khuVuc || 'N/A'} />
            <InfoItem label="Ngày cấp" value={formatDate(hoKhau.ngayCapSo)} />
            <InfoItem label="Nơi cấp" value={hoKhau.noiCap || 'N/A'} />
            <InfoItem label="Số thành viên" value={`${hoKhau.thanhVien?.length || 0} người`} />
          </div>
        </div>

        {/* Danh sách thành viên */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              👨‍👩‍👧‍👦 Danh sách thành viên ({hoKhau.thanhVien?.length || 0})
            </h3>
            
            {hasPermission('nhankhau:create') && (
              <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                ➕ Thêm thành viên
              </button>
            )}
          </div>

          {hoKhau.thanhVien && hoKhau.thanhVien.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Họ và tên
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Quan hệ với chủ hộ
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Ngày sinh
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      CCCD
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {hoKhau.thanhVien.map((tv) => (
                    <tr key={tv._id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {tv.hoTen}
                        {tv._id === hoKhau.chuHo?._id && (
                          <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-500/10 dark:text-blue-400">
                            Chủ hộ
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {tv.quanHeVoiChuHo || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(tv.ngaySinh)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {tv.canCuocCongDan || 'N/A'}
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
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              <div className="mb-3 text-4xl">👤</div>
              <p>Chưa có thành viên nào trong hộ khẩu này</p>
            </div>
          )}
        </div>

        {/* Thông tin bổ sung */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            📝 Thông tin bổ sung
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InfoItem label="Ngày tạo" value={formatDate(hoKhau.createdAt)} />
            <InfoItem label="Cập nhật lần cuối" value={formatDate(hoKhau.updatedAt)} />
            <InfoItem 
              label="Ghi chú" 
              value={hoKhau.ghiChu || 'Không có ghi chú'} 
              className="md:col-span-2"
            />
          </div>
        </div>
      </div>
    </>
  );
}

// Component hiển thị thông tin
function InfoItem({ label, value, className = '' }) {
  return (
    <div className={className}>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
        {value || 'N/A'}
      </p>
    </div>
  );
}