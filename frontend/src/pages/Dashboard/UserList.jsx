import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Lỗi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      await userAPI.updateRole(selectedUser._id, { role: newRole });
      alert('✅ Cập nhật quyền thành công!');
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('');
      fetchUsers();
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus === 'active' ? 'vô hiệu hóa' : 'kích hoạt';
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;

    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await userAPI.updateStatus(userId, { trangThai: newStatus });
      alert(`✅ ${action.charAt(0).toUpperCase() + action.slice(1)} thành công!`);
      fetchUsers();
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      'admin': 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500',
      'to_truong': 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-500',
      'chu_ho': 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500',
      'ke_toan': 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500',
      'nguoi_dan': 'bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-500'
    };

    const labels = {
      'admin': '👑 Admin',
      'to_truong': '📋 Tổ trưởng',
      'chu_ho': '🏠 Chủ hộ',
      'ke_toan': '💰 Kế toán',
      'nguoi_dan': '👤 Người dân'
    };

    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badges[role]}`}>
        {labels[role] || role}
      </span>
    );
  };

  const getStatusBadge = (status, hasProfile) => {
    if (!hasProfile) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500">
          ⚠️ Chưa khai báo
        </span>
      );
    }

    const badges = {
      'active': 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500',
      'inactive': 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500',
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500'
    };

    const labels = {
      'active': '✅ Hoạt động',
      'inactive': '❌ Vô hiệu',
      'pending': '⏳ Chờ duyệt'
    };

    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <>
      <PageMeta
        title="Quản lý Người dùng | Hệ thống Quản lý Khu Dân Cư"
        description="Quản lý tài khoản và phân quyền người dùng"
      />
      <PageBreadcrumb pageTitle="Quản lý Người dùng" />

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-red-50 to-red-100 p-4 dark:border-gray-800 dark:from-red-500/10 dark:to-red-500/5">
            <div className="text-sm text-red-600 dark:text-red-400">Admin</div>
            <div className="mt-2 text-2xl font-bold text-red-700 dark:text-red-300">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:border-gray-800 dark:from-purple-500/10 dark:to-purple-500/5">
            <div className="text-sm text-purple-600 dark:text-purple-400">Tổ trưởng</div>
            <div className="mt-2 text-2xl font-bold text-purple-700 dark:text-purple-300">
              {users.filter(u => u.role === 'to_truong').length}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:border-gray-800 dark:from-blue-500/10 dark:to-blue-500/5">
            <div className="text-sm text-blue-600 dark:text-blue-400">Chủ hộ</div>
            <div className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">
              {users.filter(u => u.role === 'chu_ho').length}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-green-50 to-green-100 p-4 dark:border-gray-800 dark:from-green-500/10 dark:to-green-500/5">
            <div className="text-sm text-green-600 dark:text-green-400">Kế toán</div>
            <div className="mt-2 text-2xl font-bold text-green-700 dark:text-green-300">
              {users.filter(u => u.role === 'ke_toan').length}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-800 dark:from-gray-500/10 dark:to-gray-500/5">
            <div className="text-sm text-gray-600 dark:text-gray-400">Người dân</div>
            <div className="mt-2 text-2xl font-bold text-gray-700 dark:text-gray-300">
              {users.filter(u => u.role === 'nguoi_dan').length}
            </div>
          </div>
        </div>

        {/* Warning banner - Tài khoản chưa khai báo */}
        {users.some(u => !u.nhanKhauId) && (
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-500/10">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-500">
                  Cảnh báo: Có {users.filter(u => !u.nhanKhauId).length} tài khoản chưa khai báo thông tin
                </h4>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                  Các tài khoản này cần hoàn thành khai báo thông tin cá nhân trước khi sử dụng đầy đủ chức năng
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main table */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                👥 Danh sách Người dùng
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tổng: {users.length} tài khoản
              </p>
            </div>

            <div className="flex gap-3">
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                Xuất Excel
              </button>
              <Link
                to="/signup"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                ➕ Tạo tài khoản mới
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Tài khoản
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Họ tên
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Vai trò
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.username}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email || 'Chưa có email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {user.nhanKhauId?.hoTen || (
                          <span className="text-yellow-600 dark:text-yellow-400">
                            Chưa khai báo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(user.trangThai, !!user.nhanKhauId)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!user.nhanKhauId ? (
                            <Link
                              to={`/dashboard/users/${user._id}/profile-setup`}
                              className="rounded-lg bg-yellow-50 px-3 py-1.5 text-sm text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20"
                            >
                              ⚠️ Khai báo
                            </Link>
                          ) : (
                            <Link
                              to={`/dashboard/nhankhau/${user.nhanKhauId._id}`}
                              className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20"
                            >
                              👁️ Xem
                            </Link>
                          )}

                          {currentUser?.role === 'admin' && user._id !== currentUser._id && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewRole(user.role);
                                  setShowRoleModal(true);
                                }}
                                className="rounded-lg bg-purple-50 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20"
                              >
                                🔑 Đổi quyền
                              </button>

                              <button
                                onClick={() => handleToggleStatus(user._id, user.trangThai)}
                                className={`rounded-lg px-3 py-1.5 text-sm ${
                                  user.trangThai === 'active'
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20'
                                }`}
                              >
                                {user.trangThai === 'active' ? '🔒 Khóa' : '🔓 Mở khóa'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Change Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
              🔑 Thay đổi quyền người dùng
            </h3>

            <div className="mb-6">
              <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <div className="text-sm text-gray-500 dark:text-gray-400">Tài khoản</div>
                <div className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {selectedUser.username}
                </div>
                {selectedUser.nhanKhauId && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {selectedUser.nhanKhauId.hoTen}
                  </div>
                )}
              </div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Chọn vai trò mới *
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="admin">👑 Admin (Toàn quyền)</option>
                <option value="to_truong">📋 Tổ trưởng (Quản lý tổ dân phố)</option>
                <option value="chu_ho">🏠 Chủ hộ (Quản lý hộ gia đình)</option>
                <option value="ke_toan">💰 Kế toán (Quản lý thu chi)</option>
                <option value="nguoi_dan">👤 Người dân (Xem thông tin cơ bản)</option>
              </select>

              <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-500/10">
                <div className="text-xs font-semibold text-blue-800 dark:text-blue-400">
                  📌 Quyền hạn của {newRole}:
                </div>
                <ul className="mt-2 space-y-1 text-xs text-blue-700 dark:text-blue-300">
                  {newRole === 'admin' && (
                    <>
                      <li>• Toàn quyền quản trị hệ thống</li>
                      <li>• Phân quyền cho người dùng khác</li>
                      <li>• Truy cập tất cả dữ liệu</li>
                    </>
                  )}
                  {newRole === 'to_truong' && (
                    <>
                      <li>• Quản lý nhân khẩu, hộ khẩu trong tổ</li>
                      <li>• Duyệt đơn tạm trú, tạm vắng</li>
                      <li>• Xem báo cáo thống kê</li>
                    </>
                  )}
                  {newRole === 'chu_ho' && (
                    <>
                      <li>• Quản lý thông tin hộ gia đình</li>
                      <li>• Đăng ký tạm trú, tạm vắng</li>
                      <li>• Xem và thanh toán phí</li>
                    </>
                  )}
                  {newRole === 'ke_toan' && (
                    <>
                      <li>• Quản lý khoản thu, phiếu thu</li>
                      <li>• Lập báo cáo thu chi</li>
                      <li>• Xuất hóa đơn</li>
                    </>
                  )}
                  {newRole === 'nguoi_dan' && (
                    <>
                      <li>• Xem thông tin cá nhân</li>
                      <li>• Xem phiếu thu của hộ</li>
                      <li>• Đăng ký dịch vụ cơ bản</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setNewRole('');
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={handleChangeRole}
                disabled={newRole === selectedUser.role}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                ✅ Xác nhận thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}