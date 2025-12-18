import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import api from "../../services/api";
import {
  Users,
  Home,
  UserCheck,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  UserPlus
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/admin-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-600">
          ❌ Bạn không có quyền truy cập trang này
        </h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Admin Dashboard"
        description="Tổng quan quản lý hệ thống"
      />

      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🎯 Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Xin chào, {user?.hoTen}! Tổng quan hệ thống quản lý dân cư
          </p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tổng nhân khẩu */}
          <StatsCard
            icon={<Users className="w-8 h-8" />}
            title="Tổng nhân khẩu"
            value={stats?.tongNhanKhau || 0}
            subtitle={`+${stats?.tangTruong?.nhanKhauMoiThangNay || 0} tháng này`}
            color="blue"
          />

          {/* Tổng hộ khẩu */}
          <StatsCard
            icon={<Home className="w-8 h-8" />}
            title="Tổng hộ khẩu"
            value={stats?.tongHoKhau || 0}
            subtitle={`+${stats?.tangTruong?.hoKhauMoiThangNay || 0} tháng này`}
            color="green"
          />

          {/* Tổng users */}
          <StatsCard
            icon={<UserCheck className="w-8 h-8" />}
            title="Tổng users"
            value={stats?.tongUsers || 0}
            subtitle={`${stats?.vaiTroUsers?.admin || 0} admin`}
            color="purple"
          />

          {/* Tổng tiền thu */}
          <StatsCard
            icon={<DollarSign className="w-8 h-8" />}
            title="Tổng tiền thu"
            value={formatCurrency(stats?.thuPhi?.tongTien || 0)}
            subtitle={`${stats?.thuPhi?.tyLeDong || 0}% đã đóng`}
            color="yellow"
          />
        </div>

        {/* Row 2: Trạng thái & Vai trò */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trạng thái nhân khẩu */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Trạng thái nhân khẩu
            </h2>
            <div className="space-y-3">
              <StatusRow
                label="Thường trú"
                value={stats?.trangThaiNhanKhau?.thuongTru || 0}
                color="green"
              />
              <StatusRow
                label="Tạm trú"
                value={stats?.trangThaiNhanKhau?.tamTru || 0}
                color="blue"
              />
              <StatusRow
                label="Tạm vắng"
                value={stats?.trangThaiNhanKhau?.tamVang || 0}
                color="yellow"
              />
              <StatusRow
                label="Đã chuyển đi"
                value={stats?.trangThaiNhanKhau?.daChuyenDi || 0}
                color="red"
              />
            </div>
          </div>

          {/* Vai trò users */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              👥 Phân quyền users
            </h2>
            <div className="space-y-3">
              <StatusRow
                label="Admin"
                value={stats?.vaiTroUsers?.admin || 0}
                color="red"
              />
              <StatusRow
                label="Tổ trưởng"
                value={stats?.vaiTroUsers?.to_truong || 0}
                color="purple"
              />
              <StatusRow
                label="Kế toán"
                value={stats?.vaiTroUsers?.ke_toan || 0}
                color="blue"
              />
              <StatusRow
                label="Chủ hộ"
                value={stats?.vaiTroUsers?.chu_ho || 0}
                color="green"
              />
              <StatusRow
                label="Dân cư"
                value={stats?.vaiTroUsers?.dan_cu || 0}
                color="gray"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Thu phí & Độ tuổi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Thống kê thu phí */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💰 Thống kê thu phí
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tổng phiếu thu:</span>
                <span className="font-semibold">{stats?.thuPhi?.tongPhieuThu || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">Đã đóng:</span>
                </div>
                <span className="font-semibold text-green-600">
                  {stats?.thuPhi?.phieuDaDong || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600 dark:text-gray-400">Chưa đóng:</span>
                </div>
                <span className="font-semibold text-yellow-600">
                  {stats?.thuPhi?.phieuChuaDong || 0}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Đã thu:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(stats?.thuPhi?.tongTienDaThu || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-600 dark:text-gray-400">Còn lại:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(stats?.thuPhi?.tongTienConLai || 0)}
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="pt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Tỷ lệ đóng</span>
                  <span className="font-semibold">{stats?.thuPhi?.tyLeDong || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${stats?.thuPhi?.tyLeDong || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Phân bố độ tuổi */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              👶 Phân bố độ tuổi
            </h2>
            <div className="space-y-4">
              {stats?.phanBoDoTuoi?.map((group, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{group.label}</span>
                    <span className="font-semibold">
                      {group.value} ({group.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getAgeColor(index)}`}
                      style={{ width: `${group.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 4: Giới tính */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ⚧ Phân bố giới tính
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {stats?.gioiTinh?.nam || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Nam</div>
            </div>
            <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <div className="text-3xl font-bold text-pink-600">
                {stats?.gioiTinh?.nu || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Nữ</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-gray-600">
                {stats?.gioiTinh?.khac || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Khác</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper Components
function StatsCard({ icon, title, value, subtitle, color }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${colorClasses[color]} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
        {title}
      </h3>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
  );
}

function StatusRow({ label, value, color }) {
  const dotColors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-500'
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${dotColors[color]}`}></div>
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

// Helper Functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

function getAgeColor(index) {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500'
  ];
  return colors[index] || 'bg-gray-500';
}