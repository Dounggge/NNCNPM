import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tamTruAPI } from '../../services/api';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function TamTruDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [don, setDon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDon();
  }, [id]);

  const fetchDon = async () => {
    try {
      setLoading(true);
      const response = await tamTruAPI.getById(id);
      setDon(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching đơn:', error);
      alert('❌ Lỗi tải đơn: ' + (error.response?.data?.message || error.message));
      navigate('/dashboard/tamtru');
    } finally {
      setLoading(false);
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

  return (
    <>
      <PageMeta title={`Chi tiết tạm trú - ${don.nhanKhauId?.hoTen}`} />
      <PageBreadcrumb
        pageTitle="Chi tiết đơn tạm trú"
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Tạm trú', path: '/dashboard/tamtru' },
          { label: 'Chi tiết' }
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg">
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Chi tiết đơn tạm trú
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Mã đơn: <span className="font-mono">{don._id}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* THÔNG TIN NGƯỜI ĐĂNG KÝ */}
          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-4 flex items-center gap-2">
              Thông tin người đăng ký
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

          {/* THÔNG TIN KHÁC */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300 mb-4 flex items-center gap-2">
              Thông tin khác
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Ngày gửi đơn" value={new Date(don.createdAt).toLocaleString('vi-VN')} />
              <InfoRow 
                label="Trạng thái" 
                value={
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Chờ xử lý
                  </span>
                } 
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate('/dashboard/tamtru')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
            >
              ← Quay lại
            </button>
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