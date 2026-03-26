// @feature invoice | @layer Model
import { getDatabase } from '../../../core/db';

const InvoiceModel = {
  async getPaidByUser(userId) {
    const db = getDatabase();
    return db.getAllAsync(`
      SELECT o.*, u.fullName,
      (SELECT COUNT(*) FROM OrderDetails WHERE orderId = o.id) as itemCount
      FROM Orders o
      JOIN Users u ON o.userId=u.id
      WHERE o.userId=? AND o.status='paid'
      ORDER BY o.createdAt DESC
    `, [userId]);
  },

  async getDetail(orderId) {
    const db = getDatabase();
    const order = await db.getFirstAsync(`
      SELECT o.*, u.fullName, u.username
      FROM Orders o
      JOIN Users u ON o.userId=u.id
      WHERE o.id=?
    `, [orderId]);

    if (!order) return null;
    
    const items = await db.getAllAsync(`
      SELECT od.*, p.name, p.imageUrl
      FROM OrderDetails od
      JOIN Products p ON od.productId=p.id
      WHERE od.orderId=?
    `, [orderId]);

    order.items = items;
    return order;
  },

  async getTotalSpent(userId) {
    const db = getDatabase();
    const result = await db.getFirstAsync(`
      SELECT SUM(totalAmount) as total 
      FROM Orders 
      WHERE userId=? AND status='paid'
    `, [userId]);
    return result?.total || 0;
  }
};

export default InvoiceModel;
