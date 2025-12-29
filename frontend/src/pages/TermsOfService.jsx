import { Link } from 'react-router-dom';
import PageMeta from '../components/common/PageMeta';

export default function TermsOfService() {
  return (
    <>
      <PageMeta title="Điều khoản sử dụng" />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {/* HEADER */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              📜 Điều khoản Sử dụng
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>

          <div className="space-y-8 text-gray-700 dark:text-gray-300">
            {/* 1. CHẤP NHẬN ĐIỀU KHOẢN */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">✅</span>
                1. Chấp nhận điều khoản
              </h2>
              <p className="mb-3">
                Bằng việc đăng ký và sử dụng Hệ thống Quản lý Dân cư, bạn đồng ý tuân thủ các điều khoản và điều kiện sau:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Bạn phải từ đủ 18 tuổi trở lên hoặc có sự đồng ý của người giám hộ</li>
                <li>Thông tin bạn cung cấp phải chính xác, đầy đủ và cập nhật</li>
                <li>Bạn có trách nhiệm bảo mật thông tin đăng nhập của mình</li>
                <li>Mỗi CCCD chỉ được đăng ký <strong>MỘT TÀI KHOẢN DUY NHẤT</strong></li>
              </ul>
            </section>

            {/* 2. TÀI KHOẢN NGƯỜI DÙNG */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">👤</span>
                2. Tài khoản người dùng
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">2.1. Đăng ký tài khoản</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Bạn phải cung cấp <strong>Số CCCD/CMND</strong> hợp lệ</li>
                    <li>Mật khẩu phải có ít nhất <strong>6 ký tự</strong></li>
                    <li>Một CCCD chỉ được liên kết với <strong>MỘT tài khoản</strong></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">2.2. Bảo mật tài khoản</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Bạn chịu trách nhiệm về mọi hoạt động diễn ra dưới tài khoản của mình</li>
                    <li>Không chia sẻ mật khẩu cho bất kỳ ai</li>
                    <li>Thông báo ngay cho ban quản lý nếu phát hiện tài khoản bị xâm nhập</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">2.3. Xóa tài khoản</h3>
                  <p>Bạn có thể yêu cầu xóa tài khoản bất kỳ lúc nào. Tuy nhiên:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Dữ liệu liên quan đến hộ khẩu sẽ được lưu theo quy định pháp luật</li>
                    <li>Phiếu thu chưa thanh toán phải được giải quyết trước khi xóa</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. SỬ DỤNG DỊCH VỤ */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">🎯</span>
                3. Sử dụng dịch vụ
              </h2>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bạn được phép:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-green-700 dark:text-green-400">
                  <li>Xem và cập nhật thông tin cá nhân</li>
                  <li>Xem thông tin hộ khẩu của mình</li>
                  <li>Nộp đơn xin vào hộ, tạm trú, tạm vắng</li>
                  <li>Xem và thanh toán phiếu thu</li>
                  <li>Gửi phản hồi cho ban quản lý</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">Bạn KHÔNG được phép:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-red-700 dark:text-red-400">
                  <li>Sử dụng hệ thống cho mục đích phi pháp</li>
                  <li>Giả mạo danh tính hoặc thông tin người khác</li>
                  <li>Tấn công, hack, hoặc phá hoại hệ thống</li>
                  <li>Sao chép, phân phối dữ liệu trái phép</li>
                  <li>Spam, quảng cáo trái phép</li>
                </ul>
              </div>
            </section>

            {/* 4. QUYỀN VÀ NGHĨA VỤ */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">⚖️</span>
                4. Quyền và nghĩa vụ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-900 dark:text-green-400 mb-2">✅ Quyền của bạn:</h3>
                  <ul className="text-sm space-y-1 ml-4 list-disc list-inside text-green-800 dark:text-green-300">
                    <li>Truy cập thông tin cá nhân</li>
                    <li>Yêu cầu sửa đổi dữ liệu sai</li>
                    <li>Khiếu nại khi có vi phạm</li>
                    <li>Xóa tài khoản (có điều kiện)</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">📋 Nghĩa vụ của bạn:</h3>
                  <ul className="text-sm space-y-1 ml-4 list-disc list-inside text-blue-800 dark:text-blue-300">
                    <li>Cung cấp thông tin chính xác</li>
                    <li>Cập nhật khi có thay đổi</li>
                    <li>Thanh toán phí đúng hạn</li>
                    <li>Tuân thủ quy định khu dân cư</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 5. THANH TOÁN */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">💰</span>
                5. Thanh toán phí
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Phí quản lý được tính theo <strong>hộ khẩu/tháng</strong></li>
                <li>Hạn thanh toán: <strong>30 ngày</strong> kể từ ngày phát hành phiếu thu</li>
                <li>Quá hạn sẽ bị <strong>nhắc nhở</strong> và có thể bị <strong>phạt</strong> theo quy định</li>
                <li>Thanh toán qua <strong>chuyển khoản ngân hàng</strong> hoặc <strong>tiền mặt</strong></li>
                <li>Giữ biên lai thanh toán để đối chiếu</li>
              </ul>
            </section>

            {/* 6. TRÁCH NHIỆM CỦA HỆ THỐNG */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">🛡️</span>
                6. Trách nhiệm của hệ thống
              </h2>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chúng tôi cam kết:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Bảo mật thông tin cá nhân theo <Link to="/privacy" className="text-blue-600 hover:underline">Chính sách Bảo mật</Link></li>
                  <li>Duy trì hệ thống hoạt động ổn định <strong>24/7</strong></li>
                  <li>Sao lưu dữ liệu định kỳ</li>
                  <li>Hỗ trợ người dùng trong giờ hành chính</li>
                  <li>Thông báo trước <strong>7 ngày</strong> khi có thay đổi lớn</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">Chúng tôi KHÔNG chịu trách nhiệm:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Mất mát dữ liệu do <strong>sự cố bất khả kháng</strong> (thiên tai, chiến tranh...)</li>
                  <li>Thông tin sai do <strong>người dùng cung cấp sai</strong></li>
                  <li>Tài khoản bị hack do <strong>lỗi bảo mật của người dùng</strong></li>
                  <li>Tranh chấp giữa các hộ dân</li>
                </ul>
              </div>
            </section>

            {/* 7. VI PHẠM VÀ XỬ LÝ */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">⚠️</span>
                7. Vi phạm và xử lý
              </h2>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                  Các hành vi sau sẽ bị xử lý nghiêm khắc:
                </p>
                <ul className="text-sm space-y-2 ml-4 list-disc list-inside text-red-700 dark:text-red-400">
                  <li><strong>Giả mạo thông tin:</strong> Khóa tài khoản vĩnh viễn + báo cơ quan chức năng</li>
                  <li><strong>Spam, quảng cáo:</strong> Cảnh cáo lần 1, khóa tài khoản lần 2</li>
                  <li><strong>Tấn công hệ thống:</strong> Khóa vĩnh viễn + báo cơ quan chức năng</li>
                  <li><strong>Nợ phí quá 3 tháng:</strong> Khóa tạm thời cho đến khi thanh toán</li>
                </ul>
              </div>
            </section>

            {/* 8. THAY ĐỔI ĐIỀU KHOẢN */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">🔄</span>
                8. Thay đổi điều khoản
              </h2>
              <p className="mb-3">
                Chúng tôi có quyền thay đổi điều khoản này bất kỳ lúc nào. Mọi thay đổi sẽ:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Được thông báo qua <strong>email</strong> và <strong>thông báo trên hệ thống</strong></li>
                <li>Có hiệu lực sau <strong>7 ngày</strong> kể từ ngày thông báo</li>
                <li>Nếu không đồng ý, bạn có quyền <strong>ngừng sử dụng</strong> dịch vụ</li>
              </ul>
            </section>

            {/* 9. LIÊN HỆ */}
            <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">📞</span>
                9. Liên hệ hỗ trợ
              </h2>
              <p className="mb-4">
                Nếu có thắc mắc về điều khoản sử dụng, vui lòng liên hệ:
              </p>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <strong>📧 Email:</strong> 
                  <a href="mailto:support@quanlydancu.vn" className="text-blue-600 dark:text-blue-400 hover:underline">
                    support@quanlydancu.vn
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <strong>📱 Hotline:</strong> 
                  <a href="tel:0345678999" className="text-blue-600 dark:text-blue-400 hover:underline">
                    0345 678 999
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <strong>🏢 Địa chỉ:</strong> Ban Quản lý Dân cư, Phường/Xã [Tên]
                </p>
                <p className="flex items-center gap-2">
                  <strong>⏰ Giờ làm việc:</strong> 8:00 - 17:00 (Thứ 2 - Thứ 6)
                </p>
              </div>
            </section>
          </div>

          {/* FOOTER */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © 2025 Hệ thống Quản lý Dân cư. Mọi quyền được bảo lưu.
              </p>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}