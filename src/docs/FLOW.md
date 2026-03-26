# Luồng dữ liệu — ShopEase

## User Flow (ASCII art)
```text
App Start → initDatabase() + seedData()
    │
    ├─ checkSession() → có user → HomeScreen (logged in)
    │
    └─ không có user → HomeScreen (guest)
          │
          ├─► CategoryListScreen → ProductListScreen → ProductDetailScreen
          │         [Thêm vào giỏ]
          │              │
          │         ┌────┴─────┐
          │        No login   Đã login
          │              │         │
          │         LoginScreen   CartController.addToCart()
          │              │         │
          │         login ok  → context.cart cập nhật
          │                        │
          ├─► CartScreen ──────────┘
          │     [Thanh toán]
          │         │
          │   CartController.checkout()
          │         │
          │   OrderModel.updateStatus('paid')
          │         │
          └─► InvoiceDetailScreen
                    │
                ├─► Share
                └─► InvoiceListScreen (xem lịch sử)
```

## Data Flow theo MVC
- **Model Layer**: Xử lý 100% queries SQL (`SELECT`, `INSERT`, `UPDATE`), được bao bọc (wrapped) trong `Promise` để giữ tính bất đồng bộ.
- **Controller Layer**: Liên kết giữa UI và Model. Gọi Models để lấy/xử lý/transform dữ liệu (ví dụ format giá tiền, lọc danh sách), trước khi đưa sang Screen.
- **Screen/Component Layer**: Không thực thi SQL trực tiếp, cũng không gọi `AsyncStorage` để set login states (Screen nên nhường lại cho Controller). Chỉ phụ trách render và update Local State/Context.

## Integration Points giữa các Feature
- **ProductDetailScreen (catalog) → CartController (cart)**: Screen thuộc Catalog nhưng gọi `CartController.addToCart()` của feature Cart để đổ lượng sản phẩm mua.
- **CartScreen (cart) → InvoiceDetailScreen (invoice)**: Sau khi thanh toán thành công, nó gửi payload `invoice` ngay sang cho trang Invoice Detail.
- **InvoiceListScreen (invoice) → InvoiceDetailScreen**: Truyền qua `orderId`, bắt hệ thống call ngược DB trong component InvoiceDetailScreen.
