import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { donTamTruAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function DonTamTruDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, canAccess } = useAuth();
  const [don, setDon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDon();
  }, [id]);

  const fetchDon = async () => {
    try {
      setLoading(true);
      const response = await donTamTruAPI.getById(id);
      setDon(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching đơn:', error);
      alert('❌ Lỗi tải đơn: ' + (error.response?.data?.message || error.message));
      navigate('/dashboard/don-tam-tru');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('✅ Xác nhận DUYỆT đơn này?')) return;

    try {
      await donTamTruAPI.approve(id);
      alert('✅ Đã duyệt đơn thành công!');
      navigate('/dashboard/don-tam-tru');
    } catch (error) {
      console.error('Approve error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async () => {
    const lyDoTuChoi = prompt('❌ Nhập lý do từ chối:');
    if (!lyDoTuChoi) return;

    try {
      await donTamTruAPI.reject(id, { lyDoTuChoi });
      alert('❌ Đã từ chối đơn');
      navigate('/dashboard/don-tam-tru');
    } catch (error) {
      console.error('Reject error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!don) return null;

  const getStatusBadge = () => {
    if (don.trangThai === 'cho_xu_ly') {
      return <span className="px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">⏳ Chờ xử lý</span>;
    }
    if (don.lyDoTuChoi) {
      return <span className="px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">❌ Từ chối</span>;
    }
    return <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">✅ Đã duyệt</span>;
  };

  return (
    <>
      <PageMeta title={`Chi tiết đơn tạm trú - ${don.nhanKhauId?.hoTen}`} />
      <PageBreadcrumb
        pageTitle="Chi tiết đơn tạm trú"
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Đơn Tạm trú', path: '/dashboard/don-tam-tru' },
          { label: 'Chi tiết' }
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg">
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg">
                🏘️
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Chi tiết đơn tạm trú
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Mã đơn: <span className="font-mono">{don._id}</span>
                </p>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* THÔNG TIN NGƯỜI ĐĂNG KÝ */}
          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">👤</span>
              Thông tin người tạm trú
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Họ tên" value={don.nhanKhauId?.hoTen} />
              <InfoRow label="CCCD" value={don.nhanKhauId?.canCuocCongDan} />
              <InfoRow label="Ngày sinh" value={don.nhanKhauId?.ngaySinh ? new Date(don.nhanKhauId.ngaySinh).toLocaleDateString('vi-VN') : 'N/A'} />
              <InfoRow label="Giới tính" value={don.nhanKhauId?.gioiTinh} />
              <InfoRow label="SĐT" value={don.nhanKhauId?.soDienThoai || 'N/A'} />
            </div>
          </div>

          {/* THÔNG TIN TẠM TRÚ */}
          <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">📍</span>
              Thông tin tạm trú
            </h3>
            <div className="space-y-4">
              <InfoRow label="Địa chỉ tạm trú" value={don.diaChiTamTru} fullWidth />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Từ ngày" value={new Date(don.tuNgay).toLocaleDateString('vi-VN')} />
                <InfoRow label="Đến ngày" value={new Date(don.denNgay).toLocaleDateString('vi-VN')} />
              </div>
              <InfoRow label="Lý do" value={don.lyDo} fullWidth />
              {don.ghiChu && <InfoRow label="Ghi chú" value={don.ghiChu} fullWidth />}
            </div>
          </div>

          {/* THÔNG TIN XỬ LÝ */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Thông tin xử lý
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Người gửi đơn" value={don.nguoiTao?.hoTen || 'N/A'} />
              <InfoRow label="Ngày gửi" value={new Date(don.createdAt).toLocaleString('vi-VN')} />
              {don.nguoiXuLy && (
                <>
                  <InfoRow label="Người xử lý" value={don.nguoiXuLy?.hoTen || 'N/A'} />
                  <InfoRow label="Ngày xử lý" value={new Date(don.ngayXuLy).toLocaleString('vi-VN')} />
                </>
              )}
              {don.lyDoTuChoi && (
                <div className="col-span-full p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-400 mb-1">Lý do từ chối:</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{don.lyDoTuChoi}</p>
                </div>
              )}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate('/dashboard/don-tam-tru')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
            >
              ← Quay lại
            </button>

            {canAccess(['admin', 'to_truong']) && don.trangThai === 'cho_xu_ly' && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-6 py-3 border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all font-medium"
                >
                  ❌ Từ chối
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg font-medium"
                >
                  ✅ Duyệt đơn
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Helper Component
function InfoRow({ label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-base font-medium text-gray-900 dark:text-white">
        {value || 'N/A'}
      </p>
    </div>
  );
}