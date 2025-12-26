export default function SidebarWidget() {
  return (
    <div className="mt-auto">
      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 border border-blue-100 dark:border-blue-900/30">
        <div className="mb-4 text-center">
          <div className="text-5xl mb-3">💡</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Cần hỗ trợ?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Liên hệ với ban quản lý để được hỗ trợ kịp thời
          </p>
        </div>

        {/* ← SỬA PHẦN NÀY */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-semibold">Hotline:</p>
              <a 
                href="tel:0345678999" 
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                0345 678 999
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-semibold">Email:</p>
              <a 
                href="mailto:support@quanlydancu.vn" 
                className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
              >
                support@quanlydancu.vn
              </a>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Thời gian làm việc: 8:00 - 17:00 (T2-T6)
          </p>
        </div>
      </div>
    </div>
  );
}