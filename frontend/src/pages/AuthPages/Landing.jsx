import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";

export default function Landing() {
  return (
    <>
      <PageMeta
        title="Hệ thống Quản lý Dân cư | Trang chủ"
        description="Hệ thống quản lý hộ khẩu, nhân khẩu khu dân cư"
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 p-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-800/50">
            {/* Logo with Glow Effect */}
            <div className="flex justify-center mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-2xl opacity-30 rounded-full animate-pulse"></div>
              <img 
                src="/logo.png" 
                alt="Logo Quản lý Dân cư" 
                className="h-24 w-auto relative z-10 drop-shadow-2xl hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Title with Gradient */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-3 animate-fade-in">
                Hệ thống Quản lý Dân cư
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Quản lý hộ khẩu, nhân khẩu và thu phí khu dân cư
              </p>
            </div>

            {/* Description Card */}
            <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-100 dark:border-blue-800/30 shadow-inner">
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center leading-relaxed">
                ✨ Ứng dụng hỗ trợ quản lý thông tin hộ khẩu, nhân khẩu, 
                khoản thu phí và thống kê dân số khu dân cư một cách 
                <span className="font-semibold text-blue-600 dark:text-blue-400"> hiện đại và tiện lợi</span>
              </p>
            </div>

            {/* Buttons with Enhanced Styling */}
            <div className="space-y-4">
              <Link to="/signin">
                <button className="group w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Đăng nhập
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </button>
              </Link>

              <Link to="/signup">
                <button className="group w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-4 px-6 rounded-2xl border-2 border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-md hover:shadow-xl relative overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Đăng ký
                  </span>
                </button>
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bạn chưa có tài khoản?{" "}
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold hover:underline">
                  Đăng ký ngay
                </Link>
              </p>
            </div>

            {/* Version */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-600 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Phiên bản 1.0.0
              </p>
            </div>
          </div>

          {/* Footer Links - ĐÃ SỬA */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <Link 
              to="/privacy" 
              className="group flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-medium">Chính sách quyền riêng tư</span>
            </Link>

            <span className="text-gray-300 dark:text-gray-700">•</span>

            <Link 
              to="/terms" 
              className="group flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Điều khoản sử dụng</span>
            </Link>
          </div>

          {/* Copyright */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-600">
              © 2025 Hệ thống Quản lý Dân cư. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </>
  );
}