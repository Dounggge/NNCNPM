import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { nhanKhauAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function NhanKhauDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [nhanKhau, setNhanKhau] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchNhanKhauDetail();
  }, [id]);

  const fetchNhanKhauDetail = async () => {
    try {
      setLoading(true);
      const response = await nhanKhauAPI.getById(id);
      setNhanKhau(response.data);
    } catch (error) {
      console.error('Error fetching nhan khau detail:', error);
      alert('Không thể tải thông tin nhân khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa nhân khẩu này?')) return;
    
    try {
      await nhanKhauAPI.delete(id);
      alert('Xóa thành công!');
      navigate('/dashboard/nhankhau');
    } catch (error) {
      alert('Lỗi khi xóa: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!nhanKhau) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-500">Không tìm thấy thông tin nhân khẩu</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${nhanKhau.hoTen} | Thông tin Nhân Khẩu`}
        description="Chi tiết thông tin nhân khẩu"
      />
      <PageBreadcrumb pageTitle={`Chi tiết: ${nhanKhau.hoTen}`} />

      <div className="space-y-6">
        {/* Header với actions */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {nhanKhau.hoTen}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              CCCD: {nhanKhau.canCuocCongDan}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/dashboard/nhankhau"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
            >
              ← Quay lại
            </Link>

            {hasPermission('nhankhau:update') && (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Chỉnh sửa
              </button>
            )}

            {hasPermission('nhankhau:delete') && (
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Thông tin cá nhân */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            Thông tin cá nhân
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InfoItem label="Họ và tên" value={nhanKhau.hoTen} />
            <InfoItem label="CCCD" value={nhanKhau.canCuocCongDan} />
            <InfoItem 
              label="Ngày sinh" 
              value={nhanKhau.ngaySinh ? new Date(nhanKhau.ngaySinh).toLocaleDateString('vi-VN') : 'N/A'} 
            />
            <InfoItem label="Giới tính" value={nhanKhau.gioiTinh} />
            <InfoItem label="Dân tộc" value={nhanKhau.danToc || 'N/A'} />
            <InfoItem label="Quốc tịch" value={nhanKhau.quocTich || 'Việt Nam'} />
            <InfoItem label="Nghề nghiệp" value={nhanKhau.ngheNghiep || 'N/A'} />
            <InfoItem label="Tôn giáo" value={nhanKhau.tonGiao || 'N/A'} />
          </div>
        </div>

        {/* Thông tin hộ khẩu */}
        {nhanKhau.hoKhauId && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin hộ khẩu
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoItem label="Số hộ khẩu" value={nhanKhau.hoKhauId.soHoKhau} />
              <InfoItem label="Quan hệ với chủ hộ" value={nhanKhau.quanHeVoiChuHo || 'N/A'} />
              <InfoItem 
                label="Địa chỉ thường trú" 
                value={nhanKhau.diaChiThuongTru || 'N/A'} 
                className="md:col-span-2"
              />
            </div>
          </div>
        )}

        {/* Thông tin liên hệ */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            Thông tin liên hệ
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InfoItem label="Số điện thoại" value={nhanKhau.soDienThoai || 'Chưa cập nhật'} />
            <InfoItem label="Email" value={nhanKhau.email || 'Chưa cập nhật'} />
            <InfoItem 
              label="Địa chỉ hiện tại" 
              value={nhanKhau.diaChiHienTai || 'N/A'} 
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