import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";

export default function Landing() {
  return (
    <>
      <PageMeta
        title="Hệ thống Quản lý Dân cư | Trang chủ"
        description="Hệ thống quản lý hộ khẩu, nhân khẩu khu dân cư"
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
            {/* ← SỬA: LOGO */}
            <div className="flex justify-center mb-8">
              <img 
                src="/logo.png" 
                alt="Logo Quản lý Dân cư" 
                className="h-24 w-auto animate-bounce"
              />
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Hệ thống Quản lý Dân cư
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quản lý hộ khẩu, nhân khẩu và thu phí khu dân cư
              </p>
            </div>

            {/* Description */}
            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center leading-relaxed">
                Ứng dụng hỗ trợ quản lý thông tin hộ khẩu, nhân khẩu, 
                khoản thu phí và thống kê dân số khu dân cư một cách hiện đại và tiện lợi
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-4">
              <Link to="/signin">
                <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
                  Đăng nhập
                </button>
              </Link>

              <Link to="/signup">
                <button className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-xl border-2 border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 transform hover:scale-[1.02]">
                  Đăng ký
                </button>
              </Link>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Bạn chưa có tài khoản?{" "}
                <Link to="/signup" className="text-blue-500 hover:text-blue-600 font-medium">
                  Đăng ký
                </Link>
              </p>
            </div>

            {/* Version */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-600">
                Phiên bản 1.0.0
              </p>
            </div>
          </div>

          {/* Privacy Policy Link */}
          <div className="mt-6 text-center">
            <a 
              href="#" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
            >
              Chính sách quyền riêng tư
            </a>
          </div>
        </div>
      </div>
    </>
  );
}