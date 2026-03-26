# ShopEase — Ứng dụng mua sắm

## Giới thiệu
ShopEase là một ứng dụng mua sắm trên nền tảng di động với đầy đủ các tính năng xem danh mục, duyệt sản phẩm, thêm vào giỏ hàng và thanh toán hóa đơn. Ứng dụng được thiết kế theo kiến trúc Vertical Slice MVC áp dụng cho React Native.

## Tech Stack
- **React Native (Expo)**: Sử dụng Expo SDK để xây dựng app.
- **SQLite (expo-sqlite/legacy)**: Sử dụng cơ sở dữ liệu cục bộ để lưu trữ Users, Danh mục, Sản phẩm, Đơn hàng.
- **MVC Pattern**: Kiến trúc chia theo luồng công việc (Vertical slice) cho từng feature riêng biệt (auth, catalog, cart, invoice). Mỗi nhánh hoàn chỉnh từ Database Model đến Controller và UI.
- **Context API + useReducer**: Quản lý state global cho session người dùng và giỏ hàng.
- **React Navigation**: Stack và Bottom Tabs (Trang chủ, Danh mục, Giỏ hàng, Lịch sử hóa đơn).

## Cài đặt & Chạy
\`\`\`bash
npm install
npx expo start
\`\`\`

## Tài khoản demo
- Username: `admin`
- Password: `123456`

## Cấu trúc thư mục
Dự án được chia thành các thư mục cốt lõi:
- \`src/core/\`: Cấu hình database chung.
- \`src/constants/\`: File cài đặt giá trị màu và font chung.
- \`src/context/\`: Quản lý state hệ thống (AppContext).
- \`src/navigation/\`: Route registry.
- \`src/features/auth/\`: Đăng nhập, session người dùng.
- \`src/features/catalog/\`: Hiển thị danh mục, kho hàng và chi tiết sản phẩm.
- \`src/features/cart/\`: Giỏ hàng và tiến trình thanh toán (checkout).
- \`src/features/invoice/\`: Mục hóa đơn chứa lịch sử mua.

## Luồng sử dụng
1. Khởi chạy app, qua Splash, vào Trang chủ có thể xem kho hàng dưới chế độ `Guest`.
2. Truy cập **Giỏ hàng** sẽ yêu cầu Đăng nhập (`LoginScreen`).
3. Xác thực bằng demo tài khoản, chuyển về giao diện `Logged In`.
4. Duyệt **Danh mục** và các **Sản phẩm** qua danh sách và filter, sau đó "Thêm vào giỏ".
5. Vào **Giỏ hàng**, sửa đổi số lượng item. Nhấn **Thanh toán**.
6. Hệ thống chuyển đổi OrderStatus và mở Detail receipt (**Hóa đơn**), người lưu trữ có thể share.
