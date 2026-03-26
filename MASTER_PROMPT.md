# 🎯 MASTER PROMPT V2 — Shopping App (React Native + SQLite + MVC)
# Chia theo FEATURE — mỗi người full-stack từ DB → Controller → UI

> **Đọc kỹ trước khi bắt đầu:**
> - Mỗi người sở hữu 1 feature hoàn chỉnh theo chiều dọc (vertical slice)
> - KHÔNG ai được sửa file của người khác
> - Tất cả dùng chung: `src/core/db.js`, `src/constants/`, `src/context/AppContext.js`, `App.js`
> - Các file chung được setup sẵn bởi **Team Lead** (xem Phần 0)

---

## 📦 Tech Stack
- React Native (Expo)
- expo-sqlite (SQLite)
- MVC pattern: `models/` → `controllers/` → `views/`
- AsyncStorage cho session
- @react-navigation/native + stack + bottom-tabs

## 🗄️ Database Schema (5 bảng — tạo trong file chung db.js)

```sql
Users       (id, username, password, fullName, createdAt)
Categories  (id, name, description, imageUrl)
Products    (id, name, description, price, imageUrl, stock, categoryId→Categories)
Orders      (id, userId→Users, status 'pending'|'paid', totalAmount, createdAt)
OrderDetails(id, orderId→Orders, productId→Products, quantity, unitPrice)
```

## 📁 Cấu trúc thư mục

```
src/
├── core/
│   └── db.js                  ← CHUNG (Team Lead setup)
├── constants/
│   ├── colors.js              ← CHUNG
│   └── fonts.js               ← CHUNG
├── context/
│   └── AppContext.js          ← CHUNG
├── navigation/
│   └── AppNavigator.js        ← CHUNG
│
├── features/
│   ├── auth/                  ← PERSON 1
│   │   ├── models/UserModel.js
│   │   ├── controllers/AuthController.js
│   │   └── screens/LoginScreen.js
│   │
│   ├── catalog/               ← PERSON 2
│   │   ├── models/CategoryModel.js
│   │   ├── models/ProductModel.js
│   │   ├── controllers/CatalogController.js
│   │   ├── screens/HomeScreen.js
│   │   ├── screens/CategoryListScreen.js
│   │   ├── screens/ProductListScreen.js
│   │   ├── screens/ProductDetailScreen.js
│   │   └── components/ProductCard.js
│   │   └── components/CategoryCard.js
│   │
│   ├── cart/                  ← PERSON 3
│   │   ├── models/OrderModel.js
│   │   ├── models/OrderDetailModel.js
│   │   ├── controllers/CartController.js
│   │   ├── screens/CartScreen.js
│   │   └── components/CartItem.js
│   │
│   └── invoice/               ← PERSON 4
│       ├── models/InvoiceModel.js
│       ├── controllers/InvoiceController.js
│       ├── screens/InvoiceListScreen.js
│       ├── screens/InvoiceDetailScreen.js
│       └── components/InvoiceCard.js
│
└── docs/
    ├── README.md
    ├── FLOW.md
    └── AGENTS.md
```

---

# ═══════════════════════════════════════════
# PHẦN 0 — TEAM LEAD: Setup file chung
# (Làm trước, commit trước khi 4 người bắt đầu)
# ═══════════════════════════════════════════

## Lệnh cài đặt

```bash
npx expo install expo-sqlite
npx expo install @react-native-async-storage/async-storage
npx expo install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install expo-linear-gradient expo-sharing
mkdir -p src/{core,constants,context,navigation,docs}
mkdir -p src/features/{auth,catalog,cart,invoice}/{models,controllers,screens,components}
```

---

## FILE: src/constants/colors.js

```javascript
// @shared constants/colors.js
export const COLORS = {
  primary:    '#2563EB',
  secondary:  '#F59E0B',
  background: '#F8FAFC',
  surface:    '#FFFFFF',
  text: {
    primary:   '#1E293B',
    secondary: '#64748B',
    light:     '#94A3B8',
    white:     '#FFFFFF',
  },
  success:  '#10B981',
  error:    '#EF4444',
  warning:  '#F59E0B',
  border:   '#E2E8F0',
  overlay:  'rgba(0,0,0,0.4)',
};
```

## FILE: src/constants/fonts.js

```javascript
// @shared constants/fonts.js
export const FONTS = {
  sizes:   { xs:11, sm:13, md:15, lg:17, xl:20, xxl:24, xxxl:30 },
  weights: { regular:'400', medium:'500', semibold:'600', bold:'700' },
};
```

---

## FILE: src/core/db.js

