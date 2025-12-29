import PageMeta from '../components/common/PageMeta';

export default function PrivacyPolicy() {
  return (
    <>
      <PageMeta title="Chính sách quyền riêng tư" />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {/* HEADER */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🔒 Chính sách Quyền riêng tư
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>

          <div className="space-y-8 text-gray-700 dark:text-gray-300">
            {/* 1. THU THẬP THÔNG TIN */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">📋</span>
                1. Thu thập thông tin
              </h2>
              <p className="mb-3">Chúng tôi thu thập các thông tin sau:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Thông tin cá nhân:</strong> Họ tên, CCCD, ngày sinh, giới tính, địa chỉ</li>
                <li><strong>Thông tin liên hệ:</strong> Email, số điện thoại</li>
                <li><strong>Thông tin hộ khẩu:</strong> Số hộ khẩu, địa chỉ thường trú, quan hệ với chủ hộ</li>
                <li><strong>Dữ liệu giao dịch:</strong> Phiếu thu, thanh toán, lịch sử đóng phí</li>
              </ul>
            </section>

            {/* 2. SỬ DỤNG THÔNG TIN */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">🎯</span>
                2. Mục đích sử dụng
              </h2>
              <p className="mb-3">Thông tin của bạn được sử dụng để:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Quản lý hộ khẩu và nhân khẩu trong khu dân cư</li>
                <li>Phát hành và theo dõi phiếu thu</li>
                <li>Liên hệ và thông báo các sự kiện quan trọng</li>
                <li>Xử lý đơn xin vào/ra hộ khẩu, tạm trú, tạm vắng</li>
                <li>Báo cáo thống kê cho ban quản lý</li>
              </ul>
            </section>

            {/* 3. BẢO MẬT */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">🔐</span>
                3. Bảo mật thông tin
              </h2>
              <p className="mb-3">Chúng tôi cam kết:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Mã hóa mật khẩu bằng bcrypt</li>
                <li>Sử dụng JWT token để xác thực</li>
                <li>Phân quyền truy cập theo vai trò (Admin, Tổ trưởng, Kế toán, Chủ hộ, Dân cư)</li>
                <li>Không chia sẻ thông tin cho bên thứ ba</li>
                <li>Sao lưu dữ liệu định kỳ</li>
              </ul>
            </section>

            {/* 4. QUYỀN CỦA NGƯỜI DÙNG */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">⚖️</span>
                4. Quyền của người dùng
              </h2>
              <p className="mb-3">Bạn có quyền:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Xem:</strong> Xem thông tin cá nhân và hộ khẩu của mình</li>
                <li><strong>Cập nhật:</strong> Yêu cầu chỉnh sửa thông tin không chính xác</li>
                <li><strong>Xóa:</strong> Yêu cầu xóa tài khoản (với điều kiện)</li>
                <li><strong>Từ chối:</strong> Từ chối nhận thông báo không cần thiết</li>
                <li><strong>Khiếu nại:</strong> Gửi phản hồi nếu có vi phạm quyền riêng tư</li>
              </ul>
            </section>

            {/* 5. LƯU TRỮ */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">💾</span>
                5. Lưu trữ dữ liệu
              </h2>
              <p>
                Dữ liệu của bạn được lưu trữ trên máy chủ an toàn tại Việt Nam. 
                Thời gian lưu trữ tuân theo quy định của pháp luật về quản lý dân cư.
              </p>
            </section>

            {/* 6. COOKIE */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">🍪</span>
                6. Cookie và công nghệ theo dõi
              </h2>
              <p className="mb-3">Hệ thống sử dụng:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>LocalStorage:</strong> Lưu JWT token và thông tin đăng nhập</li>
                <li><strong>SessionStorage:</strong> Lưu trạng thái tạm thời</li>
                <li><strong>Không sử dụng:</strong> Cookie bên thứ ba, công cụ tracking quảng cáo</li>
              </ul>
            </section>

            {/* 7. LIÊN HỆ */}
            <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">📞</span>
                7. Liên hệ
              </h2>
              <p className="mb-4">
                Nếu có thắc mắc về chính sách quyền riêng tư, vui lòng liên hệ:
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

            {/* 8. THAY ĐỔI */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">🔄</span>
                8. Thay đổi chính sách
              </h2>
              <p>
                Chúng tôi có thể cập nhật chính sách này theo thời gian. 
                Mọi thay đổi sẽ được thông báo trên trang web và qua email (nếu có thay đổi quan trọng).
              </p>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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