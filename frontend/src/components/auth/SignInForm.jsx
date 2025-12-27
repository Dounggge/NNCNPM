import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon, ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { authAPI } from "../../services/api";

export default function SignInForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState({
    canCuocCongDan: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({
        canCuocCongDan: formData.canCuocCongDan,
        password: formData.password
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // ← FORCE RELOAD TOÀN BỘ TRANG ĐỂ RESET STATE
      window.location.href = '/dashboard';
      
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
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
          Đăng nhập
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nhập tên đăng nhập hoặc căn cước công dân
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <Label>Tên đăng nhập hoặc CCCD <span className="text-red-500">*</span></Label>
            <Input 
              type="text"
              required
              value={formData.canCuocCongDan}
              onChange={(e) => setFormData({ ...formData, canCuocCongDan: e.target.value })}
              placeholder="username hoặc 001234567890" 
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Nhập tên đăng nhập hoặc 12 số căn cước công dân
            </p>
          </div>
          <div>
            <Label>Mật khẩu <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Nhập mật khẩu"
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
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span className="text-sm text-gray-700 dark:text-gray-400">
                Ghi nhớ đăng nhập
              </span>
            </div>
            <Link
              to="/reset-password"
              className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div>
            <Button 
              type="submit" 
              className="w-full" 
              size="sm"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </div>
        </div>
      </form>

      {/* Sign Up Link */}
      <div className="mt-6">
        <p className="text-sm text-center text-gray-700 dark:text-gray-400">
          Chưa có tài khoản?{" "}
          <Link to="/signup" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}