import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, hoKhauAPI, nhanKhauAPI, phieuThuAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';

export default function Home() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
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

  useEffect(() => {
    fetchUserData();
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');

      const userResponse = await authAPI.getMe();
      const userData = userResponse.data.data || userResponse.data;
      setUserInfo(userData);

      if (userData.nhanKhauId) {
        const nhanKhauId = userData.nhanKhauId._id || userData.nhanKhauId;
        
        try {
          const nhanKhauResponse = await nhanKhauAPI.getById(nhanKhauId);
          const nhanKhauData = nhanKhauResponse.data.data || nhanKhauResponse.data;
          setNhanKhauInfo(nhanKhauData);

          if (nhanKhauData.hoKhauId) {
            const hoKhauId = nhanKhauData.hoKhauId._id || nhanKhauData.hoKhauId;
            
            try {
              const hoKhauResponse = await hoKhauAPI.getById(hoKhauId);
              const hoKhauData = hoKhauResponse.data.data || hoKhauResponse.data;
              setHoKhauInfo(hoKhauData);
            } catch (hoKhauError) {
              console.error('⚠️ Get HoKhau error:', hoKhauError);
            }
          }
        } catch (nhanKhauError) {
          console.error('⚠️ Get NhanKhau error:', nhanKhauError);
        }
      }

      if (userData.nhanKhauId) {
        try {
          const phieuThuResponse = await phieuThuAPI.getAll();
          const phieuThus = phieuThuResponse.data.data || [];
          
          setPhieuThuStatus({
            total: phieuThus.length,
            paid: phieuThus.filter(pt => pt.trangThai === 'da_dong').length,
            unpaid: phieuThus.filter(pt => pt.trangThai === 'chua_dong').length
          });
        } catch (phieuThuError) {
          console.error('⚠️ Get PhieuThu error:', phieuThuError);
        }
      }
    } catch (error) {
      console.error('❌ Fetch user data error:', error);
      setError(error.response?.data?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Quản trị viên',
      to_truong: 'Tổ trưởng',
      ke_toan: 'Kế toán',
      chu_ho: 'Chủ hộ',
      dan_cu: 'Dân cư'
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'from-red-500 to-pink-600',
      to_truong: 'from-blue-500 to-cyan-600',
      ke_toan: 'from-green-500 to-emerald-600',
      chu_ho: 'from-purple-500 to-violet-600',
      dan_cu: 'from-orange-500 to-amber-600'
    };
    return colors[role] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <p className="text-red-600 dark:text-red-400 text-lg mb-4 font-semibold">{error}</p>
          <button
            onClick={fetchUserData}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium"
          >
            🔄 Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Trang chủ | Dashboard" />

      <div className="space-y-6">
        {/* ← WELCOME BANNER - GRADIENT ĐỘNG */}
        <div className={`rounded-2xl bg-gradient-to-r ${getRoleColor(userInfo?.vaiTro)} p-8 text-white shadow-2xl relative overflow-hidden`}>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
                  <span className="animate-wave">👋</span> 
                  Xin chào, {userInfo?.hoTen || userInfo?.userName}!
                </h1>
                <div className="flex items-center gap-4 text-white/90">
                  <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {getRoleLabel(userInfo?.vaiTro)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ← ALERT: CHƯA CÓ PROFILE */}
        {!nhanKhauInfo && (
          <div className="rounded-2xl border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="text-5xl animate-bounce">⚠️</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-500 mb-2">
                  Bạn chưa khai báo thông tin cá nhân
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-4">
                  Để sử dụng đầy đủ các chức năng của hệ thống, vui lòng hoàn thành khai báo thông tin cá nhân ngay.
                </p>
                <button
                  onClick={() => navigate('/dashboard/profile-setup')}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Khai báo ngay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ← GRID: THÔNG TIN CÁ NHÂN & HỘ KHẨU */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* THÔNG TIN CÁ NHÂN */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  Thông tin cá nhân
                </h2>
                
                {nhanKhauInfo && (
                  <Link
                    to={`/dashboard/nhankhau/${nhanKhauInfo._id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1"
                  >
                    Chỉnh sửa
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>

            <div className="p-6">
              {nhanKhauInfo ? (
                <div className="space-y-4">
                  <InfoRow label="Họ và tên" value={nhanKhauInfo.hoTen} icon="👤" />
                  <InfoRow label="CCCD" value={nhanKhauInfo.canCuocCongDan} icon="🪪" />
                  <InfoRow label="Ngày sinh" value={formatDate(nhanKhauInfo.ngaySinh)} icon="🎂" />
                  <InfoRow label="Giới tính" value={nhanKhauInfo.gioiTinh} icon={nhanKhauInfo.gioiTinh === 'Nam' ? '👨' : '👩'} />
                  <InfoRow label="Dân tộc" value={nhanKhauInfo.danToc || 'N/A'} icon="🌏" />
                  <InfoRow label="Nghề nghiệp" value={nhanKhauInfo.ngheNghiep || 'N/A'} icon="💼" />
                  <InfoRow label="SĐT" value={nhanKhauInfo.soDienThoai || 'Chưa cập nhật'} icon="📱" />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-50">📋</div>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Chưa có thông tin cá nhân</p>
                  <button
                    onClick={() => navigate('/dashboard/profile-setup')}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-2 mx-auto"
                  >
                    Khai báo ngay
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* THÔNG TIN HỘ KHẨU */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  Hộ khẩu
                </h2>

                {hoKhauInfo && (
                  <Link
                    to={`/dashboard/hokhau/${hoKhauInfo._id}`}
                    className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 font-medium flex items-center gap-1"
                  >
                    Xem chi tiết
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>

            <div className="p-6">
              {hoKhauInfo ? (
                <div className="space-y-4">
                  <InfoRow label="Số hộ khẩu" value={hoKhauInfo.soHoKhau} icon="🔢" highlight />
                  <InfoRow label="Chủ hộ" value={hoKhauInfo.chuHo?.hoTen || 'N/A'} icon="👤" />
                  <InfoRow label="Địa chỉ thường trú" value={hoKhauInfo.diaChiThuongTru} icon="📍" />
                  <InfoRow label="Số thành viên" value={`${hoKhauInfo.thanhVien?.length || 0} người`} icon="👥" />
                  <InfoRow 
                    label="Quan hệ với chủ hộ" 
                    value={nhanKhauInfo?.quanHeVoiChuHo || 'N/A'} 
                    icon="👨‍👩‍👧‍👦"
                  />
                  <InfoRow 
                    label="Trạng thái" 
                    icon="📊"
                    value={
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        hoKhauInfo.trangThai === 'active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : hoKhauInfo.trangThai === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          hoKhauInfo.trangThai === 'active' ? 'bg-green-500 animate-pulse' : 
                          hoKhauInfo.trangThai === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'
                        }`}></span>
                        {hoKhauInfo.trangThai === 'active' ? 'Hoạt động' : 
                         hoKhauInfo.trangThai === 'pending' ? 'Chờ duyệt' : 'Không hoạt động'}
                      </span>
                    } 
                  />
                </div>
              ) : nhanKhauInfo ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-50">🏠</div>
                  <p className="text-gray-500 dark:text-gray-400 mb-4 font-medium">Chưa thuộc hộ khẩu nào</p>
                  <button
                    onClick={() => navigate('/dashboard/hokhau/create')}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg font-medium flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Đăng ký hộ khẩu mới
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-50">🔒</div>
                  <p className="text-gray-500 dark:text-gray-400">Vui lòng khai báo thông tin cá nhân trước</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ← QUICK ACTIONS - CHỈ HIỆN KHI ĐÃ CÓ PROFILE */}
        {nhanKhauInfo && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">🚀</span> 
              Thao tác nhanh
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* ← NÚT 1: XEM HỘ KHẨU (CHỈ HIỆN KHI ĐÃ CÓ HỘ KHẨU) */}
              {hoKhauInfo && (
                <ActionCard
                  icon="🏠"
                  title="Xem hộ khẩu"
                  description="Chi tiết hộ khẩu và thành viên"
                  onClick={() => navigate(`/dashboard/hokhau/${hoKhauInfo._id}`)}
                  color="from-blue-500 to-cyan-500"
                />
              )}

              {/* ← NÚT 2: XEM PHIẾU THU */}
              <ActionCard
                icon="💰"
                title="Xem phiếu thu"
                description={`Khoản phí cần đóng${phieuThuStatus.unpaid > 0 ? ` (${phieuThuStatus.unpaid})` : ''}`}
                onClick={() => navigate('/dashboard/phieuthu')}
                badge={phieuThuStatus.unpaid > 0 ? phieuThuStatus.unpaid : null}
                color="from-green-500 to-emerald-500"
              />

              {/* ← NÚT 3: GỬI PHẢN HỒI */}
              <ActionCard
                icon="💬"
                title="Gửi phản hồi"
                description="Đóng góp ý kiến với ban quản lý"
                onClick={() => alert('Tính năng đang phát triển')}
                color="from-purple-500 to-pink-500"
              />

              {/* ← NÚT 4 & 5: ĐĂNG KÝ HỘ KHẨU HOẶC TẠO ĐƠN XIN VÀO HỘ (CHỈ HIỆN KHI CHƯA CÓ HỘ KHẨU) */}
              {!hoKhauInfo && (
                <>
                  <ActionCard
                    icon="📝"
                    title="Đăng ký hộ khẩu mới"
                    description="Tạo hộ khẩu mới và làm chủ hộ"
                    onClick={() => navigate('/dashboard/hokhau/create')}
                    color="from-orange-500 to-red-500"
                  />

                  <ActionCard
                    icon="📄"
                    title="Tạo đơn xin vào hộ"
                    description="Xin vào hộ khẩu đã có sẵn"
                    onClick={() => navigate('/dashboard/donxinvaoho/create')}
                    color="from-indigo-500 to-purple-500"
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* ← THÔNG BÁO */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            Thông báo & Tin tức
          </h2>

          <div className="space-y-4">
            <NotificationItem
              icon="🎉"
              title="Chào mừng bạn đến với hệ thống quản lý dân cư"
              time="Hôm nay"
              description="Cảm ơn bạn đã tham gia sử dụng hệ thống. Vui lòng hoàn thành khai báo thông tin để sử dụng đầy đủ các tính năng."
              color="from-blue-500 to-cyan-500"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }
        .animate-wave {
          display: inline-block;
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

// ============ HELPER COMPONENTS ============

function InfoRow({ label, value, icon, highlight = false }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <span className={`text-sm font-semibold text-right ${
        highlight 
          ? 'text-blue-600 dark:text-blue-400' 
          : 'text-gray-900 dark:text-white'
      }`}>
        {value}
      </span>
    </div>
  );
}

function ActionCard({ icon, title, description, onClick, badge, color }) {
  return (
    <button
      onClick={onClick}
      className="relative p-6 border border-gray-200 dark:border-gray-800 rounded-xl hover:scale-105 transition-all duration-300 text-left group bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-md hover:shadow-xl"
    >
      {badge && (
        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg animate-pulse">
          {badge}
        </span>
      )}
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center text-3xl mb-4 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </button>
  );
}

function NotificationItem({ icon, title, time, description, color }) {
  return (
    <div className={`p-5 bg-gradient-to-r ${color} bg-opacity-10 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-4">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-bold text-gray-900 dark:text-white">{title}</h4>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">{time}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}