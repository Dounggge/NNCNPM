import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { phieuThuAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function PhieuThuDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth(); // Lấy thông tin user hiện tại
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [phieuThu, setPhieuThu] = useState(null);
  const [error, setError] = useState(null);

  // State để kiểm tra xem user có phải là chủ hộ của hộ này không
  const [isChuHoOfThisHousehold, setIsChuHoOfThisHousehold] = useState(false);

  useEffect(() => {
    fetchPhieuThuDetail();
  }, [id]);

  const fetchPhieuThuDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await phieuThuAPI.getById(id);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể tải chi tiết phiếu thu');
      }
      
      const data = response.data.data || response.data;
      setPhieuThu(data);
      
      // SAU KHI CÓ DỮ LIỆU PHIẾU THU, KIỂM TRA USER CÓ PHẢI CHỦ HỘ KHÔNG
      if (data && user) {
        checkIfUserIsChuHo(data);
      }
    } catch (error) {
      console.error('Error fetching phieu thu detail:', error);
      setError(`❌ Lỗi tải chi tiết: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Hàm kiểm tra xem user hiện tại có phải là chủ hộ của hộ trong phiếu thu này
  const checkIfUserIsChuHo = (phieuThuData) => {
    if (!phieuThuData || !user) {
      setIsChuHoOfThisHousehold(false);
      return;
    }
    
    // GIẢ ĐỊNH: User object có trường 'hoKhauId' chứa ID hộ khẩu mà user là thành viên/chủ hộ
    // Và 'linkedNhanKhauId' chứa ID nhân khẩu đã liên kết với tài khoản
    const userHoKhauId = user.hoKhauId;
    const userLinkedNhanKhauId = user.linkedNhanKhauId;
    
    // ID hộ khẩu từ phiếu thu (có thể là string hoặc object)
    const phieuThuHoKhauId = phieuThuData.hoKhauId?._id || phieuThuData.hoKhauId;
    
    // ID nhân khẩu của chủ hộ từ dữ liệu phiếu thu (nếu được populate)
    const chuHoNhanKhauId = phieuThuData.hoKhauId?.chuHo?._id;
    
    // Logic kiểm tra phức tạp hơn:
    // 1. User có role là 'chu_ho'
    // 2. VÀ (User thuộc về hộ khẩu này HOẶC User đã liên kết với nhân khẩu là chủ hộ)
    const isChuHoRole = user.role === 'chu_ho' || user.roles?.includes('chu_ho');
    
    let isChuHo = false;
    if (isChuHoRole) {
      if (userHoKhauId && phieuThuHoKhauId) {
        // So sánh ID hộ khẩu
        isChuHo = userHoKhauId.toString() === phieuThuHoKhauId.toString();
      }
      
      // Hoặc kiểm tra qua linkedNhanKhauId nếu có
      if (!isChuHo && userLinkedNhanKhauId && chuHoNhanKhauId) {
        isChuHo = userLinkedNhanKhauId.toString() === chuHoNhanKhauId.toString();
      }
    }
    
    setIsChuHoOfThisHousehold(isChuHo);
  };

  const handleApprovePayment = async () => {
    // Xác định thông báo xác nhận dựa trên vai trò
    const confirmMessage = isChuHoOfThisHousehold 
      ? 'Bạn có chắc chắn muốn thanh toán phiếu thu này?'
      : 'Bạn có chắc chắn muốn xét duyệt thanh toán cho phiếu thu này?';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setApproving(true);
      const response = await phieuThuAPI.markAsPaid(id);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Thao tác thất bại');
      }
      
      alert(`✅ ${isChuHoOfThisHousehold ? 'Thanh toán' : 'Xét duyệt'} thành công!`);
      // Cập nhật lại trạng thái phiếu thu
      fetchPhieuThuDetail();
    } catch (error) {
      alert(`❌ Lỗi ${isChuHoOfThisHousehold ? 'thanh toán' : 'xét duyệt'}: ${error.response?.data?.message || error.message}`);
    } finally {
      setApproving(false);
    }
  };

  // Hàm kiểm tra quyền của nhân viên (admin, tổ trưởng, kế toán)
  const canApprovePaymentAsStaff = () => {
    if (!phieuThu) return false;
    const unpaidStatuses = ['chua_thanh_toan', 'Chưa đóng', 'qua_han'];
    return unpaidStatuses.includes(phieuThu.trangThai) && hasPermission('phieuthu:approve');
  };

  // Hàm kiểm tra quyền của chủ hộ
  const canPayAsHousehold = () => {
    if (!phieuThu) return false;
    const unpaidStatuses = ['chua_thanh_toan', 'Chưa đóng', 'qua_han'];
    const isUnpaid = unpaidStatuses.includes(phieuThu.trangThai);
    
    // Chủ hộ chỉ được thanh toán khi:
    // 1. Phiếu thu chưa thanh toán
    // 2. User có role là chủ hộ
    // 3. User là chủ hộ CỦA CHÍNH HỘ KHẨU NÀY
    return isUnpaid && isChuHoOfThisHousehold;
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return 'N/A';
    }
  };

    const formatDonVi = (donVi) => {
    const donViMap = {
      'VND/thang': 'VNĐ/tháng',
      'VND/m2': 'VNĐ/m²',
      'VND/nguoi': 'VNĐ/người',
      'VND/lan': 'VNĐ/lần',
  };

  return donViMap[donVi] || donVi || 'N/A';
};

  const getStatusBadge = (status) => {
    const badges = {
      'chua_thanh_toan': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500',
      'da_thanh_toan': 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500',
      'qua_han': 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500',
      'Chưa đóng': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500',
      'Đã đóng': 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500'
    };

    const labels = {
      'chua_thanh_toan': '⏳ Chưa thanh toán',
      'da_thanh_toan': '✅ Đã thanh toán',
      'qua_han': '❌ Quá hạn',
      'Chưa đóng': '⏳ Chưa thanh toán',
      'Đã đóng': '✅ Đã thanh toán'
    };

    const statusKey = status || 'chua_thanh_toan';
    const badgeClass = badges[statusKey] || 'bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-500';
    const label = labels[statusKey] || statusKey;

    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${badgeClass}`}>
        {label}
      </span>
    );
  };

  // ========== RENDER ==========
  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Đang tải chi tiết phiếu thu...</p>
      </div>
    );
  }

  if (error || !phieuThu) {
    return (
      <div className="py-16 text-center">
        <div className="mb-4 text-6xl">📄</div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          {error ? 'Có lỗi xảy ra' : 'Không tìm thấy phiếu thu'}
        </h3>
        <p className="mb-4 text-gray-500 dark:text-gray-400">
          {error || 'Phiếu thu không tồn tại hoặc đã bị xóa'}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate('/dashboard/phieuthu')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            ← Quay lại danh sách
          </button>
          <button
            onClick={fetchPhieuThuDetail}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            🔄 Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`Chi tiết Phiếu thu - ${phieuThu.maPhieuThu || phieuThu.soPhieuThu || 'N/A'}`} />
      <PageBreadcrumb 
        pageTitle="Chi tiết Phiếu thu" 
        items={[
          { title: 'Quản lý Phiếu thu', path: '/dashboard/phieuthu' },
          { title: `Phiếu ${phieuThu.maPhieuThu || phieuThu.soPhieuThu || ''}` }
        ]}
      />

      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                📋 Chi tiết Phiếu thu
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Mã phiếu: {phieuThu.maPhieuThu || phieuThu.soPhieuThu || 'N/A'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(phieuThu.trangThai)}
            </div>
          </div>

          {/* Thông tin chung */}
          <div className="mb-8 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
            <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin chung
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Số phiếu thu
                </label>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                  {phieuThu.maPhieuThu || phieuThu.soPhieuThu || 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ngày tạo
                </label>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                  {formatDate(phieuThu.createdAt)}
                </p>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Hạn thanh toán
                </label>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                  {formatDate(phieuThu.hanThanhToan)}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin hộ khẩu */}
          <div className="mb-8 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
            <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin hộ khẩu
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Số hộ khẩu
                </label>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                  {phieuThu.hoKhauId?.soHoKhau || 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Chủ hộ
                </label>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                  {phieuThu.hoKhauId?.chuHo?.hoTen || 'N/A'}
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Địa chỉ thường trú
                </label>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                  {phieuThu.hoKhauId?.diaChiThuongTru || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin khoản thu */}
          <div className="mb-8 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
            <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin khoản thu
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tên khoản thu
                </label>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                  {phieuThu.khoanThuId?.tenKhoanThu || 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Đơn vị tính
                </label>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                  {formatDonVi(phieuThu.donVi)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Đơn giá
                </label>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(phieuThu.khoanThuId?.donGia)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Số tiền phải thu
                </label>
                <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(phieuThu.tongTien || phieuThu.soTien)}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin thanh toán */}
          <div className="mb-8 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
            <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin thanh toán
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ngày thanh toán
                </label>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                  {phieuThu.ngayDong ? formatDate(phieuThu.ngayDong) : 'Chưa thanh toán'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cập nhật lần cuối
                </label>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                  {formatDate(phieuThu.updatedAt)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Trạng thái
                </label>
                <div className="mt-1">
                  {getStatusBadge(phieuThu.trangThai)}
                </div>
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          {phieuThu.ghiChu && (
            <div className="mb-8 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Ghi chú
              </h4>
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {phieuThu.ghiChu}
                </p>
              </div>
            </div>
          )}

          {/* ========== PHẦN NÚT HÀNH ĐỘNG QUAN TRỌNG ========== */}
          <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard/phieuthu')}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                ← Quay lại danh sách
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* NÚT CHO CHỦ HỘ (màu xanh dương) */}
              {canPayAsHousehold() && (
                <button
                  type="button"
                  onClick={handleApprovePayment}
                  disabled={approving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {approving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <span>💳</span>
                      Thanh toán ngay
                    </>
                  )}
                </button>
              )}

              {/* NÚT CHO NHÂN VIÊN (màu xanh lá) - chỉ hiện khi KHÔNG phải chủ hộ */}
              {!isChuHoOfThisHousehold && canApprovePaymentAsStaff() && (
                <button
                  type="button"
                  onClick={handleApprovePayment}
                  disabled={approving}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {approving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      Xét duyệt thanh toán
                    </>
                  )}
                </button>
              )}

              {/* THÔNG BÁO ĐÃ THANH TOÁN */}
              {(phieuThu.trangThai === 'da_thanh_toan' || phieuThu.trangThai === 'Đã đóng') && (
                <div className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-green-700 dark:bg-green-500/10 dark:text-green-500">
                  <span>✓</span>
                  <span className="font-medium">Đã thanh toán</span>
                  <span className="text-xs">
                    ({formatDate(phieuThu.ngayDong)})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}