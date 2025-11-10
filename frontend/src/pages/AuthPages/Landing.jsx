import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";

export default function Landing() {
  return (
    <>
      <PageMeta
        title="Hệ thống Quản lý Dân cư | Đăng nhập"
        description="Hệ thống quản lý hộ khẩu, nhân khẩu khu dân cư"
      />
      
      {/* Thêm flex items-center justify-center để căn giữa */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <svg 
                  className="w-12 h-12 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                  />
                </svg>
              </div>
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