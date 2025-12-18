import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { nhanKhauAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ProfileSetupForm() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
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

  const isOwnProfile = !userId || userId === currentUser?._id;

  useEffect(() => {
    if (isOwnProfile && currentUser?.nhanKhauId) {
      navigate('/dashboard');
    }
  }, [currentUser, isOwnProfile, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!window.confirm('Xác nhận thông tin đã chính xác? Thông tin này sẽ được lưu vào hệ thống.')) {
      return;
    }

    try {
      setLoading(true);
      
      const nhanKhauResponse = await nhanKhauAPI.create(formData);
      const nhanKhauId = nhanKhauResponse.data._id || nhanKhauResponse.data.data._id;

      const targetUserId = userId || currentUser._id;
      await userAPI.linkProfile(targetUserId, { nhanKhauId });

      alert('✅ Khai báo thông tin thành công!');

      if (isOwnProfile) {
        updateUser({ ...currentUser, nhanKhauId: { _id: nhanKhauId, ...formData } });
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-500/10">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-500">
              Thông tin bắt buộc
            </h4>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              Để sử dụng hệ thống, bạn cần hoàn thành khai báo thông tin cá nhân. 
              Vui lòng điền chính xác theo giấy tờ tùy thân.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Họ và tên đầy đủ *
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
            Ngày cấp CCCD
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
            Nơi cấp CCCD
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

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Tiếp theo →
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
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
            placeholder="Kinh"
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
            placeholder="Không"
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
            placeholder="Kỹ sư, Giáo viên, ..."
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
            placeholder="Công ty ABC, Trường XYZ, ..."
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
            placeholder="0912345678"
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
            placeholder="email@example.com"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          ← Quay lại
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : '✅ Hoàn thành khai báo'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <PageMeta
        title="Khai báo thông tin cá nhân | Hệ thống Quản lý Khu Dân Cư"
        description="Hoàn thành khai báo thông tin để sử dụng hệ thống"
      />
      <PageBreadcrumb pageTitle="Khai báo thông tin cá nhân" />

      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  1
                </div>
                <span className="text-sm font-medium">Thông tin cơ bản</span>
              </div>
              <div className={`h-1 flex-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center gap-3 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </div>
                <span className="text-sm font-medium">Thông tin bổ sung</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {step === 1 ? renderStep1() : renderStep2()}
          </form>
        </div>
      </div>
    </>
  );
}