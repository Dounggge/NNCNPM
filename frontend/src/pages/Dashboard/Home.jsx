import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { dashboardAPI, hoKhauAPI } from "../../services/api";

export default function Home() {
  const [stats, setStats] = useState({
    tongHoKhau: 0,
    tongNhanKhau: 0,
    tongPhieuThu: 0,
    phieuDaDong: 0,
    phieuChuaDong: 0,
    tangTruongHoKhau: 0,
    tangTruongNhanKhau: 0,
    phanBoDoTuoi: []
  });
  const [recentHoKhau, setRecentHoKhau] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, hoKhauRes] = await Promise.all([
        dashboardAPI.getStats(),
        hoKhauAPI.getAll({ limit: 5, sort: '-createdAt' })
      ]);
      
      setStats(statsRes.data);
      setRecentHoKhau(hoKhauRes.data.hoKhaus || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải dữ liệu');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Quản lý Hộ Khẩu & Nhân Khẩu | Hệ thống Quản lý Khu Dân Cư"
        description="Trang chủ hệ thống quản lý hộ khẩu, nhân khẩu khu dân cư"
      />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tổng Quan Khu Dân Cư
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Thống kê và quản lý hộ khẩu, nhân khẩu
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Thống kê tổng quan */}
        <div className="col-span-12 lg:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tổng số hộ</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.tongHoKhau.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={stats.tangTruongHoKhau >= 0 ? "text-green-500" : "text-red-500"}>
                {stats.tangTruongHoKhau >= 0 ? "+" : ""}{stats.tangTruongHoKhau}%
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">so với tháng trước</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tổng số nhân khẩu</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.tongNhanKhau.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 dark:bg-green-500/10">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={stats.tangTruongNhanKhau >= 0 ? "text-green-500" : "text-red-500"}>
                {stats.tangTruongNhanKhau >= 0 ? "+" : ""}{stats.tangTruongNhanKhau}%
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">so với tháng trước</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phiếu đã đóng</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.phieuDaDong.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-50 dark:bg-yellow-500/10">
                <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Trên tổng {stats.tongPhieuThu} phiếu
              </span>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phiếu chưa đóng</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.phieuChuaDong.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-500">Cần xử lý</span>
            </div>
          </div>
        </div>

        {/* Biểu đồ thống kê dân số */}
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Biểu đồ tăng trưởng dân số
            </h3>
            <div className="mt-4 flex h-64 items-center justify-center text-gray-400">
              [Biểu đồ sẽ được thêm vào sau với ChartOne component]
            </div>
          </div>
        </div>

        {/* Phân bố theo độ tuổi */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Phân bố độ tuổi
            </h3>
            <div className="mt-6 space-y-4">
              {stats.phanBoDoTuoi && stats.phanBoDoTuoi.length > 0 ? (
                stats.phanBoDoTuoi.map((group, index) => (
                  <div key={index}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{group.label}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {group.value} người ({group.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div 
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-green-500' : 
                          index === 2 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${group.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>

        {/* Danh sách hộ khẩu mới */}
        <div className="col-span-12">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 p-6 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Hộ khẩu đăng ký mới gần đây
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Số hộ khẩu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Chủ hộ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Địa chỉ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Số nhân khẩu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Ngày đăng ký</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {recentHoKhau.length > 0 ? (
                    recentHoKhau.map((hoKhau) => (
                      <tr key={hoKhau._id}>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {hoKhau.soHoKhau}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {hoKhau.chuHo?.hoTen || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {hoKhau.diaChiThuongTru || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {hoKhau.thanhVien?.length || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(hoKhau.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        Chưa có hộ khẩu nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}