```javascript
// @shared core/db.js — Database init + seed
import * as SQLite from 'expo-sqlite';

let _db = null;

export function getDatabase() {
  if (!_db) _db = SQLite.openDatabase('shopping.db');
  return _db;
}

export async function initDatabase() {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(`CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        fullName TEXT,
        createdAt TEXT DEFAULT (datetime('now'))
      )`);
      tx.executeSql(`CREATE TABLE IF NOT EXISTS Categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        imageUrl TEXT
      )`);
      tx.executeSql(`CREATE TABLE IF NOT EXISTS Products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        imageUrl TEXT,
        stock INTEGER DEFAULT 0,
        categoryId INTEGER,
        FOREIGN KEY (categoryId) REFERENCES Categories(id)
      )`);
      tx.executeSql(`CREATE TABLE IF NOT EXISTS Orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        totalAmount REAL DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES Users(id)
      )`);
      tx.executeSql(`CREATE TABLE IF NOT EXISTS OrderDetails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        unitPrice REAL NOT NULL,
        FOREIGN KEY (orderId) REFERENCES Orders(id),
        FOREIGN KEY (productId) REFERENCES Products(id)
      )`);
    }, reject, resolve);
  });
}

export async function seedData() {
  const db = getDatabase();
  // Kiểm tra đã seed chưa
  const count = await new Promise((res, rej) =>
    db.transaction(tx =>
      tx.executeSql('SELECT COUNT(*) as c FROM Users', [], (_, r) => res(r.rows._array[0].c), rej)
    )
  );
  if (count > 0) return;

  const categories = [
    { name: 'Điện tử',    description: 'Thiết bị công nghệ',   imageUrl: 'https://picsum.photos/seed/electronics/300/300' },
    { name: 'Thời trang', description: 'Quần áo & phụ kiện',   imageUrl: 'https://picsum.photos/seed/fashion/300/300' },
    { name: 'Sách',       description: 'Sách & tài liệu',      imageUrl: 'https://picsum.photos/seed/books/300/300' },
    { name: 'Thực phẩm',  description: 'Đồ ăn & thức uống',   imageUrl: 'https://picsum.photos/seed/food/300/300' },
    { name: 'Thể thao',   description: 'Dụng cụ thể thao',     imageUrl: 'https://picsum.photos/seed/sports/300/300' },
  ];
  const products = [
    // Electronics (categoryId=1)
    { name:'iPhone 15',       price:22990000, stock:10, categoryId:1, imageUrl:'https://picsum.photos/seed/iphone/300/300',   description:'Điện thoại Apple mới nhất' },
    { name:'Samsung Galaxy',  price:15990000, stock:8,  categoryId:1, imageUrl:'https://picsum.photos/seed/samsung/300/300', description:'Flagship Android hàng đầu' },
    { name:'Tai nghe Sony',   price:2990000,  stock:20, categoryId:1, imageUrl:'https://picsum.photos/seed/sony/300/300',    description:'Chống ồn xuất sắc' },
    // Fashion (categoryId=2)
    { name:'Áo thun basic',   price:199000,   stock:50, categoryId:2, imageUrl:'https://picsum.photos/seed/tshirt/300/300',  description:'Cotton 100%, thoáng mát' },
    { name:'Quần jeans slim', price:450000,   stock:30, categoryId:2, imageUrl:'https://picsum.photos/seed/jeans/300/300',  description:'Form slim, co giãn 4 chiều' },
    { name:'Giày sneaker',    price:890000,   stock:15, categoryId:2, imageUrl:'https://picsum.photos/seed/shoes/300/300',  description:'Đế êm, phong cách' },
    // Books (categoryId=3)
    { name:'Đắc Nhân Tâm',   price:89000,    stock:100,categoryId:3, imageUrl:'https://picsum.photos/seed/book1/300/300',  description:'Kinh điển phát triển bản thân' },
    { name:'Atomic Habits',   price:120000,   stock:80, categoryId:3, imageUrl:'https://picsum.photos/seed/book2/300/300',  description:'Xây dựng thói quen tốt' },
    { name:'Clean Code',      price:350000,   stock:40, categoryId:3, imageUrl:'https://picsum.photos/seed/book3/300/300',  description:'Viết code sạch & chuyên nghiệp' },
    // Food (categoryId=4)
    { name:'Cà phê rang xay', price:150000,   stock:60, categoryId:4, imageUrl:'https://picsum.photos/seed/coffee/300/300', description:'Arabica Đà Lạt thượng hạng' },
    { name:'Trà oolong',      price:95000,    stock:70, categoryId:4, imageUrl:'https://picsum.photos/seed/tea/300/300',    description:'Thơm ngon, thanh mát' },
    { name:'Hạt điều rang',   price:180000,   stock:45, categoryId:4, imageUrl:'https://picsum.photos/seed/nuts/300/300',   description:'Bình Phước tươi ngon' },
    // Sports (categoryId=5)
    { name:'Bóng đá size 5',  price:350000,   stock:25, categoryId:5, imageUrl:'https://picsum.photos/seed/ball/300/300',   description:'Chuẩn FIFA, bền bỉ' },
    { name:'Dây nhảy thể thao',price:120000,  stock:40, categoryId:5, imageUrl:'https://picsum.photos/seed/rope/300/300',   description:'Chịu lực tốt, tay cầm êm' },
    { name:'Bình nước 1L',    price:250000,   stock:55, categoryId:5, imageUrl:'https://picsum.photos/seed/bottle/300/300', description:'Giữ nhiệt 12 giờ' },
  ];

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql("INSERT INTO Users (username,password,fullName) VALUES ('admin','123456','Admin User')");
      categories.forEach(c =>
        tx.executeSql('INSERT INTO Categories (name,description,imageUrl) VALUES (?,?,?)', [c.name,c.description,c.imageUrl])
      );
      products.forEach(p =>
        tx.executeSql('INSERT INTO Products (name,description,price,imageUrl,stock,categoryId) VALUES (?,?,?,?,?,?)',
          [p.name,p.description,p.price,p.imageUrl,p.stock,p.categoryId])
      );
    }, reject, resolve);
  });
}
```

---

## FILE: src/context/AppContext.js

```javascript
// @shared context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@shopping/user';

const initialState = {
  user: null,
  isLoggedIn: false,
  cart: { orderId: null, items: [], total: 0 },
  isLoading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':       return { ...state, user: action.payload, isLoggedIn: true, isLoading: false };
    case 'LOGOUT':      return { ...state, user: null, isLoggedIn: false, cart: initialState.cart };
    case 'SET_CART':    return { ...state, cart: action.payload };
    case 'CLEAR_CART':  return { ...state, cart: initialState.cart };
    case 'SET_LOADING': return { ...state, isLoading: action.payload };
    default:            return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) dispatch({ type: 'LOGIN', payload: JSON.parse(raw) });
      else dispatch({ type: 'SET_LOADING', payload: false });
    });
  }, []);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);

// Action helpers
export const loginAction    = (user)   => ({ type: 'LOGIN',  payload: user });
export const logoutAction   = ()       => ({ type: 'LOGOUT' });
export const setCartAction  = (cart)   => ({ type: 'SET_CART', payload: cart });
export const clearCartAction= ()       => ({ type: 'CLEAR_CART' });
```

