import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { nhanKhauAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function NhanKhauForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hoTen: '',
    ngaySinh: '',
    gioiTinh: 'Nam',
    canCuocCongDan: '',
    ngayCapCCCD: '',
    noiCapCCCD: '',
    noiSinh: '',
    queQuan: '',
    danToc: 'Kinh',
    tonGiao: '',
    ngheNghiep: '',
    noiLamViec: '',
    soDienThoai: '',
    email: ''
  });
  const [role, setRole] = useState('dan_cu');
  const [userId, setUserId] = useState(null);
  const { user: currentUser } = useAuth();
  console.log('AUTH USER IN FORM:', currentUser);
  
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchNhanKhau();
    }
  }, [id]);

const fetchNhanKhau = async () => {
  try {
    const response = await nhanKhauAPI.getById(id);
    const data = response.data.data;

    setFormData({
      hoTen: data.hoTen || '',
      ngaySinh: data.ngaySinh ? data.ngaySinh.split('T')[0] : '',
      gioiTinh: data.gioiTinh || 'Nam',
      canCuocCongDan: data.canCuocCongDan || '',
      noiSinh: data.noiSinh || '',
      queQuan: data.queQuan || '',
      danToc: data.danToc || 'Kinh',
      tonGiao: data.tonGiao || '',
      ngheNghiep: data.ngheNghiep || '',
      noiLamViec: data.noiLamViec || '',
      soDienThoai: data.soDienThoai || '',
      email: data.email || ''
    });

    // 👇 LẤY USER + ROLE
    if (data.userId) {
      setUserId(data.userId._id || data.userId);
      setRole(data.userId.vaiTro || 'dan_cu');
    }
  } catch (error) {
    alert('❌ Lỗi tải dữ liệu');
    navigate('/dashboard/nhankhau');
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  //sửa handlesubmit có chấp nhận chỉnh role
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Lưu nhân khẩu
    const res = isEditMode
      ? await nhanKhauAPI.update(id, formData)
      : await nhanKhauAPI.create(formData);

    const nhanKhau = res.data.data;

    // 2. ADMIN xử lý USER + ROLE
    if (currentUser?.vaiTro === 'admin' ||
        currentUser?.vaiTro === 'to_truong'
        ) {
      if (userId) {
        // đã có user → update role
        await fetch(`/api/users/${userId}/role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ vaiTro: role })
        });
      } else {
        // chưa có user → TẠO USER MỚI
        await fetch(`/api/users/create-from-nhankhau`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            nhanKhauId: nhanKhau._id,
            vaiTro: role
          })
        });
      }
    }

    alert('✅ Lưu thành công');
    navigate('/dashboard/nhankhau');
  } catch (err) {
    alert('❌ Lỗi: ' + err.message);
  } finally {
    setLoading(false);
  }
};



  return (
    <>
      <PageMeta
        title={`${isEditMode ? 'Chỉnh sửa' : 'Tạo'} Nhân khẩu | Hệ thống Quản lý Khu Dân Cư`}
        description={`${isEditMode ? 'Chỉnh sửa' : 'Tạo mới'} nhân khẩu`}
      />
      <PageBreadcrumb pageTitle={`${isEditMode ? 'Chỉnh sửa' : 'Tạo'} Nhân khẩu`} />

      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? '✏️ Chỉnh sửa nhân khẩu' : '➕ Tạo nhân khẩu mới'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* THÔNG TIN CƠ BẢN */}
            <div>
              <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                📋 Thông tin cơ bản
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="hoTen"
                    required
                    value={formData.hoTen}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ngày sinh *
                  </label>
                  <input
                    type="date"
                    name="ngaySinh"
                    required
                    value={formData.ngaySinh}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Giới tính *
                  </label>
                  <select
                    name="gioiTinh"
                    required
                    value={formData.gioiTinh}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
            </div>

            {/* GIẤY TỜ TÙY THÂN */}
            <div>
              <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                🆔 Giấy tờ tùy thân
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Số CCCD/CMND *
                  </label>
                  <input
                    type="text"
                    name="canCuocCongDan"
                    required
                    value={formData.canCuocCongDan}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="001234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ngày cấp
                  </label>
                  <input
                    type="date"
                    name="ngayCapCCCD"
                    value={formData.ngayCapCCCD}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nơi cấp
                  </label>
                  <input
                    type="text"
                    name="noiCapCCCD"
                    value={formData.noiCapCCCD}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư"
                  />
                </div>
              </div>
            </div>

            {/* THÔNG TIN BỔ SUNG */}
            <div>
              <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                📍 Thông tin bổ sung
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nơi sinh
                  </label>
                  <input
                    type="text"
                    name="noiSinh"
                    value={formData.noiSinh}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Xã/Phường, Huyện/Quận, Tỉnh/TP"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Quê quán
                  </label>
                  <input
                    type="text"
                    name="queQuan"
                    value={formData.queQuan}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Xã/Phường, Huyện/Quận, Tỉnh/TP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dân tộc
                  </label>
                  <input
                    type="text"
                    name="danToc"
                    value={formData.danToc}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tôn giáo
                  </label>
                  <input
                    type="text"
                    name="tonGiao"
                    value={formData.tonGiao}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nghề nghiệp
                  </label>
                  <input
                    type="text"
                    name="ngheNghiep"
                    value={formData.ngheNghiep}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nơi làm việc
                  </label>
                  <input
                    type="text"
                    name="noiLamViec"
                    value={formData.noiLamViec}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="soDienThoai"
                    value={formData.soDienThoai}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

                {(currentUser?.vaiTro === 'admin' || currentUser?.vaiTro === 'to_truong') && (
                  <div>
                    <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                      🔐 Vai trò tài khoản
                    </h4>

                    {!userId && (
                      <p className="mb-2 text-sm text-yellow-500">
                        ⚠ Nhân khẩu này chưa có tài khoản. Hệ thống sẽ tạo tài khoản khi lưu.
                      </p>
                    )}

                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Vai trò
                    </label>

                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="mt-1 w-full rounded-lg border px-4 py-2"
                    >
                      <option value="dan_cu">Dân cư</option>
                      <option value="chu_ho">Chủ hộ</option>
                      <option value="ke_toan">Kế toán</option>
                      <option value="to_truong">Tổ trưởng</option>
                      {currentUser?.vaiTro === 'admin' && (
                      <option value="admin">Admin</option>
                      )}
                    </select>
                  </div>
                )}


            {/* BUTTONS */}
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/dashboard/nhankhau')}
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : (isEditMode ? '✅ Cập nhật' : '✅ Tạo mới')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}