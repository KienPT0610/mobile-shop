// @shared core/db.js — Database init + seed
import * as SQLite from 'expo-sqlite';

let _db = null;

export function getDatabase() {
  if (!_db) _db = SQLite.openDatabaseSync('shopping.db');
  return _db;
}

export async function initDatabase() {
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
}

export async function seedData() {
  const db = getDatabase();
  // Kiểm tra đã seed chưa
  const countRow = await db.getFirstAsync('SELECT COUNT(*) as c FROM Users');
  if (countRow && countRow.c > 0) return;

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

  await db.withTransactionAsync(async () => {
    await db.runAsync("INSERT INTO Users (username,password,fullName) VALUES ('admin','123456','Admin User')");
    for (let c of categories) {
      await db.runAsync('INSERT INTO Categories (name,description,imageUrl) VALUES (?,?,?)', [c.name,c.description,c.imageUrl]);
    }
    for (let p of products) {
      await db.runAsync('INSERT INTO Products (name,description,price,imageUrl,stock,categoryId) VALUES (?,?,?,?,?,?)',
        [p.name,p.description,p.price,p.imageUrl,p.stock,p.categoryId]);
    }
  });
}
