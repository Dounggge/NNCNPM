import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { authAPI } from "../../services/api";

export default function SignUpForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState({
    canCuocCongDan: '',
    hoTen: '',
    userName: '', // Optional custom username
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!isChecked) {
      setError('Vui lòng đồng ý với điều khoản và điều kiện');
      return;
    }

    if (formData.canCuocCongDan.length !== 12) {
      setError('Căn cước công dân phải có đúng 12 số');
      return;
    }

    setLoading(true);

    try {
      // Register
      await authAPI.register({
        canCuocCongDan: formData.canCuocCongDan,
        hoTen: formData.hoTen,
        userName: formData.userName || undefined, // Send only if provided
        password: formData.password
      });
      
      // Auto login after register
      const loginResponse = await authAPI.login({
        canCuocCongDan: formData.canCuocCongDan, // Use username if provided
        password: formData.password
      });
      
      localStorage.setItem('token', loginResponse.data.token);
      localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/landing"
          className="inline-flex items-center text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-6" />
        </Link>
      </div>

      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
          Đăng ký
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tạo tài khoản mới để sử dụng hệ thống
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {/* CCCD */}
          <div>
            <Label>
              Căn cước công dân <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              required
              pattern="[0-9]{12}"
              maxLength={12}
              value={formData.canCuocCongDan}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Only numbers
                setFormData({ ...formData, canCuocCongDan: value });
              }}
              placeholder="001234567890"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Nhập 12 số căn cước công dân
            </p>
          </div>

          {/* Full Name */}
          <div>
            <Label>
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              required
              value={formData.hoTen}
              onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
              placeholder="Nguyễn Văn A"
            />
          </div>

          {/* Username (Optional) */}
          <div>
            <Label>Tên đăng nhập (tùy chọn)</Label>
            <Input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              placeholder="vd: nguyenvana"
              minLength={3}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Nếu để trống, bạn sẽ dùng CCCD để đăng nhập
            </p>
          </div>

          {/* Password */}
          <div>
            <Label>
              Mật khẩu <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                placeholder="Nhập mật khẩu"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Mật khẩu phải có ít nhất 6 ký tự
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <Label>
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                placeholder="Nhập lại mật khẩu"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showConfirmPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </span>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <Checkbox
              className="mt-1"
              checked={isChecked}
              onChange={setIsChecked}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Bằng việc tạo tài khoản, bạn đồng ý với{" "}
              <Link 
                to="/terms" 
                className="text-gray-800 dark:text-white hover:underline"
              >
                Điều khoản và Điều kiện
              </Link>
              {" "}và{" "}
              <Link 
                to="/privacy" 
                className="text-gray-800 dark:text-white hover:underline"
              >
                Chính sách Bảo mật
              </Link>
            </p>
          </div>

          {/* Submit Button */}
          <div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Đang tạo tài khoản...
                </span>
              ) : (
                'Đăng ký'
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Sign In Link */}
      <div className="mt-6">
        <p className="text-sm text-center text-gray-700 dark:text-gray-400">
          Đã có tài khoản?{" "}
          <Link
            to="/signin"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}