---

## FILE: src/navigation/AppNavigator.js

```javascript
// @shared navigation/AppNavigator.js
// Person 2 sẽ import screens của mình vào đây sau khi xong
// Person 3, 4 cũng import tương tự
// Đây là skeleton — mỗi người tự thêm import của feature mình

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';

// ── Lazy imports — mỗi feature tự đăng ký màn hình của mình ──────────────────
// Person 1 — Auth
import LoginScreen from '../features/auth/screens/LoginScreen';
// Person 2 — Catalog
import HomeScreen           from '../features/catalog/screens/HomeScreen';
import CategoryListScreen   from '../features/catalog/screens/CategoryListScreen';
import ProductListScreen    from '../features/catalog/screens/ProductListScreen';
import ProductDetailScreen  from '../features/catalog/screens/ProductDetailScreen';
// Person 3 — Cart
import CartScreen from '../features/cart/screens/CartScreen';
// Person 4 — Invoice
import InvoiceListScreen   from '../features/invoice/screens/InvoiceListScreen';
import InvoiceDetailScreen from '../features/invoice/screens/InvoiceDetailScreen';
// ─────────────────────────────────────────────────────────────────────────────

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

const tabIcon = (label) => ({ color }) => <Text style={{ color, fontSize: 20 }}>
  { label === 'Home' ? '🏠' : label === 'Categories' ? '📦' : label === 'Cart' ? '🛒' : '🧾' }
</Text>;

function MainTabs() {
  const { state } = useApp();
  const cartCount = state.cart.items.reduce((s, i) => s + i.quantity, 0);
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: COLORS.primary, headerShown: false }}>
      <Tab.Screen name="Home"       component={HomeScreen}         options={{ tabBarIcon: tabIcon('Home'), title: 'Trang chủ' }} />
      <Tab.Screen name="Categories" component={CategoryListScreen} options={{ tabBarIcon: tabIcon('Categories'), title: 'Danh mục' }} />
      <Tab.Screen name="Cart"       component={CartScreen}         options={{ tabBarIcon: tabIcon('Cart'), title: 'Giỏ hàng', tabBarBadge: cartCount || null }} />
      <Tab.Screen name="Invoices"   component={InvoiceListScreen}  options={{ tabBarIcon: tabIcon('Invoice'), title: 'Hóa đơn' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main"          component={MainTabs} />
        <Stack.Screen name="Login"         component={LoginScreen} />
        <Stack.Screen name="ProductList"   component={ProductListScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## FILE: App.js (không ai được sửa)

```javascript
import React, { useEffect } from 'react';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase, seedData } from './src/core/db';

