import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { donXinVaoHoAPI, hoKhauAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function DonXinVaoHoForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hoKhau, setHoKhau] = useState(null);
  const [formData, setFormData] = useState({
    hoKhauId: '',
    thongTinNguoiXin: {
      hoTen: '',
      canCuocCongDan: '',
      ngaySinh: '',
      gioiTinh: 'Nam',
      queQuan: '',
      danToc: 'Kinh',
      tonGiao: 'Không',
      ngheNghiep: '',
      noiLamViec: '',
      soDienThoai: ''
    },
    quanHeVoiChuHo: '',
    lyDo: ''
  });

  useEffect(() => {
    fetchHoKhau();
  }, []);

  const fetchHoKhau = async () => {
    try {
      const response = await hoKhauAPI.getAll();
      // Tìm hộ khẩu mà user là chủ hộ
      const myHoKhau = response.data.data?.find(
        hk => hk.chuHo._id === user.nhanKhauId
      );
      
      if (myHoKhau) {
        setHoKhau(myHoKhau);
        setFormData(prev => ({ ...prev, hoKhauId: myHoKhau._id }));
      }
    } catch (error) {
      console.error('Error fetching ho khau:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('thongTinNguoiXin.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        thongTinNguoiXin: {
          ...prev.thongTinNguoiXin,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hoKhau) {
      alert('⚠️ Bạn chưa là chủ hộ của hộ khẩu nào!');
      return;
    }

    if (!formData.quanHeVoiChuHo) {
      alert('⚠️ Vui lòng chọn quan hệ với chủ hộ');
      return;
    }

    setLoading(true);
    try {
      await donXinVaoHoAPI.create(formData);
      alert('✅ Đã gửi đơn xin vào hộ! Vui lòng chờ tổ trưởng duyệt.');
      navigate('/dashboard/donxinvaoho');
    } catch (error) {
      console.error('Submit error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!hoKhau) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-yellow-600 dark:text-yellow-400 text-lg mb-4">
            ⚠️ Bạn chưa là chủ hộ của hộ khẩu nào
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Đơn xin vào hộ khẩu" />
      <PageBreadcrumb pageTitle="Đơn xin vào hộ khẩu" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          📝 Đơn xin vào hộ khẩu
        </h2>

        {/* Thông tin hộ khẩu */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Hộ khẩu của bạn:
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Số hộ khẩu: <strong>{hoKhau.soHoKhau}</strong>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Địa chỉ: {hoKhau.diaChiThuongTru}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Số thành viên hiện tại: {hoKhau.thanhVien?.length || 0}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin người xin vào hộ */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Thông tin người xin vào hộ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Họ tên */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="thongTinNguoiXin.hoTen"
                  required
                  value={formData.thongTinNguoiXin.hoTen}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              {/* CCCD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Căn cước công dân <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="thongTinNguoiXin.canCuocCongDan"
                  required
                  maxLength="12"
                  pattern="[0-9]{12}"
                  value={formData.thongTinNguoiXin.canCuocCongDan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="001234567890"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Nhập 12 số CCCD
                </p>
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="thongTinNguoiXin.ngaySinh"
                  required
                  value={formData.thongTinNguoiXin.ngaySinh}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              {/* Giới tính */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  name="thongTinNguoiXin.gioiTinh"
                  required
                  value={formData.thongTinNguoiXin.gioiTinh}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              {/* Quê quán */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quê quán <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="thongTinNguoiXin.queQuan"
                  required
                  value={formData.thongTinNguoiXin.queQuan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Xã, huyện, tỉnh"
                />
              </div>

              {/* Dân tộc */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dân tộc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="thongTinNguoiXin.danToc"
                  required
                  value={formData.thongTinNguoiXin.danToc}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Kinh"
                />
              </div>

              {/* Tôn giáo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tôn giáo
                </label>
                <input
                  type="text"
                  name="thongTinNguoiXin.tonGiao"
                  value={formData.thongTinNguoiXin.tonGiao}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Không"
                />
              </div>

              {/* Nghề nghiệp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nghề nghiệp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="thongTinNguoiXin.ngheNghiep"
                  required
                  value={formData.thongTinNguoiXin.ngheNghiep}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Sinh viên, Công nhân..."
                />
              </div>

              {/* Nơi làm việc */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nơi làm việc/Học tập
                </label>
                <input
                  type="text"
                  name="thongTinNguoiXin.noiLamViec"
                  value={formData.thongTinNguoiXin.noiLamViec}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Tên công ty, trường học..."
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="thongTinNguoiXin.soDienThoai"
                  pattern="[0-9]{10}"
                  value={formData.thongTinNguoiXin.soDienThoai}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="0912345678"
                />
              </div>
            </div>
          </div>

          {/* Quan hệ và lý do */}
          <div className="space-y-4">
            {/* Quan hệ với chủ hộ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quan hệ với chủ hộ <span className="text-red-500">*</span>
              </label>
              <select
                name="quanHeVoiChuHo"
                required
                value={formData.quanHeVoiChuHo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="">-- Chọn quan hệ --</option>
                <option value="Vợ">Vợ</option>
                <option value="Chồng">Chồng</option>
                <option value="Con">Con</option>
                <option value="Cha">Cha</option>
                <option value="Mẹ">Mẹ</option>
                <option value="Anh">Anh</option>
                <option value="Chị">Chị</option>
                <option value="Em">Em</option>
                <option value="Ông">Ông</option>
                <option value="Bà">Bà</option>
                <option value="Cháu">Cháu</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Lý do */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lý do xin vào hộ <span className="text-red-500">*</span>
              </label>
              <textarea
                name="lyDo"
                required
                rows="4"
                value={formData.lyDo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="Ví dụ: Chuyển về cùng gia đình, kết hôn, chuyển công tác..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate('/dashboard/donxinvaoho')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang gửi...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Gửi đơn
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}