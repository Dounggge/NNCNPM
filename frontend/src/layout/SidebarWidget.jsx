import { useAuth } from '../context/AuthContext';

export default function SidebarWidget() {
  const { user } = useAuth();

  return (
    <div className="mt-6 space-y-4">
      {/* ← USER INFO CARD */}
      <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.hoTen || user?.userName}</p>
            <p className="text-xs text-blue-100 capitalize">
              {user?.vaiTro?.replace('_', ' ') || 'Người dùng'}
            </p>
          </div>
        </div>
        
        <div className="pt-3 border-t border-white/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-100">Trạng thái</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Hoạt động
            </span>
          </div>
        </div>
      </div>

      {/* ← QUICK STATS */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          📊 Thống kê nhanh
        </h3>
        <div className="space-y-2">
          <StatItem icon="🏠" label="Hộ khẩu" value={user?.nhanKhauId ? "Đã có" : "Chưa có"} />
          <StatItem icon="📋" label="Hồ sơ" value={user?.nhanKhauId ? "Hoàn thiện" : "Chưa khai báo"} />
        </div>
      </div>

      {/* ← HELP SECTION */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Cần hỗ trợ?
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Liên hệ với ban quản lý để được hỗ trợ
            </p>
            <button className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700">
              Liên hệ ngay →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <span className="text-xs font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}