import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { nhanKhauAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ProfileSetupForm() {
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    hoTen: '',
    ngaySinh: '',
    gioiTinh: '',
    canCuocCongDan: '',
    noiSinh: '',
    queQuan: '',
    danToc: '',
    tonGiao: '',
    ngheNghiep: '',
    noiLamViec: '',
    trinhDoHocVan: '',
    soDienThoai: '',
    email: ''
  });

  useEffect(() => {
    // ← AUTO-FILL DỮ LIỆU TỪ USER
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        canCuocCongDan: currentUser.canCuocCongDan || '',
        hoTen: currentUser.hoTen || '',
        email: currentUser.email || ''
      }));
    }

    // ← REDIRECT NẾU ĐÃ CÓ PROFILE
    if (currentUser?.nhanKhauId) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!formData.hoTen?.trim()) {
      alert('⚠️ Vui lòng nhập Họ và tên');
      return false;
    }
    if (!formData.ngaySinh) {
      alert('⚠️ Vui lòng chọn Ngày sinh');
      return false;
    }
    if (!formData.gioiTinh) {
      alert('⚠️ Vui lòng chọn Giới tính');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ← VALIDATE BẮT BUỘC
    if (!formData.queQuan?.trim()) {
      alert('⚠️ Vui lòng nhập Quê quán');
      return;
    }
    if (!formData.danToc?.trim()) {
      alert('⚠️ Vui lòng nhập Dân tộc');
      return;
    }
    if (!formData.ngheNghiep?.trim()) {
      alert('⚠️ Vui lòng nhập Nghề nghiệp');
      return;
    }
    
    if (!window.confirm('✅ Xác nhận thông tin đã chính xác?\n\nThông tin này sẽ được lưu vào hệ thống.')) {
      return;
    }

    try {
      setLoading(true);
      console.log('📝 Submitting:', formData);
      
      // ← TẠO NHÂN KHẨU
      const nhanKhauResponse = await nhanKhauAPI.create(formData);
      console.log('✅ NhanKhau created:', nhanKhauResponse);
      
      const nhanKhauId = nhanKhauResponse.data?._id || nhanKhauResponse.data?.data?._id;
      
      if (!nhanKhauId) {
        throw new Error('Không nhận được ID nhân khẩu từ server');
      }

      // ← LIÊN KẾT VỚI USER
      console.log('🔗 Linking with nhanKhauId:', nhanKhauId);
      await authAPI.linkProfile(nhanKhauId);

      // ← CẬP NHẬT CONTEXT
      const updatedUser = await authAPI.getMe();
      updateUser(updatedUser.data.data);

      alert('✅ Khai báo thông tin thành công!\n\nBạn có thể bắt đầu sử dụng hệ thống.');
      navigate('/dashboard');
      
    } catch (error) {
      console.error('❌ Submit error:', error);
      
      const errorMsg = error.response?.data?.message || error.message;
      
      if (errorMsg.includes('duplicate') || errorMsg.includes('E11000')) {
        alert('❌ CCCD đã tồn tại trong hệ thống!');
      } else if (errorMsg.includes('required') || errorMsg.includes('bắt buộc')) {
        alert('❌ Vui lòng điền đầy đủ thông tin bắt buộc!');
      } else {
        alert(`❌ Lỗi: ${errorMsg}\n\nVui lòng thử lại hoặc liên hệ quản trị viên.`);
      }
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
              Bước 1: Thông tin cơ bản
            </h4>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              Vui lòng điền chính xác các trường có dấu <span className="text-red-500 font-bold">*</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* HỌ TÊN */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Họ và tên đầy đủ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="hoTen"
            required
            value={formData.hoTen}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Nguyễn Văn A"
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
            max={new Date().toISOString().split('T')[0]}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">-- Chọn giới tính --</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khac">Khác</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNextStep}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          Tiếp theo
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-500/10">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-500">
              Bước 2: Thông tin bổ sung
            </h4>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              Các trường có dấu <span className="text-red-500 font-bold">*</span> là bắt buộc
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* QUÊ QUÁN */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quê quán <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="queQuan"
            required
            value={formData.queQuan}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Xã/Phường, Huyện/Quận, Tỉnh/TP"
          />
        </div>

        {/* NƠI SINH */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nơi sinh
          </label>
          <input
            type="text"
            name="noiSinh"
            value={formData.noiSinh}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Xã/Phường, Huyện/Quận, Tỉnh/TP"
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
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Kinh, Tày, Mường..."
          />
        </div>

        {/* TÔN GIÁO */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tôn giáo
          </label>
          <input
            type="text"
            name="tonGiao"
            value={formData.tonGiao}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Không, Phật giáo..."
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
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Kỹ sư, Sinh viên..."
          />
        </div>

        {/* NƠI LÀM VIỆC */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nơi làm việc/Học tập
          </label>
          <input
            type="text"
            name="noiLamViec"
            value={formData.noiLamViec}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Công ty ABC..."
          />
        </div>

        {/* TRÌNH ĐỘ HỌC VẤN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Trình độ học vấn
          </label>
          <select
            name="trinhDoHocVan"
            value={formData.trinhDoHocVan}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">-- Chọn trình độ --</option>
            <option value="Tiểu học">Tiểu học</option>
            <option value="THCS">THCS</option>
            <option value="THPT">THPT</option>
            <option value="Cao đẳng">Cao đẳng</option>
            <option value="Đại học">Đại học</option>
            <option value="Thạc sĩ">Thạc sĩ</option>
            <option value="Tiến sĩ">Tiến sĩ</option>
          </select>
        </div>

        {/* SỐ ĐIỆN THOẠI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Số điện thoại
          </label>
          <input
            type="tel"
            name="soDienThoai"
            pattern="[0-9]{10}"
            value={formData.soDienThoai}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="0912345678"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="email@example.com"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang xử lý...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Hoàn thành khai báo
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <PageMeta title="Khai báo thông tin cá nhân" />
      <PageBreadcrumb pageTitle="Khai báo thông tin cá nhân" />

      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                <span className="text-sm font-medium">Thông tin cơ bản</span>
              </div>
              <div className={`h-1 flex-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`flex items-center gap-3 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
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