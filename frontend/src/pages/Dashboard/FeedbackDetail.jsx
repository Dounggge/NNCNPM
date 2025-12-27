import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { feedbackAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function FeedbackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, canAccess } = useAuth();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);
  const [replyData, setReplyData] = useState({
    trangThai: 'da_xu_ly',
    noiDungTraLoi: ''
  });

  useEffect(() => {
    fetchFeedback();
  }, [id]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await feedbackAPI.getById(id);
      setFeedback(res.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('❌ Lỗi tải dữ liệu');
      navigate('/dashboard/feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    
    if (!replyData.noiDungTraLoi.trim()) {
      alert('⚠️ Vui lòng nhập nội dung trả lời');
      return;
    }

    try {
      setReplying(true);
      await feedbackAPI.reply(id, replyData);
      alert('✅ Đã trả lời phản hồi thành công!');
      fetchFeedback();
      setReplyData({ trangThai: 'da_xu_ly', noiDungTraLoi: '' });
    } catch (error) {
      console.error('Reply error:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!feedback) return null;

  const getStatusBadge = (status) => {
    const badges = {
      chua_xu_ly: 'bg-yellow-100 text-yellow-700',
      dang_xu_ly: 'bg-blue-100 text-blue-700',
      da_xu_ly: 'bg-green-100 text-green-700'
    };
    const labels = {
      chua_xu_ly: 'Chưa xử lý',
      dang_xu_ly: 'Đang xử lý',
      da_xu_ly: 'Đã xử lý'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const badges = {
      gop_y: { label: 'Góp ý', color: 'bg-blue-50 text-blue-700' },
      khieu_nai: { label: 'Khiếu nại', color: 'bg-red-50 text-red-700' },
      hoi_dap: { label: 'Hỏi đáp', color: 'bg-purple-50 text-purple-700' }
    };
    const badge = badges[type] || badges.gop_y;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <>
      <PageMeta title={`Phản hồi: ${feedback.tieuDe}`} />
      <PageBreadcrumb
        pageTitle="Chi tiết phản hồi"
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Phản hồi', path: '/dashboard/feedbacks' },
          { label: feedback.tieuDe }
        ]}
      />

      <div className="space-y-6">
        {/* THÔNG TIN PHẢN HỒI */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {getTypeBadge(feedback.loaiPhanHoi)}
                {getStatusBadge(feedback.trangThai)}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {feedback.tieuDe}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Người gửi
              </label>
              <p className="text-base text-gray-900 dark:text-white">
                {feedback.nguoiGui?.hoTen || feedback.nguoiGui?.userName || 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Email
              </label>
              <p className="text-base text-gray-900 dark:text-white">
                {feedback.email || 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Số điện thoại
              </label>
              <p className="text-base text-gray-900 dark:text-white">
                {feedback.soDienThoai || 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Ngày gửi
              </label>
              <p className="text-base text-gray-900 dark:text-white">
                {new Date(feedback.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Nội dung phản hồi
            </label>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {feedback.noiDung}
              </p>
            </div>
          </div>
        </div>

        {/* NỘI DUNG TRẢ LỜI (NẾU ĐÃ XỬ LÝ) */}
        {feedback.noiDungTraLoi && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-500 mb-1">
                  Đã trả lời
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Bởi: {feedback.nguoiXuLy?.hoTen || feedback.nguoiXuLy?.userName} - 
                  {new Date(feedback.ngayTraLoi).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {feedback.noiDungTraLoi}
              </p>
            </div>
          </div>
        )}

        {/* FORM TRẢ LỜI (CHỈ ADMIN/TỔ TRƯỞNG) */}
        {canAccess(['admin', 'to_truong']) && feedback.trangThai !== 'da_xu_ly' && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              ✍️ Trả lời phản hồi
            </h2>

            <form onSubmit={handleReply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trạng thái sau khi xử lý
                </label>
                <select
                  value={replyData.trangThai}
                  onChange={(e) => setReplyData({ ...replyData, trangThai: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="dang_xu_ly">Đang xử lý</option>
                  <option value="da_xu_ly">Đã xử lý</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nội dung trả lời <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={replyData.noiDungTraLoi}
                  onChange={(e) => setReplyData({ ...replyData, noiDungTraLoi: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Nhập nội dung trả lời..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/feedbacks')}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={replying}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {replying ? 'Đang gửi...' : 'Gửi trả lời'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}