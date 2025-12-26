import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import {
  nhanKhauAPI,
  hoKhauAPI,
  donTamTruAPI,
  donTamVangAPI
} from '../../services/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function AdminDashboard() {
  const { user, canAccess } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!canAccess(['admin', 'to_truong'])) {
      alert('❌ Bạn không có quyền truy cập trang này!');
      navigate('/dashboard');
      return;
    }

    fetchStats();
  }, [user, canAccess, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [nhanKhauRes, hoKhauRes, tamTruRes, tamVangRes] = await Promise.all([
        nhanKhauAPI.getAll({ limit: 10000 }),
        hoKhauAPI.getAll({ limit: 10000 }),
        donTamTruAPI.getAll({ limit: 10000 }),
        donTamVangAPI.getAll({ limit: 10000 })
      ]);

      const nhanKhaus = nhanKhauRes.data.data || [];
      const hoKhaus = hoKhauRes.data.data || [];
      const tamTrus = tamTruRes.data.data || [];
      const tamVangs = tamVangRes.data.data || [];

      // PHÂN BỐ GIỚI TÍNH
      const gioiTinh = {
        nam: nhanKhaus.filter(nk => nk.gioiTinh === 'Nam').length,
        nu: nhanKhaus.filter(nk => nk.gioiTinh === 'Nữ').length
      };

      // PHÂN BỐ ĐỘ TUỔI
      const now = new Date();
      const doTuoi = {
        '0-18': 0,
        '19-35': 0,
        '36-60': 0,
        '60+': 0
      };

      nhanKhaus.forEach(nk => {
        if (!nk.ngaySinh) return;
        const age = now.getFullYear() - new Date(nk.ngaySinh).getFullYear();
        if (age <= 18) doTuoi['0-18']++;
        else if (age <= 35) doTuoi['19-35']++;
        else if (age <= 60) doTuoi['36-60']++;
        else doTuoi['60+']++;
      });

      // TRẠNG THÁI TẠM TRÚ
      const trangThaiTamTru = {
        cho_duyet: tamTrus.filter(tt => tt.trangThai === 'cho_xu_ly').length,
        da_duyet: tamTrus.filter(tt => tt.trangThai === 'da_xu_ly').length,
        tu_choi: 0
      };

      // TRẠNG THÁI TẠM VẮNG
      const trangThaiTamVang = {
        cho_duyet: tamVangs.filter(tv => tv.trangThai === 'cho_xu_ly').length,
        da_duyet: tamVangs.filter(tv => tv.trangThai === 'da_xu_ly').length,
        tu_choi: 0
      };

      setStats({
        tongNhanKhau: nhanKhaus.length,
        tongHoKhau: hoKhaus.length,
        tongTamTru: tamTrus.length,
        tongTamVang: tamVangs.length,
        gioiTinh,
        doTuoi,
        trangThaiTamTru,
        trangThaiTamVang
      });

      console.log('📊 Stats loaded:', {
        nhanKhau: nhanKhaus.length,
        hoKhau: hoKhaus.length
      });
    } catch (error) {
      console.error('Fetch stats error:', error);
      alert('❌ Lỗi tải dữ liệu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">Không thể tải dữ liệu thống kê</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // ← DATA CHO BIỂU ĐỒ
  const gioiTinhData = [
    { name: 'Nam', value: stats.gioiTinh.nam, color: '#3B82F6' },
    { name: 'Nữ', value: stats.gioiTinh.nu, color: '#EC4899' }
  ];

  const doTuoiData = Object.entries(stats.doTuoi).map(([range, count]) => ({
    name: range + ' tuổi',
    'Số lượng': count
  }));

  const trangThaiData = [
    {
      name: 'Tạm trú',
      'Chờ duyệt': stats.trangThaiTamTru.cho_duyet,
      'Đã duyệt': stats.trangThaiTamTru.da_duyet
    },
    {
      name: 'Tạm vắng',
      'Chờ duyệt': stats.trangThaiTamVang.cho_duyet,
      'Đã duyệt': stats.trangThaiTamVang.da_duyet
    }
  ];

  return (
    <>
      <PageMeta title="Báo cáo thống kê" />

      <div className="p-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">📊</span>
            <span>Báo cáo thống kê</span>
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Tổng quan hệ thống quản lý dân cư - {user?.hoTen}
          </p>
        </div>

        {/* TỔNG QUAN - 4 CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold">{stats.tongNhanKhau}</div>
                <div className="text-sm opacity-90 mt-2">Tổng nhân khẩu</div>
              </div>
              <div className="text-6xl opacity-80">👥</div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-400/30">
              <div className="flex justify-between text-sm">
                <span>Nam: {stats.gioiTinh.nam}</span>
                <span>Nữ: {stats.gioiTinh.nu}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold">{stats.tongHoKhau}</div>
                <div className="text-sm opacity-90 mt-2">Tổng hộ khẩu</div>
              </div>
              <div className="text-6xl opacity-80">🏠</div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-400/30 text-sm">
              Quản lý {stats.tongHoKhau} hộ gia đình
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold">{stats.tongTamTru}</div>
                <div className="text-sm opacity-90 mt-2">Đơn tạm trú</div>
              </div>
              <div className="text-6xl opacity-80">🏘️</div>
            </div>
            <div className="mt-4 pt-4 border-t border-purple-400/30 flex gap-2">
              <span className="px-3 py-1 bg-yellow-400/30 rounded-full text-xs">
                Chờ: {stats.trangThaiTamTru.cho_duyet}
              </span>
              <span className="px-3 py-1 bg-green-400/30 rounded-full text-xs">
                Duyệt: {stats.trangThaiTamTru.da_duyet}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold">{stats.tongTamVang}</div>
                <div className="text-sm opacity-90 mt-2">Đơn tạm vắng</div>
              </div>
              <div className="text-6xl opacity-80">✈️</div>
            </div>
            <div className="mt-4 pt-4 border-t border-orange-400/30 flex gap-2">
              <span className="px-3 py-1 bg-yellow-400/30 rounded-full text-xs">
                Chờ: {stats.trangThaiTamVang.cho_duyet}
              </span>
              <span className="px-3 py-1 bg-green-400/30 rounded-full text-xs">
                Duyệt: {stats.trangThaiTamVang.da_duyet}
              </span>
            </div>
          </div>
        </div>

        {/* BIỂU ĐỒ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* BIỂU ĐỒ TRÒN - GIỚI TÍNH */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span>⚧</span>
              <span>Phân bố giới tính</span>
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gioiTinhData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gioiTinhData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Nam: {stats.gioiTinh.nam}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-pink-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Nữ: {stats.gioiTinh.nu}</span>
              </div>
            </div>
          </div>

          {/* BIỂU ĐỒ CỘT - ĐỘ TUỔI */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span>📅</span>
              <span>Phân bố độ tuổi</span>
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={doTuoiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="Số lượng" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BIỂU ĐỒ TRẠNG THÁI TẠM TRÚ/VẮNG */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span>📈</span>
            <span>Trạng thái Tạm trú & Tạm vắng</span>
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={trangThaiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                style={{ fontSize: '14px', fontWeight: 'bold' }}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar dataKey="Chờ duyệt" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Đã duyệt" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CHI TIẾT TRẠNG THÁI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TẠM TRÚ */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl shadow-xl p-6 border border-purple-100 dark:border-purple-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🏘️</span>
              <span>Chi tiết Tạm trú</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {stats.trangThaiTamTru.cho_duyet}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white text-lg">Chờ duyệt</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Đang chờ xử lý</p>
                </div>
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {stats.trangThaiTamTru.da_duyet}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white text-lg">Đã duyệt</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Đã được phê duyệt</p>
                </div>
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* TẠM VẮNG */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl shadow-xl p-6 border border-orange-100 dark:border-orange-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">✈️</span>
              <span>Chi tiết Tạm vắng</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {stats.trangThaiTamVang.cho_duyet}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white text-lg">Chờ duyệt</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Đang chờ xử lý</p>
                </div>
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {stats.trangThaiTamVang.da_duyet}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white text-lg">Đã duyệt</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Đã được phê duyệt</p>
                </div>
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}