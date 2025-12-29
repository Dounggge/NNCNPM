import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { donXinVaoHoAPI, hoKhauAPI, nhanKhauAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function DonXinVaoHoForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hoKhauList, setHoKhauList] = useState([]);
  const [nhanKhauInfo, setNhanKhauInfo] = useState(null);
  const [formData, setFormData] = useState({
    hoKhauId: '',
    nguoiXin: '',
    canCuocCongDan: '',
    ngaySinh: '',
    gioiTinh: 'Nam',
    queQuan: '',        // ← THÊM
    danToc: 'Kinh',
    tonGiao: '',        // ← THÊM
    ngheNghiep: '',
    noiLamViec: '',     // ← THÊM
    soDienThoai: '',    // ← THÊM
    quanHeVoiChuHo: '',
    lyDo: ''
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // ← LẤY THÔNG TIN NHÂN KHẨU CỦA USER
      if (user?.nhanKhauId) {
        try {
          const nhanKhauId = user.nhanKhauId._id || user.nhanKhauId;
          console.log('📝 Fetching nhanKhau:', nhanKhauId);
          
          const nkRes = await nhanKhauAPI.getById(nhanKhauId);
          const nkData = nkRes.data.data || nkRes.data;
          setNhanKhauInfo(nkData);

          // ← TỰ ĐỘNG ĐIỀN THÔNG TIN
          setFormData(prev => ({
            ...prev,
            nguoiXin: nkData.hoTen,
            canCuocCongDan: nkData.canCuocCongDan,
            ngaySinh: nkData.ngaySinh?.split('T')[0] || '',
            gioiTinh: nkData.gioiTinh || 'Nam',
            queQuan: nkData.queQuan || '',
            danToc: nkData.danToc || 'Kinh',
            tonGiao: nkData.tonGiao || '',
            ngheNghiep: nkData.ngheNghiep || '',
            noiLamViec: nkData.noiLamViec || '',
            soDienThoai: nkData.soDienThoai || ''
          }));
        } catch (nkError) {
          console.error('❌ Fetch nhanKhau error:', nkError);
          alert('⚠️ Không thể tải thông tin nhân khẩu. Vui lòng điền thủ công.');
        }
      }

      // ← LẤY DANH SÁCH HỘ KHẨU KHẢ DỤNG (DÙNG ROUTE MỚI)
      const hkRes = await hoKhauAPI.getAvailableForJoin({ limit: 1000 }); // ← THAY ĐỔI
      const hkData = hkRes.data.data || [];
      setHoKhauList(hkData);

      console.log('📊 Available HoKhaus:', hkData.length);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('❌ Lỗi tải dữ liệu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hoKhauId || !formData.quanHeVoiChuHo || !formData.lyDo) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin');
      return;
    }

    // ← KIỂM TRA CÁC FIELD BẮT BUỘC
    if (!formData.queQuan) {
      alert('⚠️ Vui lòng nhập quê quán');
      return;
    }

    try {
      setLoading(true);
      await donXinVaoHoAPI.create(formData);
      alert('✅ Đã gửi đơn xin vào hộ thành công! Vui lòng chờ duyệt.');
      navigate('/dashboard/donxinvaoho');
    } catch (error) {
      console.error('Submit error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !nhanKhauInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Tạo đơn xin vào hộ" />
      <PageBreadcrumb
        pageTitle="Tạo đơn xin vào hộ"
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Đơn xin vào hộ', path: '/dashboard/donxinvaoho' },
          { label: 'Tạo đơn mới' }
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            📝 Tạo đơn xin vào hộ khẩu
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Điền thông tin để gửi đơn xin vào hộ khẩu đã có sẵn. Đơn sẽ được gửi đến chủ hộ và tổ trưởng để duyệt.
          </p>
        </div>

        {/* THÔNG BÁO NẾU ĐÃ CÓ HỘ KHẨU */}
        {nhanKhauInfo?.hoKhauId && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-500 mb-1">
                  Bạn đã thuộc hộ khẩu
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  Bạn đã có hộ khẩu. Nếu muốn chuyển sang hộ khẩu khác, vui lòng liên hệ tổ trưởng để xóa khỏi hộ khẩu cũ trước.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CHỌN HỘ KHẨU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn hộ khẩu muốn xin vào <span className="text-red-500">*</span>
            </label>
            <select
              name="hoKhauId"
              required
              value={formData.hoKhauId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">-- Chọn hộ khẩu --</option>
              {hoKhauList.map(hk => (
                <option key={hk._id} value={hk._id}>
                  {hk.soHoKhau} - Chủ hộ: {hk.chuHo?.hoTen || 'N/A'} - {hk.diaChiThuongTru}
                </option>
              ))}
            </select>
            {hoKhauList.length === 0 && (
              <p className="mt-1 text-xs text-red-500">⚠️ Không có hộ khẩu khả dụng</p>
            )}
          </div>

          {/* THÔNG TIN NGƯỜI XIN */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              👤 Thông tin người xin vào hộ
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* HỌ TÊN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nguoiXin"
                  required
                  value={formData.nguoiXin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              {/* CCCD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CCCD <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="canCuocCongDan"
                  required
                  value={formData.canCuocCongDan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="001234567890"
                />
              </div>

              {/* NGÀY SINH */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="ngaySinh"
                  required
                  value={formData.ngaySinh}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              {/* GIỚI TÍNH */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  name="gioiTinh"
                  required
                  value={formData.gioiTinh}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              {/* ← QUÊ QUÁN (THÊM MỚI) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quê quán <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="queQuan"
                  required
                  value={formData.queQuan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Hà Nội"
                />
              </div>

              {/* DÂN TỘC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dân tộc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="danToc"
                  required
                  value={formData.danToc}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Kinh"
                />
              </div>

              {/* ← TÔN GIÁO (THÊM MỚI) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tôn giáo
                </label>
                <input
                  type="text"
                  name="tonGiao"
                  value={formData.tonGiao}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Không"
                />
              </div>

              {/* NGHỀ NGHIỆP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nghề nghiệp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ngheNghiep"
                  required
                  value={formData.ngheNghiep}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Sinh viên"
                />
              </div>

              {/* ← NƠI LÀM VIỆC (THÊM MỚI) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nơi làm việc
                </label>
                <input
                  type="text"
                  name="noiLamViec"
                  value={formData.noiLamViec}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Công ty ABC"
                />
              </div>

              {/* ← SỐ ĐIỆN THOẠI (THÊM MỚI) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="soDienThoai"
                  value={formData.soDienThoai}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="0123456789"
                />
              </div>
            </div>
          </div>

          {/* QUAN HỆ VỚI CHỦ HỘ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quan hệ với chủ hộ <span className="text-red-500">*</span>
            </label>
            <select
              name="quanHeVoiChuHo"
              required
              value={formData.quanHeVoiChuHo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">-- Chọn quan hệ --</option>
              <option value="Vợ">Vợ</option>
              <option value="Chồng">Chồng</option>
              <option value="Con">Con</option>
              <option value="Con dâu">Con dâu</option>
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

          {/* LÝ DO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lý do xin vào hộ <span className="text-red-500">*</span>
            </label>
            <textarea
              name="lyDo"
              required
              rows={4}
              value={formData.lyDo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Vui lòng nêu rõ lý do xin vào hộ khẩu này..."
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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