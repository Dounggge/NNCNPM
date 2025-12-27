import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { khoanThuAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function KhoanThuDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [khoanThu, setKhoanThu] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchKhoanThuDetail();
  }, [id]);

const fetchKhoanThuDetail = async () => {
  try {
    setLoading(true);
    const response = await khoanThuAPI.getById(id);

    const data = response.data?.data || response.data;

    if (!data || !data._id) {
      throw new Error('Khoản thu không hợp lệ');
    }

    setKhoanThu(data);
  } catch (error) {
    console.error(error);
    setError('Không thể tải thông tin khoản thu');
  } finally {
    setLoading(false);
  }
};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không giới hạn';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDonVi = (donVi) => {
    const donViMap = {
      'VND/thang': 'VNĐ/tháng',
      'VND/m2': 'VNĐ/m²',
      'VND/nguoi': 'VNĐ/người',
      'VND/lan': 'VNĐ/lần',
    };
    
    return donViMap[donVi] || donVi || 'Không xác định';
  };

  const getLoaiKhoanThuLabel = (loai) => {
    const labels = {
      'bat_buoc': '🔴 Bắt buộc',
      'dong_gop': '🔵 Đóng góp',
      'dich_vu': '🟢 Dịch vụ'
    };
    
    return labels[loai] || loai;
  };

  const getLoaiKhoanThuBadge = (loai) => {
    const badges = {
      'bat_buoc': 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500',
      'dong_gop': 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500',
      'dich_vu': 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500'
    };

    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badges[loai]}`}>
        {getLoaiKhoanThuLabel(loai)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !khoanThu) {
    return (
      <div className="py-16 text-center">
        <div className="mb-4 text-6xl">⚠️</div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          {error || 'Không tìm thấy khoản thu'}
        </h3>
        <p className="mb-4 text-gray-500 dark:text-gray-400">
          Khoản thu này có thể đã bị xóa hoặc không tồn tại
        </p>
        <Link
          to="/dashboard/khoanthu"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Chi tiết Khoản thu: ${khoanThu.tenKhoanThu}`}
        description={`Thông tin chi tiết khoản thu ${khoanThu.tenKhoanThu}`}
      />
      <PageBreadcrumb 
        pageTitle="Chi tiết Khoản thu"
        breadcrumbs={[
          { title: 'Quản lý Khoản thu', link: '/dashboard/khoanthu' },
          { title: khoanThu.tenKhoanThu, link: null }
        ]}
      />

      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header với thông tin cơ bản */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {khoanThu.tenKhoanThu}
              </h3>
              <div className="mt-2 flex items-center gap-4">
                {getLoaiKhoanThuBadge(khoanThu.loaiKhoanThu)}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {khoanThu._id}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link
                to="/dashboard/khoanthu"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                ← Quay lại
              </Link>
              
              {hasPermission('khoanthu:update') && (
                <Link
                  to={`/dashboard/khoanthu/edit/${khoanThu._id}`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  ✏️ Chỉnh sửa
                </Link>
              )}
            </div>
          </div>

          {/* Thông tin tổng quan */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-500/10 dark:to-blue-500/5">
              <div className="text-sm text-blue-600 dark:text-blue-400">Đơn giá</div>
              <div className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(khoanThu.donGia)}
              </div>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formatDonVi(khoanThu.donVi)}
              </div>
            </div>
            
            <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-4 dark:from-green-500/10 dark:to-green-500/5">
              <div className="text-sm text-green-600 dark:text-green-400">Thời hạn bắt đầu</div>
              <div className="mt-2 text-xl font-bold text-green-700 dark:text-green-300">
                {formatDate(khoanThu.batDau)}
              </div>
            </div>
            
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:from-purple-500/10 dark:to-purple-500/5">
              <div className="text-sm text-purple-600 dark:text-purple-400">Thời hạn kết thúc</div>
              <div className="mt-2 text-xl font-bold text-purple-700 dark:text-purple-300">
                {formatDate(khoanThu.ketThuc) || 'Không giới hạn'}
              </div>
            </div>
          </div>

          {/* Form chỉ đọc */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tên khoản thu
                </label>
                <div className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {khoanThu.tenKhoanThu}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Loại khoản thu
                </label>
                <div className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {getLoaiKhoanThuLabel(khoanThu.loaiKhoanThu)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Đơn giá
                </label>
                <div className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {formatCurrency(khoanThu.donGia)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Đơn vị tính
                </label>
                <div className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {formatDonVi(khoanThu.donVi)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bắt đầu từ
                </label>
                <div className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {formatDate(khoanThu.batDau)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kết thúc
                </label>
                <div className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {formatDate(khoanThu.ketThuc) || 'Không giới hạn'}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mô tả
                </label>
                <div className="mt-1 min-h-[100px] w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {khoanThu.moTa || 'Không có mô tả'}
                </div>
              </div>
            </div>

            {/* Thông tin bổ sung */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
              <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Thông tin bổ sung
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Ngày tạo:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-300">
                    {formatDate(khoanThu.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Cập nhật lần cuối:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-300">
                    {formatDate(khoanThu.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/dashboard/khoanthu')}
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Quay lại danh sách
              </button>
              
              {hasPermission('khoanthu:update') && (
                <Link
                  to={`/dashboard/khoanthu/edit/${khoanThu._id}`}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  ✏️ Chỉnh sửa
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}