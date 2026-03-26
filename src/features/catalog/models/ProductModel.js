// @feature catalog | @layer Model
import { getDatabase } from '../../../core/db';

const ProductModel = {
  async getAll() {
    const db = getDatabase();
    return db.getAllAsync(`
      SELECT p.*, c.name as categoryName 
      FROM Products p 
      LEFT JOIN Categories c ON p.categoryId = c.id
      ORDER BY p.id DESC
    `);
  },

  async getByCategoryId(catId) {
    const db = getDatabase();
    return db.getAllAsync(`
      SELECT p.*, c.name as categoryName 
      FROM Products p 
      LEFT JOIN Categories c ON p.categoryId = c.id
      WHERE p.categoryId=?
    `, [catId]);
  },

  async getById(id) {
    const db = getDatabase();
    return db.getFirstAsync(`
      SELECT p.*, c.name as categoryName 
      FROM Products p 
      LEFT JOIN Categories c ON p.categoryId = c.id
      WHERE p.id=?
    `, [id]);
  },

  async searchByName(keyword) {
    const db = getDatabase();
    return db.getAllAsync(`
      SELECT p.*, c.name as categoryName 
      FROM Products p 
      LEFT JOIN Categories c ON p.categoryId = c.id
      WHERE p.name LIKE ?
    `, [`%${keyword}%`]);
  }
};

export default ProductModel;
