// @feature cart | @layer Model
import { getDatabase } from '../../../core/db';

const OrderDetailModel = {
  async addItem({ orderId, productId, quantity, unitPrice }) {
    const db = getDatabase();
    const existing = await db.getFirstAsync("SELECT id, quantity FROM OrderDetails WHERE orderId=? AND productId=?", [orderId, productId]);
    
    if (existing) {
      const newQty = existing.quantity + quantity;
      await db.runAsync("UPDATE OrderDetails SET quantity=? WHERE id=?", [newQty, existing.id]);
      return existing.id;
    } else {
      const addRes = await db.runAsync("INSERT INTO OrderDetails (orderId, productId, quantity, unitPrice) VALUES (?, ?, ?, ?)", 
        [orderId, productId, quantity, unitPrice]);
      return addRes.lastInsertRowId;
    }
  },

  async getByOrderId(orderId) {
    const db = getDatabase();
    return db.getAllAsync(`
      SELECT od.*, p.name, p.imageUrl 
      FROM OrderDetails od
      JOIN Products p ON od.productId=p.id
      WHERE od.orderId=?
    `, [orderId]);
  },

  async removeItem(orderDetailId) {
    const db = getDatabase();
    await db.runAsync("DELETE FROM OrderDetails WHERE id=?", [orderDetailId]);
    return true;
  },

  async updateQuantity(orderDetailId, quantity) {
    const db = getDatabase();
    await db.runAsync("UPDATE OrderDetails SET quantity=? WHERE id=?", [quantity, orderDetailId]);
    return true;
  },

  async clearOrder(orderId) {
    const db = getDatabase();
    await db.runAsync("DELETE FROM OrderDetails WHERE orderId=?", [orderId]);
    return true;
  }
};

export default OrderDetailModel;
