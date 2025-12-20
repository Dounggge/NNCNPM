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
      
      const userRes = await authAPI.getMe();
      const userData = userRes.data.data || userRes.data;
      setUserInfo(userData);
      
      if (userData.nhanKhauId) {
        const nhanKhauId = userData.nhanKhauId._id || userData.nhanKhauId;
        
        const nhanKhauRes = await nhanKhauAPI.getById(nhanKhauId);
        setNhanKhauInfo(nhanKhauRes.data);
        
        const hoKhauRes = await hoKhauAPI.getAll();
        const allHoKhaus = hoKhauRes.data.hoKhaus || hoKhauRes.data.data || [];
        
        const userHoKhau = allHoKhaus.find(hk => 
          hk.thanhVien && hk.thanhVien.some(tv => 
            (tv._id === nhanKhauId || tv.nhanKhauId === nhanKhauId)
          )
        );
        
        if (userHoKhau) {
          setHoKhauInfo(userHoKhau);
          
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

  const getRoleLabel = (role) => {
    const roles = {
      'admin': { label: 'Quản trị viên', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      'to_truong': { label: 'Tổ trưởng', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
      'chu_ho': { label: 'Chủ hộ', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      'dan_cu': { label: 'Dân cư', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
    };
    return roles[role] || { label: role, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' };
  };

  const getRelationshipLabel = (relation) => {
    const relations = {
      'Chủ hộ': { label: 'Chủ hộ', icon: '👨‍💼' },
      'Vợ/Chồng': { label: 'Vợ/Chồng', icon: '💑' },
      'Con': { label: 'Con', icon: '👶' },
      'Bố/Mẹ': { label: 'Bố/Mẹ', icon: '👴👵' },
      'Anh/Chị/Em': { label: 'Anh/Chị/Em', icon: '👫' },
      'Ông/Bà': { label: 'Ông/Bà', icon: '👴👵' },
      'Khác': { label: 'Khác', icon: '👤' }
    };
    return relations[relation] || { label: relation || 'Chưa xác định', icon: '❓' };
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
            type="button" 
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
        description="Thông tin cá nhân"
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
        {/* KIỂM TRA: Nếu chưa có nhanKhauId → Hiển thị thông báo khai báo */}
        {!userInfo?.nhanKhauId ? (
          <div className="rounded-xl border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                    ⚠️ Chưa khai báo thông tin cá nhân
                  </h3>
                  <p className="text-yellow-800 dark:text-yellow-300 text-sm mb-2">
                    Tài khoản chưa được liên kết với thông tin nhân khẩu. Vui lòng khai báo để sử dụng đầy đủ chức năng hệ thống.
                  </p>
                  <div className="flex items-start gap-2 text-xs text-yellow-700 dark:text-yellow-400">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>
                      <strong>Yêu cầu bắt buộc:</strong> Họ tên, Ngày sinh, Giới tính, Quê quán, Dân tộc, Nghề nghiệp
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Navigating to profile setup');
                  navigate('/dashboard/profile-setup')}}
                className="flex-shrink-0 w-full md:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Khai báo ngay
              </button>
            </div>
          </div>
        ) : (
          // ← ĐÃ CÓ THÔNG TIN → HIỂN THỊ ĐẦY ĐỦ
          <>
            {/* Thông tin tài khoản */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Thông tin tài khoản
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Tên đăng nhập</label>
                  <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                    {userInfo.userName || userInfo.username}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Vai trò</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getRoleLabel(userInfo.vaiTro).color}`}>
                      {getRoleLabel(userInfo.vaiTro).label}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      userInfo.trangThai === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${userInfo.trangThai === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {userInfo.trangThai === 'active' ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin cá nhân */}
            {nhanKhauInfo && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    Thông tin cá nhân
                  </h2>
                  {nhanKhauInfo.quanHeVoiChuHo && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                      {getRelationshipLabel(nhanKhauInfo.quanHeVoiChuHo).icon} {getRelationshipLabel(nhanKhauInfo.quanHeVoiChuHo).label}
                    </span>
                  )}
                </div>
                
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
                      {nhanKhauInfo.gioiTinh === 'Nam' ? '👨 Nam' : nhanKhauInfo.gioiTinh === 'Nu' ? '👩 Nữ' : '⚧ Khác'}
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
                    <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
                    <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                      {nhanKhauInfo.email || userInfo.email || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Dân tộc</label>
                    <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                      {nhanKhauInfo.danToc}
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
                      {nhanKhauInfo.ngheNghiep}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Nơi làm việc</label>
                    <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                      {nhanKhauInfo.noiLamViec || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Trình độ học vấn</label>
                    <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                      {nhanKhauInfo.trinhDoHocVan || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Quốc t적</label>
                    <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                      {nhanKhauInfo.quocTich || 'Việt Nam'}
                    </p>
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-sm text-gray-500 dark:text-gray-400">Quê quán</label>
                    <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                      {nhanKhauInfo.queQuan}
                    </p>
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-sm text-gray-500 dark:text-gray-400">Nơi sinh</label>
                    <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                      {nhanKhauInfo.noiSinh || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Các nút chức năng */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
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

              <button
                type="button"
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

              <button
                type="button"
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
          </>
        )}
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

      {/* ← THÊM NÚT ĐƠN XIN VÀO HỘ (CHỈ HIỂN THỊ NẾU LÀ CHỦ HỘ) */}
      {userInfo?.vaiTro === 'chu_ho' && (
        <button
          type="button"
          onClick={() => navigate('/dashboard/donxinvaoho')}
          className="p-6 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 hover:shadow-lg transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
              <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <svg className="h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Đơn xin vào hộ
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tạo đơn xin thêm thành viên vào hộ khẩu
          </p>
        </button>
      )}
    </>
  );
}