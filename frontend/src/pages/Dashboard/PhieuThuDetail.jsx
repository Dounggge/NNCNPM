import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { phieuThuAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function PhieuThuDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [phieuThu, setPhieuThu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmPayment, setConfirmPayment] = useState(false);
  const [copiedField, setCopiedField] = useState(''); // ← TRACK FIELD ĐÃ COPY

  useEffect(() => {
    fetchPhieuThu();
  }, [id]);

  const fetchPhieuThu = async () => {
    try {
      setLoading(true);
      const response = await phieuThuAPI.getById(id);
      setPhieuThu(response.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.response?.data?.message || 'Không thể tải thông tin phiếu thu');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      setLoading(true);
      await phieuThuAPI.markAsPaid(id);
      alert('✅ Đã xác nhận thanh toán!');
      fetchPhieuThu();
      setConfirmPayment(false);
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // ← HÀM COPY TO CLIPBOARD
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000); // Reset sau 2s
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'da_thanh_toan':
      case 'da_dong':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'chua_thanh_toan':
      case 'chua_dong':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'qua_han':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status) => {
    const map = {
      'chua_thanh_toan': 'Chưa thanh toán',
      'da_thanh_toan': 'Đã thanh toán',
      'qua_han': 'Quá hạn',
      'chua_dong': 'Chưa đóng',
      'da_dong': 'Đã đóng'
    };
    return map[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
          <div className="text-5xl mb-4">❌</div>
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard/phieuthu')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  if (!phieuThu) return null;

  const canMarkAsPaid = hasPermission('phieuthu:approve') && 
                       ['chua_thanh_toan', 'chua_dong', 'qua_han'].includes(phieuThu.trangThai);

  return (
    <>
      <PageMeta title={`Phiếu thu ${phieuThu.maPhieuThu || phieuThu.soPhieuThu} | Chi tiết`} />
      <PageBreadcrumb
        pageTitle="Chi tiết Phiếu thu"
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Phiếu thu', path: '/dashboard/phieuthu' },
          { label: phieuThu.maPhieuThu || phieuThu.soPhieuThu }
        ]}
      />

      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              💰 Phiếu thu: {phieuThu.maPhieuThu || phieuThu.soPhieuThu}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Hộ khẩu: {phieuThu.hoKhauId?.soHoKhau} - {phieuThu.hoKhauId?.chuHo?.hoTen}
            </p>
          </div>

          <div className="flex gap-3">
            {canMarkAsPaid && (
              <button
                onClick={() => setConfirmPayment(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Xác nhận thanh toán
              </button>
            )}

            <button
              onClick={() => navigate('/dashboard/phieuthu')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Quay lại
            </button>
          </div>
        </div>

        {/* THÔNG TIN PHIẾU THU */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            📋 Thông tin phiếu thu
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoRow label="Số phiếu thu" value={phieuThu.maPhieuThu || phieuThu.soPhieuThu} />
            <InfoRow label="Hộ khẩu" value={phieuThu.hoKhauId?.soHoKhau} />
            <InfoRow label="Chủ hộ" value={phieuThu.hoKhauId?.chuHo?.hoTen} />
            <InfoRow label="Khoản thu" value={phieuThu.khoanThuId?.tenKhoanThu} />
            
            <InfoRow 
              label="Số tiền" 
              value={
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {(phieuThu.soTien || phieuThu.tongTien || 0).toLocaleString('vi-VN')} đ
                </span>
              }
            />

            <InfoRow 
              label="Trạng thái" 
              value={
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(phieuThu.trangThai)}`}>
                  {getStatusText(phieuThu.trangThai)}
                </span>
              }
            />

            {phieuThu.thang && phieuThu.nam && (
              <InfoRow label="Tháng/Năm" value={`${phieuThu.thang}/${phieuThu.nam}`} />
            )}

            {phieuThu.hanThanhToan && (
              <InfoRow 
                label="Hạn thanh toán" 
                value={new Date(phieuThu.hanThanhToan).toLocaleDateString('vi-VN')}
              />
            )}

            {phieuThu.ngayDong && (
              <InfoRow 
                label="Ngày đóng" 
                value={new Date(phieuThu.ngayDong).toLocaleDateString('vi-VN')}
              />
            )}

            {phieuThu.nguoiThuTien && (
              <InfoRow label="Người thu tiền" value={phieuThu.nguoiThuTien.hoTen} />
            )}

            {phieuThu.ghiChu && (
              <div className="md:col-span-2">
                <InfoRow label="Ghi chú" value={phieuThu.ghiChu} />
              </div>
            )}
          </div>
        </div>

        {/* ⭐ THÔNG TIN CHUYỂN KHOẢN - CHỈ HIỆN KHI CHƯA THANH TOÁN */}
        {['chua_thanh_toan', 'chua_dong', 'qua_han'].includes(phieuThu.trangThai) && (
          <div className="rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  💳 Thông tin chuyển khoản
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vui lòng chuyển khoản theo thông tin dưới đây để thanh toán phiếu thu
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SỐ TÀI KHOẢN */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Số tài khoản
                  </label>
                  <button
                    onClick={() => copyToClipboard('3953808888', 'soTK')}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                  >
                    {copiedField === 'soTK' ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Đã copy!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                  3953 808 888
                </p>
              </div>

              {/* NGÂN HÀNG */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-800">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                  Ngân hàng
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    B
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      BIDV
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Ngân hàng TMCP Đầu tư và Phát triển Việt Nam
                    </p>
                  </div>
                </div>
              </div>

              {/* CHỦ TÀI KHOẢN */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-800">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                  Chủ tài khoản
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  BAN QUẢN LÝ DÂN CƯ
                </p>
              </div>

              {/* SỐ TIỀN */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Số tiền
                  </label>
                  <button
                    onClick={() => copyToClipboard((phieuThu.soTien || phieuThu.tongTien).toString(), 'soTien')}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                  >
                    {copiedField === 'soTien' ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Đã copy!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {(phieuThu.soTien || phieuThu.tongTien || 0).toLocaleString('vi-VN')} đ
                </p>
              </div>

              {/* NỘI DUNG CHUYỂN KHOẢN */}
              <div className="md:col-span-2 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-2 border-yellow-300 dark:border-yellow-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Nội dung chuyển khoản (Bắt buộc)
                  </label>
                  <button
                    onClick={() => copyToClipboard(phieuThu.maPhieuThu || phieuThu.soPhieuThu, 'noiDung')}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-1 rounded-full"
                  >
                    {copiedField === 'noiDung' ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Đã copy!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono bg-white dark:bg-gray-800 p-4 rounded-lg">
                  {phieuThu.maPhieuThu || phieuThu.soPhieuThu}
                </p>
                <p className="mt-3 text-sm text-yellow-800 dark:text-yellow-400 flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>Lưu ý:</strong> Vui lòng nhập <strong>CHÍNH XÁC</strong> nội dung này khi chuyển khoản để hệ thống có thể xác nhận thanh toán tự động.
                  </span>
                </p>
              </div>
            </div>

            {/* HƯỚNG DẪN */}
            <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-800">
              <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Hướng dẫn thanh toán:
              </h3>
              <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-400 ml-7 list-decimal">
                <li>Mở ứng dụng ngân hàng của bạn</li>
                <li>Chọn chức năng <strong>Chuyển khoản</strong></li>
                <li>Nhập số tài khoản: <strong className="font-mono">3953808888</strong> (BIDV)</li>
                <li>Nhập số tiền: <strong>{(phieuThu.soTien || phieuThu.tongTien || 0).toLocaleString('vi-VN')} đ</strong></li>
                <li>Nhập nội dung: <strong className="font-mono">{phieuThu.maPhieuThu || phieuThu.soPhieuThu}</strong></li>
                <li>Xác nhận và hoàn tất giao dịch</li>
                <li>Chụp màn hình biên lai và gửi cho ban quản lý (nếu cần)</li>
              </ol>
            </div>
          </div>
        )}

        {/* METADATA */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Ngày tạo:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {new Date(phieuThu.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Cập nhật lần cuối:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {new Date(phieuThu.updatedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL XÁC NHẬN THANH TOÁN */}
      {confirmPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Xác nhận thanh toán
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bạn có chắc chắn muốn đánh dấu phiếu thu này đã thanh toán không?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleMarkAsPaid}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
              <button
                onClick={() => setConfirmPayment(false)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      <div className="text-base font-semibold text-gray-900 dark:text-white">
        {value || 'N/A'}
      </div>
    </div>
  );
}