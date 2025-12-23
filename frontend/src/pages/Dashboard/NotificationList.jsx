import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../../services/api';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function NotificationList() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread | read
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, [filter, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(filter === 'unread' && { isRead: false }),
        ...(filter === 'read' && { isRead: true })
      };

      const response = await notificationAPI.getAll(params);
      setNotifications(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Fetch notifications error:', error);
      alert('Lỗi tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification) => {
    try {
      if (!notification.isRead) {
        await notificationAPI.markAsRead(notification._id);
        
        setNotifications(prev => 
          prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
      }

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );

      alert('✅ Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Mark all as read error:', error);
      alert('Lỗi đánh dấu');
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!confirm('Xóa thông báo này?')) return;

    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      alert('✅ Đã xóa thông báo');
    } catch (error) {
      console.error('Delete notification error:', error);
      alert('Lỗi xóa thông báo');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    
    return date.toLocaleString('vi-VN');
  };

  const getIcon = (type) => {
    const icons = {
      ho_khau_moi: '🏠',
      ho_khau_duyet: '✅',
      ho_khau_tu_choi: '❌',
      don_xin_vao_ho: '📝',
      don_xin_duyet: '✅',
      phieu_thu_moi: '💰',
      vai_tro_thay_doi: '👤',
      thong_bao_chung: '📢'
    };
    return icons[type] || '🔔';
  };

  const getTypeColor = (type) => {
    const colors = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    };
    return colors[type] || colors.info;
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Thông báo" />
      <PageBreadcrumb
        pageTitle="Thông báo"
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Thông báo' }
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🔔 Thông báo
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Quản lý tất cả thông báo của bạn
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Đánh dấu tất cả
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 mt-4">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'unread', label: 'Chưa đọc' },
              { value: 'read', label: 'Đã đọc' }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => {
                  setFilter(f.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">Không có thông báo</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                  !notif.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(notif.type)}`}>
                    <span className="text-2xl">{getIcon(notif.type)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-medium ${
                        !notif.isRead 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {notif.title}
                      </h4>
                      
                      {!notif.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {notif.message}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatTime(notif.createdAt)}
                      </span>

                      {notif.link && (
                        <button
                          onClick={() => handleMarkAsRead(notif)}
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                        >
                          Xem chi tiết →
                        </button>
                      )}

                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif)}
                          className="text-xs text-gray-600 hover:text-gray-700 dark:text-gray-400"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteNotification(notif._id)}
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                ← Trước
              </button>
              
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Trang {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}