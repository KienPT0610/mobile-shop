# AGENTS.md — Hướng dẫn cho AI Agent tiếp theo

## Mục đích
File này giúp AI agent đọc và hiểu toàn bộ codebase để có thể:
- Thêm feature mới đúng pattern
- Fix bug đúng chỗ
- Không phá vỡ cấu trúc hiện có

## Kiến trúc: Vertical Slice MVC

Dự án chia theo FEATURE, không chia theo layer:
```
src/features/{feature-name}/
  ├── models/      ← Thao tác SQLite
  ├── controllers/ ← Business logic
  ├── screens/     ← UI màn hình
  └── components/  ← UI components nhỏ
```

### 4 Features:
| Feature  | Person | Mô tả |
|----------|--------|-------|
| auth     | 1      | Login/Logout, UserModel |
| catalog  | 2      | Category, Product browse |
| cart     | 3      | Orders, OrderDetails, Checkout |
| invoice  | 4      | Lịch sử hóa đơn |

## File chung (KHÔNG sửa khi thêm feature mới)
- `src/core/db.js` — Database init, schema, seed
- `src/constants/` — COLORS, FONTS
- `src/context/AppContext.js` — Global state
- `src/navigation/AppNavigator.js` — Route registry

## Convention bắt buộc

### Comment đầu file:
`// @feature {name} | @layer {Model|Controller|Screen|Component}`

### Async/await + try-catch:
Dùng cấu trúc chuẩn:
```js
async myMethod(param) {
  try {
    return { success: true, data };
  } catch (e) {
    return { success: false, message: e.message };
  }
}
```

### Model pattern:
Transactions SQLite return by Promise resolution `(_, result)`. Từ chối `(_, err) => { reject(err); return false; }`.

### Controller pattern:
- Không có SQLite trong controller
- Không có JSX trong controller

### Screen pattern:
- Không có SQLite trong screen
- Dùng Controller để lấy data
- useFocusEffect để refresh khi navigate trở lại
- dispatch context để sync global state

## Database: thêm bảng mới
1. Thêm CREATE TABLE vào `src/core/db.js` (trong initDatabase)
2. Thêm seed data vào `seedData()`
3. Tạo Model mới trong feature tương ứng
4. KHÔNG tạo `db.js` riêng trong feature

## Ownership Map (conflict avoidance)
```
src/core/db.js              → Team Lead
src/constants/              → Team Lead
src/context/AppContext.js   → Team Lead
src/navigation/AppNavigator.js → Team Lead
src/features/auth/          → Person 1
src/features/catalog/       → Person 2
src/features/cart/          → Person 3
src/features/invoice/       → Person 4
src/docs/                   → Person 4
```

## Known Gotchas
- expo-sqlite: executeSql callback phải return false trong error handler
- AsyncStorage là async — luôn await
- Intl.NumberFormat hoạt động trên Expo Go
