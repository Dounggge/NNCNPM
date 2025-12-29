import { Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useAuth } from '../../context/AuthContext';

export default function TamTruTamVang() {
  const { hasPermission } = useAuth();

  return (
    <>
      <PageMeta
        title="Tạm trú/Tạm vắng | Hệ thống Quản lý Khu Dân Cư"
        description="Quản lý đăng ký tạm trú và tạm vắng"
      />
      <PageBreadcrumb pageTitle="Tạm trú/Tạm vắng" />

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📝 Quản lý Tạm trú/Tạm vắng
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Chọn loại đăng ký bạn muốn xem hoặc tạo mới
          </p>
        </div>

        {/* 2 Cards lựa chọn */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Card Tạm trú */}
          <Link
            to="/dashboard/tamtru"
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:shadow-xl dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-blue-500"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-blue-500/10"></div>
            
            <div className="relative">
              {/* Icon */}
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-transform group-hover:scale-110 dark:bg-blue-500/20 dark:text-blue-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>

              {/* Content */}
              <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                📥 Tạm trú
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Đăng ký tạm trú cho người từ nơi khác đến ở tạm thời trong khu vực
              </p>

              {/* Stats */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Đang xử lý</div>
                  <div className="mt-1 text-xl font-bold text-blue-600">12</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Đã duyệt</div>
                  <div className="mt-1 text-xl font-bold text-green-600">45</div>
                </div>
              </div>

              {/* Button */}
              <div className="flex items-center text-blue-600 dark:text-blue-400">
                <span className="font-semibold">Xem danh sách</span>
                <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Card Tạm vắng */}
          <Link
            to="/dashboard/tamvang"
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:shadow-xl dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-yellow-500"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-yellow-500/10"></div>
            
            <div className="relative">
              {/* Icon */}
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600 transition-transform group-hover:scale-110 dark:bg-yellow-500/20 dark:text-yellow-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Content */}
              <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                Tạm vắng
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Đăng ký tạm vắng cho người trong khu vực đi nơi khác tạm thời
              </p>

              {/* Stats */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Đang xử lý</div>
                  <div className="mt-1 text-xl font-bold text-yellow-600">8</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Đã duyệt</div>
                  <div className="mt-1 text-xl font-bold text-green-600">32</div>
                </div>
              </div>

              {/* Button */}
              <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                <span className="font-semibold">Xem danh sách</span>
                <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Hướng dẫn */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            ℹ️ Hướng dẫn
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium text-blue-600 dark:text-blue-400">Tạm trú</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-blue-500">•</span>
                  <span>Dành cho người từ nơi khác đến ở tạm trong khu vực</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-blue-500">•</span>
                  <span>Cần đăng ký trong vòng 3 ngày kể từ ngày đến</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-blue-500">•</span>
                  <span>Giấy tờ cần: CCCD, Giấy xác nhận chỗ ở</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-yellow-600 dark:text-yellow-400">Tạm vắng</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-yellow-500">•</span>
                  <span>Dành cho người trong khu vực đi nơi khác tạm thời</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-yellow-500">•</span>
                  <span>Cần đăng ký trước khi đi nếu vắng trên 30 ngày</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-yellow-500">•</span>
                  <span>Giấy tờ cần: CCCD, Đơn xin tạm vắng</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick actions - nếu có quyền tạo mới */}
        {hasPermission('tamtru:create') && (
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-yellow-50 p-6 dark:border-gray-800 dark:from-blue-500/10 dark:to-yellow-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tạo đơn đăng ký mới
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Bạn có quyền tạo đơn tạm trú/tạm vắng cho nhân khẩu
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/dashboard/tamtru/create"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  ➕ Tạo đơn tạm trú
                </Link>
                <Link
                  to="/dashboard/tamvang/create"
                  className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
                >
                  ➕ Tạo đơn tạm vắng
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}