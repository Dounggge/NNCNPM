import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { donXinVaoHoAPI, hoKhauAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function DonXinVaoHoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [don, setDon] = useState(null);
  const [hoKhau, setHoKhau] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonDetail();
  }, [id]);

  const fetchDonDetail = async () => {
    try {
      setLoading(true);
      const response = await donXinVaoHoAPI.getById(id);
      const donData = response.data.data || response.data;
      setDon(donData);

      // Fetch thông tin hộ khẩu
      if (donData.hoKhauId) {
        try {
          const hkResponse = await hoKhauAPI.getById(donData.hoKhauId._id || donData.hoKhauId);
          setHoKhau(hkResponse.data.data || hkResponse.data);
        } catch (error) {
          console.error('Fetch hộ khẩu error:', error);
        }
      }
    } catch (error) {
      console.error('Fetch đơn error:', error);
      alert('❌ Không thể tải thông tin đơn: ' + (error.response?.data?.message || error.message));
      navigate('/dashboard/donxinvaoho');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const badges = {
      cho_duyet: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', text: '⏳ Chờ duyệt' },
      da_duyet: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', text: '✅ Đã duyệt' },
      tu_choi: { bg: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', text: '❌ Đã từ chối' }
    };
    const badge = badges[status] || badges.cho_duyet;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg}`}>
        {badge.text}
      </span>
    );
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

  if (!don) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Không tìm thấy đơn</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`Đơn xin vào hộ #${don._id?.slice(-6)}`} />
      <PageBreadcrumb
        pageTitle="Chi tiết đơn xin vào hộ"
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Đơn xin vào hộ', path: '/dashboard/donxinvaoho' },
          { label: 'Chi tiết' }
        ]}
      />

      <div className="space-y-6">
        {/* HEADER */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                📝 Đơn xin vào hộ
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Mã đơn: #{don._id?.slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(don.trangThai)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* THÔNG TIN NGƯỜI XIN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thông tin cơ bản */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                👤 Thông tin người xin vào hộ
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Họ và tên</label>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {don.thongTinNguoiXin?.hoTen || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">CCCD</label>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {don.thongTinNguoiXin?.canCuocCongDan || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Ngày sinh</label>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {formatDate(don.thongTinNguoiXin?.ngaySinh)}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Giới tính</label>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {don.thongTinNguoiXin?.gioiTinh || 'N/A'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Quê quán</label>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {don.thongTinNguoiXin?.queQuan || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Dân tộc</label>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {don.thongTinNguoiXin?.danToc || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Tôn giáo</label>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {don.thongTinNguoiXin?.tonGiao || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Nghề nghiệp</label>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {don.thongTinNguoiXin?.ngheNghiep || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Nơi làm việc</label>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {don.thongTinNguoiXin?.noiLamViec || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Số điện thoại</label>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {don.thongTinNguoiXin?.soDienThoai || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quan hệ và Lý do */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📋 Thông tin đơn
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Quan hệ với chủ hộ</label>
                  <p className="font-medium text-blue-600 dark:text-blue-400 mt-1 text-lg">
                    {don.quanHeVoiChuHo || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Lý do xin vào hộ</label>
                  <p className="font-medium text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">
                    {don.lyDo || 'N/A'}
                  </p>
                </div>

                {don.trangThai === 'tu_choi' && don.lyDoTuChoi && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <label className="text-sm font-medium text-red-800 dark:text-red-400">
                      ❌ Lý do từ chối
                    </label>
                    <p className="text-red-700 dark:text-red-300 mt-1 whitespace-pre-wrap">
                      {don.lyDoTuChoi}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* Thông tin hộ khẩu */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🏠 Hộ khẩu đăng ký
              </h3>
              
              {hoKhau ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Số hộ khẩu</label>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {hoKhau.soHoKhau}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Chủ hộ</label>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {hoKhau.chuHo?.hoTen || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Địa chỉ</label>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {hoKhau.diaChiThuongTru || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Số thành viên</label>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {hoKhau.thanhVien?.length || 0} người
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/dashboard/hokhau/${hoKhau._id}`)}
                    className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Xem chi tiết hộ khẩu →
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Đang tải thông tin hộ khẩu...</p>
              )}
            </div>

            {/* Thông tin đơn */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ℹ️ Thông tin xử lý
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Ngày nộp đơn</label>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {formatDate(don.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Trạng thái</label>
                  <div className="mt-1">
                    {getStatusBadge(don.trangThai)}
                  </div>
                </div>

                {don.nguoiDuyet && (
                  <>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Người duyệt</label>
                      <p className="font-medium text-gray-900 dark:text-white mt-1">
                        {don.nguoiDuyet?.hoTen || don.nguoiDuyet?.userName || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Ngày duyệt</label>
                      <p className="font-medium text-gray-900 dark:text-white mt-1">
                        {formatDate(don.ngayDuyet)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* BACK BUTTON */}
            <button
              onClick={() => navigate('/dashboard/donxinvaoho')}
              className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              ← Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    </>
  );
}