export default function App() {
  useEffect(() => {
    initDatabase().then(seedData);
  }, []);
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
```

---

# ═══════════════════════════════════════════════════════════
# 🔵 PROMPT PERSON 1 — Feature: AUTHENTICATION
# Owns: src/features/auth/  (model + controller + screen)
# ═══════════════════════════════════════════════════════════

```
Bạn là Person 1 — phụ trách toàn bộ feature Authentication trong ứng dụng React Native Shopping App.
Bạn làm đầy đủ từ database model đến controller đến UI screen.

## Bạn sở hữu các file sau (CHỈ tạo/sửa các file này):
- src/features/auth/models/UserModel.js
- src/features/auth/controllers/AuthController.js
- src/features/auth/screens/LoginScreen.js

## Bạn được dùng (import, KHÔNG sửa):
- src/core/db.js           → import { getDatabase } from '../../../core/db'
- src/constants/colors.js  → import { COLORS } from '../../../constants/colors'
- src/constants/fonts.js   → import { FONTS } from '../../../constants/fonts'
- src/context/AppContext.js → import { useApp, loginAction, logoutAction } from '../../../context/AppContext'
- @react-native-async-storage/async-storage

## KHÔNG được import từ: features/catalog, features/cart, features/invoice

---

### FILE 1: src/features/auth/models/UserModel.js
// @feature auth | @layer Model

Nhiệm vụ: Toàn bộ thao tác DB liên quan đến bảng Users.

Implement các method sau (tất cả async, dùng Promise wrapping SQLite transaction):

```js
const UserModel = {
  // Tìm user theo username — dùng cho login
  findByUsername(username) { ... },

  // Tìm user theo id — dùng để restore session
  findById(id) { ... },

  // Tạo user mới — dùng cho register (optional)
  // Trả về { insertId } hoặc throw Error nếu username đã tồn tại
  create({ username, password, fullName }) { ... },

  // Xác thực login: kiểm tra username + password
  // Return: user object { id, username, fullName } hoặc null
  verifyCredentials(username, password) { ... },
};
export default UserModel;
```

Lưu ý:
- Dùng getDatabase() từ core/db.js
- Validate input không rỗng trước khi query
- Log lỗi: console.error('[UserModel] methodName:', err)
- password lưu plain text (theo đề bài), không cần hash

---

### FILE 2: src/features/auth/controllers/AuthController.js
// @feature auth | @layer Controller

Nhiệm vụ: Business logic của Auth. Cầu nối giữa UserModel và LoginScreen.

```js
import UserModel from '../models/UserModel';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@shopping/user';

const AuthController = {
  // Login: validate → query DB → lưu session → return result
  // Return: { success: true, user } | { success: false, message: string }
  async login(username, password) { ... },

  // Logout: xóa AsyncStorage session
  async logout() { ... },

  // Kiểm tra session còn tồn tại không (dùng khi app start)
  // Return: user object hoặc null
  async checkSession() { ... },

  // (Optional) Đăng ký tài khoản mới
  async register(username, password, fullName) { ... },
};
export default AuthController;
```

---

### FILE 3: src/features/auth/screens/LoginScreen.js
// @feature auth | @layer Screen

Màn hình đăng nhập — entry point của app nếu chưa login.

**UI/UX yêu cầu:**

Layout (từ trên xuống):
1. Background màu COLORS.background
2. Oval trang trí trên cùng (View bo tròn lớn, màu COLORS.primary opacity 0.08)
3. Logo section: icon 🛍️ size 60 + Text "ShopEase" (size xxxl, bold, COLORS.primary) + subtitle nhỏ
4. Card form (backgroundColor white, borderRadius 24, shadow, padding 28, margin 20):
   - Input username: icon 👤, placeholder "Tên đăng nhập", border bottom
   - Input password: icon 🔒, placeholder "Mật khẩu", secureTextEntry, nút 👁 toggle
   - Text lỗi inline dưới mỗi input (màu COLORS.error, size sm)
   - Nút LOGIN: backgroundColor COLORS.primary, borderRadius 14, height 52, text trắng bold lg
   - Loading indicator thay nút khi đang xử lý
5. Text "Demo: admin / 123456" ở dưới, màu text.light

**Logic:**
- Dùng AuthController.login()
- Khi login thành công:
  * dispatch(loginAction(user)) vào AppContext
  * navigation.replace('Main')
- Validate: hiện lỗi tương ứng
- Shake animation khi login sai (Animated.sequence)

**Style:** Dùng StyleSheet.create(), COLORS, FONTS. Không hardcode màu.
```

---

# ═══════════════════════════════════════════════════════════
# 🟢 PROMPT PERSON 2 — Feature: CATALOG (Category + Product)
# Owns: src/features/catalog/  (2 models + controller + 4 screens + 2 components)
# ═══════════════════════════════════════════════════════════

```
Bạn là Person 2 — phụ trách toàn bộ feature Catalog (danh mục + sản phẩm) trong Shopping App.
Bạn làm đầy đủ từ DB model đến controller đến 4 màn hình và 2 component.

## Bạn sở hữu:
- src/features/catalog/models/CategoryModel.js
- src/features/catalog/models/ProductModel.js
- src/features/catalog/controllers/CatalogController.js
- src/features/catalog/screens/HomeScreen.js
- src/features/catalog/screens/CategoryListScreen.js
- src/features/catalog/screens/ProductListScreen.js
- src/features/catalog/screens/ProductDetailScreen.js
- src/features/catalog/components/CategoryCard.js
- src/features/catalog/components/ProductCard.js

## Bạn được dùng (import, KHÔNG sửa):
- src/core/db.js
- src/constants/colors.js, fonts.js
- src/context/AppContext.js → useApp, loginAction, logoutAction
- react-navigation (useNavigation, useRoute, useFocusEffect)

## KHÔNG được import từ: features/auth/models, features/cart, features/invoice

---

### FILE 1: src/features/catalog/models/CategoryModel.js
// @feature catalog | @layer Model

```js
const CategoryModel = {
  getAll()      { /* SELECT * FROM Categories ORDER BY name */ },
  getById(id)   { /* SELECT * FROM Categories WHERE id=? */ },
};
export default CategoryModel;
```

### FILE 2: src/features/catalog/models/ProductModel.js
// @feature catalog | @layer Model

```js
const ProductModel = {
  // JOIN với Categories để lấy categoryName
  getAll()                  { ... },
  getByCategoryId(catId)    { ... },
  getById(id)               { ... },
  searchByName(keyword)     { /* WHERE name LIKE '%?%' */ },
};
export default ProductModel;
```

### FILE 3: src/features/catalog/controllers/CatalogController.js
// @feature catalog | @layer Controller

```js
const CatalogController = {
  async getCategories()              { ... },
  async getProducts()                { ... },
  async getProductsByCategory(catId) { ... },
  async getProductById(id)           { ... },
  async searchProducts(keyword)      { ... },

  // Utility: format giá tiền VND
  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' }).format(price);
  },
};
export default CatalogController;
```

### FILE 4: src/features/catalog/components/CategoryCard.js
Props: { category: { id, name, imageUrl }, onPress }
UI:
- Card 150×150, borderRadius 16, overflow hidden
- ImageBackground đầy đủ + gradient overlay tối nhẹ dưới
- Tên category: trắng, bold, position absolute bottom 10
- Scale animation 0.95 khi press
- Fallback: màu primary mờ nếu ảnh lỗi

### FILE 5: src/features/catalog/components/ProductCard.js
Props: { product: { id, name, price, imageUrl, stock }, onPress, onAddToCart }
UI:
- Card dọc, width '48%' (cho FlatList 2 cột)
- Image 150px height, bo tròn trên 16
- Badge "Hết hàng" overlay đỏ nếu stock=0
- Tên (2 dòng, ellipsis), giá (màu primary, bold), nút [+] tròn góc dưới phải
- Shadow nhẹ, backgroundColor white

### FILE 6: src/features/catalog/screens/HomeScreen.js
// @feature catalog | @layer Screen

Header:
- "Xin chào, {fullName} 👋" nếu đã đăng nhập
- "Khám phá ShopEase" nếu chưa
- Nút avatar/logout phải (nếu đã login)
- Nút Login (nếu chưa login) → navigate('Login')

Body (ScrollView):
1. Banner: FlatList ngang 3 slide gradient màu đẹp, auto-scroll 3s
2. Section "Danh mục" (tiêu đề + "Xem tất cả"):
   FlatList ngang CategoryCard → nhấn → navigate('ProductList', {categoryId, categoryName})
3. Section "Sản phẩm nổi bật":
   FlatList dọc grid 2 cột ProductCard → nhấn → navigate('ProductDetail', {productId})
   → [+] → kiểm tra login: nếu chưa → Alert → navigate Login; nếu rồi → dispatch ADD_TO_CART

Logic thêm giỏ hàng từ HomeScreen:
- Import { useApp, setCartAction } from context
- Gọi CartController.addToCart() — nhưng vì CartController thuộc Person 3,
  bạn chỉ dispatch action SET_CART với dữ liệu từ context.
- Thực ra bạn NAVIGATE sang ProductDetail để user thêm vào giỏ từ đó.

### FILE 7: src/features/catalog/screens/CategoryListScreen.js
- FlatList grid 2 cột CategoryCard, spacing 12
- Pull-to-refresh
- Loading skeleton (3×2 placeholder boxes mờ)
- Empty state icon + text
- Nhấn card → navigate('ProductList', { categoryId, categoryName })

### FILE 8: src/features/catalog/screens/ProductListScreen.js
route.params: { categoryId?, categoryName? }

- Header: tên category hoặc "Tất cả sản phẩm" + nút back + icon giỏ hàng (badge count từ context)
- Search bar local filter
- Filter chips: "Tất cả | Còn hàng | Giá tăng | Giá giảm"
- FlatList 2 cột ProductCard
- Nhấn card → navigate('ProductDetail', { productId })
- Nhấn [+] trên card → xem giải thích ở ProductDetailScreen (navigate thay vì add trực tiếp)
- Pull-to-refresh, loading, empty state

### FILE 9: src/features/catalog/screens/ProductDetailScreen.js
route.params: { productId }

Layout:
- ScrollView + sticky bottom bar
- Image full-width 280px, ImageBackground gradient overlay, nút back ← trái trên
- Badge stock status
- Tên (xl bold), category chip, mô tả
- Giá lớn (xxl, primary, bold)
- Quantity selector: [−] {n} [+] (1 ≤ n ≤ stock)
- Sticky bottom: "Tổng: {price}" + nút "🛒 Thêm vào giỏ"

Logic nút "Thêm vào giỏ":
1. Check isLoggedIn từ useApp()
2. Nếu chưa → Alert("Vui lòng đăng nhập", [Cancel, Đăng nhập → navigate Login])
3. Nếu đã login:
   - Import CartController từ features/cart/controllers/CartController
     (đây là điểm tích hợp hợp lệ — catalog gọi cart controller để thêm hàng)
   - Gọi CartController.addToCart({ userId, productId, quantity, unitPrice, productName, imageUrl })
   - Dispatch setCartAction(result) vào context
   - Hiện Toast/Snackbar "✅ Đã thêm vào giỏ hàng"
   - Badge giỏ hàng trên tab tự cập nhật qua context
```

---

# ═══════════════════════════════════════════════════════════
# 🟡 PROMPT PERSON 3 — Feature: CART (Giỏ hàng & Thanh toán)
# Owns: src/features/cart/  (2 models + controller + screen + component)
# ═══════════════════════════════════════════════════════════

```
Bạn là Person 3 — phụ trách toàn bộ feature Cart (giỏ hàng & checkout) trong Shopping App.
Bạn làm đầy đủ từ DB model → controller → UI screen.

## Bạn sở hữu:
- src/features/cart/models/OrderModel.js
- src/features/cart/models/OrderDetailModel.js
- src/features/cart/controllers/CartController.js
- src/features/cart/screens/CartScreen.js
- src/features/cart/components/CartItem.js

## Bạn được dùng (import, KHÔNG sửa):
- src/core/db.js
- src/constants/colors.js, fonts.js
- src/context/AppContext.js → useApp, setCartAction, clearCartAction
- react-navigation

## Tích hợp quan trọng:
- ProductDetailScreen (Person 2) sẽ IMPORT CartController của bạn để gọi addToCart()
  → Đảm bảo export đúng default và method đúng signature
- Sau checkout thành công → navigate('InvoiceDetail', { invoice }) — màn hình của Person 4

---

### FILE 1: src/features/cart/models/OrderModel.js
// @feature cart | @layer Model

```js
const OrderModel = {
  // Tạo order pending mới cho user
  create(userId)          { /* INSERT Orders */ },

  // Tìm order đang pending của user (nếu có)
  // Return: order object hoặc null
  getPendingByUser(userId) { ... },

  // Cập nhật status: 'pending' → 'paid'
  updateStatus(orderId, status) { ... },

  // Tính lại totalAmount từ SUM(quantity*unitPrice) trong OrderDetails
  recalcTotal(orderId)    { /* UPDATE Orders SET totalAmount = (SELECT SUM...) */ },

  // Lấy 1 order theo id (JOIN Users để lấy fullName)
  getById(orderId)        { ... },
};
export default OrderModel;
```

### FILE 2: src/features/cart/models/OrderDetailModel.js
// @feature cart | @layer Model

```js
const OrderDetailModel = {
  // Thêm item: nếu productId đã có trong orderId → cộng quantity; không → INSERT mới
  addItem({ orderId, productId, quantity, unitPrice }) { ... },

  // Lấy toàn bộ items của order (JOIN Products để lấy name, imageUrl)
  getByOrderId(orderId)                { ... },

  // Xóa 1 dòng
  removeItem(orderDetailId)            { ... },

  // Cập nhật số lượng
  updateQuantity(orderDetailId, qty)   { ... },

  // Xóa hết items của order (dùng khi clear cart)
  clearOrder(orderId)                  { ... },
};
export default OrderDetailModel;
```

### FILE 3: src/features/cart/controllers/CartController.js
// @feature cart | @layer Controller

**Đây là file quan trọng nhất — được gọi từ ProductDetailScreen (Person 2)**

```js
import OrderModel from '../models/OrderModel';
import OrderDetailModel from '../models/OrderDetailModel';

const CartController = {

  // Được gọi bởi ProductDetailScreen khi user nhấn "Thêm vào giỏ"
  // Tạo order nếu chưa có, thêm item, tính lại total
  // Return: { success, cart: { orderId, items, total } }
  async addToCart({ userId, productId, quantity, unitPrice, productName, imageUrl }) {
    try {
      let order = await OrderModel.getPendingByUser(userId);
      if (!order) order = { id: await OrderModel.create(userId) };
      await OrderDetailModel.addItem({ orderId: order.id, productId, quantity, unitPrice });
      await OrderModel.recalcTotal(order.id);
      const items = await OrderDetailModel.getByOrderId(order.id);
      const updated = await OrderModel.getById(order.id);
      return { success: true, cart: { orderId: order.id, items, total: updated.totalAmount } };
    } catch (e) {
      console.error('[CartController] addToCart:', e);
      return { success: false, message: e.message };
    }
  },

  // Load giỏ hàng hiện tại của user từ DB
  // Return: { orderId, items, total } hoặc { orderId: null, items: [], total: 0 }
  async getCart(userId) { ... },

  // Cập nhật số lượng 1 item, recalc total, return updated cart
  async updateQuantity({ orderDetailId, quantity, orderId, userId }) { ... },

  // Xóa 1 item, recalc total, return updated cart
  async removeItem({ orderDetailId, orderId, userId }) { ... },

  // Thanh toán
  // 1. updateStatus → 'paid'
  // 2. lấy đầy đủ thông tin để tạo invoice
  // Return: { success, invoice: { orderId, items, total, createdAt, user } }
  async checkout(orderId, userId) {
    try {
      await OrderModel.updateStatus(orderId, 'paid');
      const order = await OrderModel.getById(orderId);
      const items = await OrderDetailModel.getByOrderId(orderId);
      return { success: true, invoice: { ...order, items } };
    } catch (e) {
      console.error('[CartController] checkout:', e);
      return { success: false, message: e.message };
    }
  },
};
export default CartController;
```

### FILE 4: src/features/cart/components/CartItem.js
Props: { item: { id, productId, name, imageUrl, quantity, unitPrice }, onRemove, onUpdateQuantity }

UI:
- Row: Image 72×72 bo tròn 12 | Column (tên, giá đơn) | Quantity [−]{n}[+] | Tổng
- Image với onError fallback màu mờ + icon 🛍
- Tên 1 dòng ellipsis
- Đơn giá: "{price}/sp", màu text.secondary, size sm
- Thành tiền: quantity × unitPrice, màu primary, bold
- [−] nếu quantity=1 → đổi icon thành 🗑️ → onRemove
- [+] tăng quantity → onUpdateQuantity
- Separator dưới

### FILE 5: src/features/cart/screens/CartScreen.js
// @feature cart | @layer Screen

**useFocusEffect**: mỗi lần vào tab Cart → gọi CartController.getCart(userId) → dispatch setCartAction

Layout:
- Header "Giỏ hàng" + count badge
- Nếu chưa login: empty state "Đăng nhập để xem giỏ hàng" + nút Login
- Nếu giỏ trống: empty state 🛒 + "Giỏ hàng trống" + nút "Mua sắm ngay"
- FlatList CartItem với onRemove, onUpdateQuantity gọi CartController
- Sau mỗi thay đổi: dispatch setCartAction(cart) để badge tab cập nhật

Sticky bottom summary:
- "{n} sản phẩm | Tổng: {total}" 
- Nút "Thanh toán" (primary, disabled nếu giỏ trống)

Checkout flow:
1. Alert confirm "Thanh toán {total}?"
2. LoadingSpinner
3. CartController.checkout(orderId, userId)
4. Nếu thành công:
   - dispatch clearCartAction()
   - navigation.navigate('InvoiceDetail', { invoice }) ← màn hình Person 4
5. Nếu lỗi: Alert lỗi
```

---

# ═══════════════════════════════════════════════════════════
# 🔴 PROMPT PERSON 4 — Feature: INVOICE (Lịch sử & Chi tiết hóa đơn)
# Owns: src/features/invoice/  (model + controller + 2 screens + component)
# + toàn bộ src/docs/
# ═══════════════════════════════════════════════════════════

```
Bạn là Person 4 — phụ trách feature Invoice (lịch sử hóa đơn) và toàn bộ documentation.

## Bạn sở hữu:
- src/features/invoice/models/InvoiceModel.js
- src/features/invoice/controllers/InvoiceController.js
- src/features/invoice/screens/InvoiceListScreen.js
- src/features/invoice/screens/InvoiceDetailScreen.js
- src/features/invoice/components/InvoiceCard.js
- src/docs/README.md
- src/docs/FLOW.md
- src/docs/AGENTS.md

## Bạn được dùng (import, KHÔNG sửa):
- src/core/db.js
- src/constants/colors.js, fonts.js
- src/context/AppContext.js → useApp
- react-navigation, expo-sharing

## Tích hợp: CartScreen (Person 3) sẽ navigate('InvoiceDetail', { invoice })
  → InvoiceDetailScreen nhận invoice qua route.params

---

### FILE 1: src/features/invoice/models/InvoiceModel.js
// @feature invoice | @layer Model

```js
const InvoiceModel = {
  // Lấy toàn bộ orders đã paid của user, mới nhất trước
  // JOIN Users để lấy fullName
  getPaidByUser(userId) {
    /* SELECT o.*, u.fullName FROM Orders o
       JOIN Users u ON o.userId=u.id
       WHERE o.userId=? AND o.status='paid'
       ORDER BY o.createdAt DESC */
  },

  // Lấy chi tiết 1 invoice (order đã paid):
  // order info + JOIN Users + tất cả OrderDetails JOIN Products
  getDetail(orderId) {
    /* 2 queries:
       1. Order + User info
       2. OrderDetails + Product info → items array
       Combine và return { ...order, items } */
  },

  // Tổng số tiền đã chi của user (SUM totalAmount WHERE status='paid')
  getTotalSpent(userId) { ... },
};
export default InvoiceModel;
```

### FILE 2: src/features/invoice/controllers/InvoiceController.js
// @feature invoice | @layer Controller

```js
import InvoiceModel from '../models/InvoiceModel';

const InvoiceController = {
  // Load danh sách hóa đơn của user
  // Return: array of { id, totalAmount, createdAt, itemCount }
  async getInvoices(userId) { ... },

  // Load chi tiết 1 hóa đơn
  async getInvoiceDetail(orderId) { ... },

  // Tổng tiền đã chi
  async getTotalSpent(userId) { ... },

  // Format ngày: '2024-01-15 14:30:00' → '15/01/2024 14:30'
  formatDate(dateStr) { ... },

  // Format tiền VND
  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' }).format(price);
  },

  // Tạo text invoice để share
  generateShareText(invoice) {
    return `🧾 HÓA ĐƠN #${String(invoice.id).padStart(4,'0')}\n` +
           `Khách hàng: ${invoice.fullName}\n` +
           `Ngày: ${this.formatDate(invoice.createdAt)}\n` +
           `---\n` +
           invoice.items.map(i => `${i.name} x${i.quantity}: ${this.formatPrice(i.quantity*i.unitPrice)}`).join('\n') +
           `\n---\nTổng cộng: ${this.formatPrice(invoice.totalAmount)}`;
  },
};
export default InvoiceController;
```

### FILE 3: src/features/invoice/components/InvoiceCard.js
Props: { invoice: { id, totalAmount, createdAt, itemCount }, onPress }

UI:
- Card ngang: icon 🧾 | Column (Mã đơn, ngày, số SP) | Tổng tiền + chevron →
- Background white, borderRadius 16, shadow, padding 16
- Mã đơn: "#0001" format, bold
- Ngày: màu text.secondary, size sm
- "{n} sản phẩm", màu text.light
- Tổng tiền: primary, bold, right
- Badge "ĐÃ THANH TOÁN" xanh nhỏ
- Press animation (opacity 0.7)

### FILE 4: src/features/invoice/screens/InvoiceListScreen.js
// @feature invoice | @layer Screen

useFocusEffect: load invoices khi vào tab

Layout:
- Header "Lịch sử mua hàng"
- Summary card trên cùng: "Tổng chi tiêu: {totalSpent}" (màu primary, lớn)
- Nếu chưa login: empty state + nút Login
- Nếu chưa có đơn: empty state 🧾 + "Chưa có hóa đơn nào" + nút "Mua sắm ngay"
- FlatList InvoiceCard, ItemSeparatorComponent
- Nhấn card → navigate('InvoiceDetail', { orderId: invoice.id })
  (InvoiceDetailScreen tự load chi tiết từ DB theo orderId)
- Pull-to-refresh

### FILE 5: src/features/invoice/screens/InvoiceDetailScreen.js
// @feature invoice | @layer Screen

2 cách nhận data:
1. Từ CartScreen navigate: route.params.invoice (đã có đầy đủ data)
2. Từ InvoiceListScreen navigate: route.params.orderId (cần load từ DB)

Logic khởi tạo:
```js
useEffect(() => {
  if (route.params?.invoice) {
    setInvoice(route.params.invoice); // data từ CartScreen
  } else if (route.params?.orderId) {
    InvoiceController.getInvoiceDetail(route.params.orderId).then(setInvoice);
  }
}, []);
```

Layout (ScrollView):
1. Header: "Hóa đơn #{id}" + nút chia sẻ (expo-sharing) + nút back
2. Success block (nếu từ CartScreen — vừa checkout xong):
   - Animated checkmark ✅ (scale 0 → 1, spring animation)
   - Text "Thanh toán thành công!"
3. Info card:
   - Mã đơn hàng: #0001
   - Ngày giờ: format DD/MM/YYYY HH:mm
   - Khách hàng: fullName
   - Badge "ĐÃ THANH TOÁN" xanh
4. Divider dashed
5. Danh sách items:
   - Mỗi dòng: tên | x{qty} | {thành tiền}
   - Nhỏ gọn, separator line
6. Divider
7. Tổng cộng: lớn, bold, primary, căn phải
8. Hai nút cuối:
   - "Về trang chủ" (outline) → navigation.navigate('Main')
   - "Tiếp tục mua sắm" (filled) → navigation.navigate('Main', { screen:'Categories' })

Share: khi nhấn icon share:
```js
import * as Sharing from 'expo-sharing';
const text = InvoiceController.generateShareText(invoice);
// Tạo file text tạm rồi share, hoặc dùng Share từ react-native
import { Share } from 'react-native';
Share.share({ message: text, title: `Hóa đơn #${invoice.id}` });
```

---

### FILE 6: src/docs/README.md

Viết README đầy đủ tiếng Việt:

# ShopEase — Ứng dụng mua sắm

## Giới thiệu
[Mô tả ngắn gọn]

## Tech Stack
- React Native (Expo)
- SQLite (expo-sqlite)
- MVC Pattern theo feature (vertical slice)
- React Context + useReducer
- React Navigation (Stack + Bottom Tabs)

## Cài đặt & Chạy
\`\`\`bash
npm install
npx expo start
\`\`\`

## Tài khoản demo
- Username: admin | Password: 123456

## Cấu trúc thư mục
[Giải thích src/features/ và từng feature]

## Luồng sử dụng
[Mô tả flow ngắn gọn]

---

### FILE 7: src/docs/FLOW.md

# Luồng dữ liệu — ShopEase

## User Flow (ASCII art)
\`\`\`
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
\`\`\`

## Data Flow theo MVC
[Giải thích từng layer]

## Integration Points giữa các Feature
- ProductDetailScreen (catalog) → CartController (cart): addToCart()
- CartScreen (cart) → InvoiceDetailScreen (invoice): navigate with invoice data
- InvoiceListScreen (invoice) → InvoiceDetailScreen: navigate with orderId

---

### FILE 8: src/docs/AGENTS.md

# AGENTS.md — Hướng dẫn cho AI Agent tiếp theo

## Mục đích
File này giúp AI agent đọc và hiểu toàn bộ codebase để có thể:
- Thêm feature mới đúng pattern
- Fix bug đúng chỗ
- Không phá vỡ cấu trúc hiện có

## Kiến trúc: Vertical Slice MVC

Dự án chia theo FEATURE, không chia theo layer:
\`\`\`
src/features/{feature-name}/
  ├── models/      ← Thao tác SQLite
  ├── controllers/ ← Business logic
  ├── screens/     ← UI màn hình
  └── components/  ← UI components nhỏ
\`\`\`

### 4 Features:
| Feature  | Person | Mô tả |
|----------|--------|-------|
| auth     | 1      | Login/Logout, UserModel |
| catalog  | 2      | Category, Product browse |
| cart     | 3      | Orders, OrderDetails, Checkout |
| invoice  | 4      | Lịch sử hóa đơn |

## File chung (KHÔNG sửa khi thêm feature mới)
- src/core/db.js — Database init, schema, seed
- src/constants/ — COLORS, FONTS
- src/context/AppContext.js — Global state
- src/navigation/AppNavigator.js — Route registry

## Convention bắt buộc

### Comment đầu file:
\`// @feature {name} | @layer {Model|Controller|Screen|Component}\`

### Async/await + try-catch:
\`\`\`js
async myMethod(param) {
  try {
    // logic
    return { success: true, data };
  } catch (e) {
    console.error('[ClassName] myMethod:', e);
    return { success: false, message: e.message };
  }
}
\`\`\`

### Model pattern:
\`\`\`js
const MyModel = {
  methodName(params) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx =>
        tx.executeSql(SQL, params,
          (_, result) => resolve(result.rows._array),
          (_, err) => { reject(err); return false; }
        )
      );
    });
  }
};
export default MyModel;
\`\`\`

### Controller pattern:
- Không có SQLite trong controller
- Không có JSX trong controller
- Chỉ gọi Model methods + xử lý business logic

### Screen pattern:
- Không có SQLite trong screen
- Dùng Controller để lấy data
- useFocusEffect để refresh khi navigate trở lại
- dispatch context để sync global state

## Integration Points (quan trọng)
- ProductDetailScreen (catalog) IMPORT CartController (cart): addToCart()
- CartScreen NAVIGATE sang InvoiceDetailScreen với { invoice }
- InvoiceListScreen NAVIGATE sang InvoiceDetailScreen với { orderId }
- Tất cả screens dùng useApp() để đọc state.user, state.cart

## Database: thêm bảng mới
1. Thêm CREATE TABLE vào src/core/db.js (trong initDatabase)
2. Thêm seed data vào seedData()
3. Tạo Model mới trong feature tương ứng
4. KHÔNG tạo db.js riêng trong feature

## Thêm feature mới
1. mkdir src/features/{name}/{models,controllers,screens,components}
2. Tạo Model → Controller → Screen
3. Đăng ký Screen vào AppNavigator.js
4. Thêm Tab nếu cần vào MainTabs trong AppNavigator.js
5. Cập nhật AGENTS.md

## Màu sắc & Typography
Luôn dùng COLORS từ src/constants/colors.js
Luôn dùng FONTS từ src/constants/fonts.js
KHÔNG hardcode màu hay font size

## State Management
- Local state (useState): data của 1 màn hình
- Global state (AppContext): user session + cart
- DB là source of truth — luôn sync về context sau thay đổi

## Ownership Map (conflict avoidance)
\`\`\`
src/core/db.js              → Team Lead (KHÔNG ai sửa)
src/constants/              → Team Lead (KHÔNG ai sửa)
src/context/AppContext.js   → Team Lead (KHÔNG ai sửa)
src/navigation/AppNavigator.js → Team Lead (KHÔNG ai sửa)
src/features/auth/          → Person 1
src/features/catalog/       → Person 2
src/features/cart/          → Person 3
src/features/invoice/       → Person 4
src/docs/                   → Person 4
\`\`\`

## Known Gotchas
- expo-sqlite: executeSql callback phải return false trong error handler
- FlatList numColumns không thể đổi lúc runtime (remount bằng key)
- useFocusEffect cần import từ @react-navigation/native
- AsyncStorage là async — luôn await
- Intl.NumberFormat hoạt động trên Expo Go (không cần polyfill)
```

---

## ✅ Checklist tích hợp cuối

Sau khi 4 người xong, Team Lead kiểm tra:

| Điểm tích hợp | Mô tả | Người chịu trách nhiệm |
|---------------|-------|----------------------|
| ProductDetailScreen import CartController | catalog gọi cart | Person 2 + 3 đồng thuận |
| CartScreen navigate InvoiceDetailScreen | cart truyền invoice | Person 3 + 4 đồng thuận |
| AppNavigator đăng ký đủ screens | tất cả routes có | Team Lead |
| initDatabase() tạo đủ 5 bảng | schema đúng | Team Lead |
| context cart.items.length hiện đúng trên badge | sync state | Person 3 |

## 🎨 Design System thống nhất

| Element | Spec |
|---------|------|
| Border radius lớn | 20–24px |
| Border radius nhỏ | 12–16px |
| Shadow | elevation:4, shadowOpacity:0.08 |
| Spacing | 8, 12, 16, 20, 24 |
| Button height | 52px |
| Card padding | 16–20px |
| Font title screen | xxl bold |
| Font section header | lg semibold |
| Font body | md regular |
| Font price | xl bold, COLORS.primary |
