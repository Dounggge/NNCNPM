import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { authAPI, nhanKhauAPI, hoKhauAPI, phieuThuAPI } from "../../services/api";

export default function Home() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [nhanKhauInfo, setNhanKhauInfo] = useState(null);
  const [hoKhauInfo, setHoKhauInfo] = useState(null);
  const [phieuThuStatus, setPhieuThuStatus] = useState({
    total: 0,
    paid: 0,
    unpaid: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState({
    subject: '',
    content: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Lấy thông tin user hiện tại
      const userRes = await authAPI.getMe();
      setUserInfo(userRes.data);
      
      // Nếu user có liên kết với nhân khẩu
      if (userRes.data.nhanKhauId) {
        const nhanKhauId = userRes.data.nhanKhauId._id || userRes.data.nhanKhauId;
        
        const nhanKhauRes = await nhanKhauAPI.getById(nhanKhauId);
        setNhanKhauInfo(nhanKhauRes.data);
        
        // Tìm hộ khẩu chứa nhân khẩu này
        const hoKhauRes = await hoKhauAPI.getAll();
        const allHoKhaus = hoKhauRes.data.hoKhaus || hoKhauRes.data.data || [];
        
        // Tìm hộ khẩu có chứa nhân khẩu này trong danh sách thành viên
        const userHoKhau = allHoKhaus.find(hk => 
          hk.thanhVien && hk.thanhVien.some(tv => 
            (tv._id === nhanKhauId || tv.nhanKhauId === nhanKhauId)
          )
        );
        
        if (userHoKhau) {
          setHoKhauInfo(userHoKhau);
          
          // Lấy trạng thái phiếu thu của hộ khẩu
          const phieuThuRes = await phieuThuAPI.getAll({
            hoKhauId: userHoKhau._id
          });
          
          const phieuThus = phieuThuRes.data.data || [];
          setPhieuThuStatus({
            total: phieuThus.length,
            paid: phieuThus.filter(p => p.trangThai === 'da_dong').length,
            unpaid: phieuThus.filter(p => p.trangThai === 'chua_dong').length
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải dữ liệu');
      console.error('User data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      // TODO: Tạo API endpoint để gửi feedback
      alert('Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ xem xét và phản hồi sớm nhất.');
      setFeedback({ subject: '', content: '' });
      setShowFeedbackForm(false);
    } catch (err) {
      alert('Lỗi gửi phản hồi: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
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
            onClick={fetchUserData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Thông tin cá nhân | Hệ thống Quản lý Khu Dân Cư"
        description="Thông tin nhân khẩu cá nhân"
      />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          👤 Thông Tin Cá Nhân
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Xem và quản lý thông tin cá nhân của bạn
        </p>
      </div>

      <div className="space-y-6">
        {/* Thông tin nhân khẩu */}
        {nhanKhauInfo ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              👨‍👩‍👧‍👦 Thông tin nhân khẩu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Họ và tên</label>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {nhanKhauInfo.hoTen}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Ngày sinh</label>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {formatDate(nhanKhauInfo.ngaySinh)}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Giới tính</label>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {nhanKhauInfo.gioiTinh === 'nam' ? 'Nam' : 'Nữ'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">CCCD/CMND</label>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {nhanKhauInfo.canCuocCongDan}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Số điện thoại</label>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {nhanKhauInfo.soDienThoai || 'Chưa cập nhật'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Dân tộc</label>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {nhanKhauInfo.danToc || 'Kinh'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Tôn giáo</label>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {nhanKhauInfo.tonGiao || 'Không'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Nghề nghiệp</label>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {nhanKhauInfo.ngheNghiep || 'Chưa cập nhật'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Trình độ học vấn</label>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {nhanKhauInfo.trinhDoHocVan || 'Chưa cập nhật'}
                </p>
              </div>
              <div className="md:col-span-3">
                <label className="text-sm text-gray-500 dark:text-gray-400">Quê quán</label>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {nhanKhauInfo.queQuan || 'Chưa cập nhật'}
                </p>
              </div>
              <div className="md:col-span-3">
                <label className="text-sm text-gray-500 dark:text-gray-400">Nơi thường trú</label>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {nhanKhauInfo.noiThuongTru || 'Chưa cập nhật'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-yellow-800 dark:text-yellow-400">
              ⚠️ Tài khoản chưa được liên kết với nhân khẩu. Vui lòng liên hệ quản trị viên.
            </p>
          </div>
        )}

        {/* Trạng thái đóng phí */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💰 Trạng thái đóng phí
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng phiếu thu</p>
              <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                {phieuThuStatus.total}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <p className="text-sm text-gray-600 dark:text-gray-400">Đã thanh toán</p>
              <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                {phieuThuStatus.paid}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <p className="text-sm text-gray-600 dark:text-gray-400">Chưa thanh toán</p>
              <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                {phieuThuStatus.unpaid}
              </p>
            </div>
          </div>
        </div>

        {/* Các nút chức năng */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Xem thông tin hộ khẩu */}
          <button
            onClick={() => hoKhauInfo ? navigate(`/dashboard/hokhau/${hoKhauInfo._id}`) : alert('Bạn chưa thuộc hộ khẩu nào')}
            className="p-6 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 hover:shadow-lg transition-shadow text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Xem hộ khẩu
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Xem chi tiết thông tin hộ khẩu và các thành viên
            </p>
          </button>

          {/* Xem trạng thái phí */}
          <button
            onClick={() => navigate('/dashboard/phieuthu')}
            className="p-6 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 hover:shadow-lg transition-shadow text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <svg className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Xem phiếu thu
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kiểm tra trạng thái các khoản phí cần đóng
            </p>
          </button>

          {/* Gửi phản hồi */}
          <button
            onClick={() => setShowFeedbackForm(true)}
            className="p-6 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 hover:shadow-lg transition-shadow text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <svg className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Gửi phản hồi
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Đóng góp ý kiến, phản ánh vấn đề với ban quản lý
            </p>
          </button>
        </div>
      </div>

      {/* Modal gửi phản hồi */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                💬 Gửi phản hồi
              </h3>
              <button
                onClick={() => setShowFeedbackForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={feedback.subject}
                  onChange={(e) => setFeedback({ ...feedback, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Nhập tiêu đề phản hồi"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows="6"
                  value={feedback.content}
                  onChange={(e) => setFeedback({ ...feedback, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Nhập nội dung phản hồi, ý kiến đóng góp..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Gửi phản hồi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}