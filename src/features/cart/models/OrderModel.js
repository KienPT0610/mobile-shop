// @feature cart | @layer Model
import { getDatabase } from '../../../core/db';

const OrderModel = {
  async create(userId) {
    const db = getDatabase();
    const result = await db.runAsync("INSERT INTO Orders (userId, status, totalAmount) VALUES (?, 'pending', 0)", 
      [userId]);
    return result.lastInsertRowId;
  },

  async getPendingByUser(userId) {
    const db = getDatabase();
    return db.getFirstAsync("SELECT * FROM Orders WHERE userId=? AND status='pending'", [userId]);
  },

  async updateStatus(orderId, status) {
    const db = getDatabase();
    await db.runAsync("UPDATE Orders SET status=? WHERE id=?", [status, orderId]);
    return true;
  },

  async recalcTotal(orderId) {
    const db = getDatabase();
    await db.runAsync(`
      UPDATE Orders 
      SET totalAmount = (
        SELECT COALESCE(SUM(quantity * unitPrice), 0) 
        FROM OrderDetails 
        WHERE orderId=?
      ) 
      WHERE id=?
    `, [orderId, orderId]);
    return true;
  },

  async getById(orderId) {
    const db = getDatabase();
    return db.getFirstAsync(`
      SELECT o.*, u.fullName, u.username 
      FROM Orders o 
      JOIN Users u ON o.userId=u.id 
      WHERE o.id=?
    `, [orderId]);
  }
};

export default OrderModel;
