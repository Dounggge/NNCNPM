import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { nhanKhauAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function NhanKhauDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [nhanKhau, setNhanKhau] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNhanKhauDetail();
  }, [id]);

  const fetchNhanKhauDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await nhanKhauAPI.getById(id);
      console.log('📊 NhanKhau detail response:', response.data);
      
      const data = response.data.data || response.data;
      setNhanKhau(data);
    } catch (error) {
      console.error('❌ Error fetching nhan khau detail:', error);
      setError(error.response?.data?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('⚠️ Xác nhận xóa nhân khẩu này?\n\nHành động không thể hoàn tác!')) {
      return;
    }

    try {
      await nhanKhauAPI.delete(id);
      alert('✅ Đã xóa nhân khẩu');
      navigate('/dashboard/nhankhau');
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getGenderIcon = (gender) => {
    if (gender === 'Nam') return '👨';
    if (gender === 'Nu' || gender === 'Nữ') return '👩';
    return '⚧';
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
            onClick={() => navigate('/dashboard/nhankhau')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            ← Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  if (!nhanKhau) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-yellow-600 dark:text-yellow-400 text-lg">Không tìm thấy nhân khẩu</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${nhanKhau.hoTen} | Chi tiết Nhân Khẩu`}
        description={`Thông tin chi tiết nhân khẩu ${nhanKhau.hoTen}`}
      />
      <PageBreadcrumb
        pageTitle="Chi tiết Nhân Khẩu"
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Quản lý Nhân Khẩu', path: '/dashboard/nhankhau' },
          { label: nhanKhau.hoTen }
        ]}
      />

      <div className="space-y-6">
        {/* Header với buttons */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {nhanKhau.hoTen}
          </h1>

          <div className="flex gap-3">
            {hasPermission('nhankhau:update') && (
              <Link
                to={`/dashboard/nhankhau/${id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Chỉnh sửa
              </Link>
            )}

            {hasPermission('nhankhau:delete') && (
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Thông tin cơ bản
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoItem label="Họ và tên" value={nhanKhau.hoTen} />
            <InfoItem label="CCCD/CMND" value={nhanKhau.canCuocCongDan} />
            <InfoItem 
              label="Ngày sinh" 
              value={formatDate(nhanKhau.ngaySinh)} 
            />
            <InfoItem 
              label="Giới tính" 
              value={`${getGenderIcon(nhanKhau.gioiTinh)} ${nhanKhau.gioiTinh}`} 
            />
            <InfoItem label="Dân tộc" value={nhanKhau.danToc || 'Chưa cập nhật'} />
            <InfoItem label="Tôn giáo" value={nhanKhau.tonGiao || 'Không'} />
            <InfoItem 
              label="Quê quán" 
              value={nhanKhau.queQuan || 'Chưa cập nhật'} 
              fullWidth 
            />
            <InfoItem 
              label="Nơi sinh" 
              value={nhanKhau.noiSinh || 'Chưa cập nhật'} 
              fullWidth 
            />
          </div>
        </div>

        {/* Thông tin liên hệ */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Thông tin liên hệ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem 
              label="Số điện thoại" 
              value={nhanKhau.soDienThoai || 'Chưa cập nhật'} 
            />
            <InfoItem 
              label="Email" 
              value={nhanKhau.email || 'Chưa cập nhật'} 
            />
          </div>
        </div>

        {/* Thông tin công việc */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Thông tin công việc & Học vấn
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem 
              label="Nghề nghiệp" 
              value={nhanKhau.ngheNghiep || 'Chưa cập nhật'} 
            />
            <InfoItem 
              label="Nơi làm việc" 
              value={nhanKhau.noiLamViec || 'Chưa cập nhật'} 
            />
            <InfoItem 
              label="Trình độ học vấn" 
              value={nhanKhau.trinhDoHocVan || 'Chưa cập nhật'} 
            />
            <InfoItem 
              label="Quốc tịch" 
              value={nhanKhau.quocTich || 'Việt Nam'} 
            />
          </div>
        </div>

        {/* Thông tin hộ khẩu */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Thông tin hộ khẩu
          </h2>

          {nhanKhau.hoKhauId ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Số hộ khẩu</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {nhanKhau.hoKhauId.soHoKhau}
                  </p>
                </div>
                <Link
                  to={`/dashboard/hokhau/${nhanKhau.hoKhauId._id}`}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                >
                  Xem chi tiết
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              {nhanKhau.hoKhauId.diaChiThuongTru && (
                <InfoItem 
                  label="Địa chỉ thường trú" 
                  value={nhanKhau.hoKhauId.diaChiThuongTru} 
                  fullWidth 
                />
              )}
              
              {nhanKhau.quanHeVoiChuHo && (
                <InfoItem 
                  label="Quan hệ với chủ hộ" 
                  value={nhanKhau.quanHeVoiChuHo} 
                />
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <p>Chưa thuộc hộ khẩu nào</p>
            </div>
          )}
        </div>

        {/* Trạng thái */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Trạng thái
          </h2>

          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              nhanKhau.trangThai === 'active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
            }`}>
              {nhanKhau.trangThai === 'active' ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Hoạt động
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Không hoạt động
                </>
              )}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Ngày tạo:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {formatDate(nhanKhau.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Cập nhật lần cuối:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {formatDate(nhanKhau.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper Component
function InfoItem({ label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? 'md:col-span-3' : ''}>
      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      <p className="text-base font-medium text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}