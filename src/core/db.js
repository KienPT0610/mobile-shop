// @shared core/db.js — Database init + seed
import * as SQLite from 'expo-sqlite';

let _db = null;

export function getDatabase() {
  if (!_db) _db = SQLite.openDatabaseSync('shopease5.db');
  return _db;
}

let _initPromise = null;
export async function initDatabase() {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const db = getDatabase();
    await db.execAsync(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        fullName TEXT,
        createdAt TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS Categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        imageUrl TEXT
      );
      CREATE TABLE IF NOT EXISTS Products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        imageUrl TEXT,
        stock INTEGER DEFAULT 0,
        categoryId INTEGER,
        FOREIGN KEY (categoryId) REFERENCES Categories(id)
      );
      CREATE TABLE IF NOT EXISTS Orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        totalAmount REAL DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES Users(id)
      );
      CREATE TABLE IF NOT EXISTS OrderDetails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        unitPrice REAL NOT NULL,
        FOREIGN KEY (orderId) REFERENCES Orders(id),
        FOREIGN KEY (productId) REFERENCES Products(id)
      );
    `);
  })();
  return _initPromise;
}

let _isSeeding = false;
let _seedPromise = null;
export async function seedData() {
  if (_seedPromise) return _seedPromise;

  _seedPromise = (async () => {
    const db = getDatabase();
    // Kiểm tra đã seed chưa
    const countRow = await db.getFirstAsync('SELECT COUNT(*) as c FROM Users');
    if (countRow && countRow.c > 0) return;

    const categories = [
      {
        name: "Điện tử",
        description: "Thiết bị công nghệ",
        imageUrl:
          "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=400",
      },
      {
        name: "Thời trang",
        description: "Quần áo & phụ kiện",
        imageUrl:
          "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=400",
      },
      {
        name: "Sách",
        description: "Sách & tài liệu",
        imageUrl:
          "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=400",
      },
      {
        name: "Thực phẩm",
        description: "Đồ ăn & thức uống",
        imageUrl:
          "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=400",
      },
      {
        name: "Thể thao",
        description: "Dụng cụ thể thao",
        imageUrl:
          "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=400",
      },
    ];
    const products = [
      // Electronics (categoryId=1)
      {
        name: "iPhone 15",
        price: 22990000,
        stock: 10,
        categoryId: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=400",
        description: "Điện thoại Apple mới nhất",
      },
      {
        name: "Samsung Galaxy",
        price: 15990000,
        stock: 8,
        categoryId: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=400",
        description: "Flagship Android hàng đầu",
      },
      {
        name: "Tai nghe Sony",
        price: 2990000,
        stock: 20,
        categoryId: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400",
        description: "Chống ồn xuất sắc",
      },
      // Fashion (categoryId=2)
      {
        name: "Áo thun basic",
        price: 199000,
        stock: 50,
        categoryId: 2,
        imageUrl:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400",
        description: "Cotton 100%, thoáng mát",
      },
      {
        name: "Quần jeans slim",
        price: 450000,
        stock: 30,
        categoryId: 2,
        imageUrl:
          "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400",
        description: "Form slim, co giãn 4 chiều",
      },
      {
        name: "Giày sneaker",
        price: 890000,
        stock: 15,
        categoryId: 2,
        imageUrl:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400",
        description: "Đế êm, phong cách",
      },
      // Books (categoryId=3)
      {
        name: "Đắc Nhân Tâm",
        price: 89000,
        stock: 100,
        categoryId: 3,
        imageUrl:
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
        description: "Kinh điển phát triển bản thân",
      },
      {
        name: "Atomic Habits",
        price: 120000,
        stock: 80,
        categoryId: 3,
        imageUrl:
          "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400",
        description: "Xây dựng thói quen tốt",
      },
      {
        name: "Clean Code",
        price: 350000,
        stock: 40,
        categoryId: 3,
        imageUrl:
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400",
        description: "Viết code sạch & chuyên nghiệp",
      },
      // Food (categoryId=4)
      {
        name: "Cà phê rang xay",
        price: 150000,
        stock: 60,
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=400",
        description: "Arabica Đà Lạt thượng hạng",
      },
      {
        name: "Trà oolong",
        price: 95000,
        stock: 70,
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=400",
        description: "Thơm ngon, thanh mát",
      },
      {
        name: "Hạt điều rang",
        price: 180000,
        stock: 45,
        categoryId: 4,
        imageUrl:
          "https://69c4f72bcfb20fd075f1fd42.imgix.net/h%E1%BA%A1t-%C4%91i%E1%BB%81u-rang-79455.png",
        description: "Bình Phước tươi ngon",
      },
      // Sports (categoryId=5)
      {
        name: "Bóng đá size 5",
        price: 350000,
        stock: 25,
        categoryId: 5,
        imageUrl: "https://69c4f72bcfb20fd075f1fd42.imgix.net/ball-80204.png",
        description: "Chuẩn FIFA, bền bỉ",
      },
      {
        name: "Dây nhảy thể thao",
        price: 120000,
        stock: 40,
        categoryId: 5,
        imageUrl:
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400",
        description: "Chịu lực tốt, tay cầm êm",
      },
      {
        name: "Bình nước 1L",
        price: 250000,
        stock: 55,
        categoryId: 5,
        imageUrl:
          "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400",
        description: "Giữ nhiệt 12 giờ",
      },
    ];

    await db.withTransactionAsync(async () => {
      await db.runAsync("INSERT INTO Users (username,password,fullName) VALUES ('admin','123456','Admin User')");
      for (let c of categories) {
        await db.runAsync('INSERT INTO Categories (name,description,imageUrl) VALUES (?,?,?)', [c.name, c.description, c.imageUrl]);
      }
      for (let p of products) {
        await db.runAsync('INSERT INTO Products (name,description,price,imageUrl,stock,categoryId) VALUES (?,?,?,?,?,?)',
          [p.name, p.description, p.price, p.imageUrl, p.stock, p.categoryId]);
      }
    });
  })();
  return _seedPromise;
}
