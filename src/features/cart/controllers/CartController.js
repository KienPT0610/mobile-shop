// @feature cart | @layer Controller
import OrderModel from '../models/OrderModel';
import OrderDetailModel from '../models/OrderDetailModel';

const CartController = {
  async addToCart({ userId, productId, quantity, unitPrice, productName, imageUrl }) {
    try {
      let order = await OrderModel.getPendingByUser(userId);
      if (!order) {
        const insertId = await OrderModel.create(userId);
        order = { id: insertId };
      }
      
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

  async getCart(userId) {
    try {
      const order = await OrderModel.getPendingByUser(userId);
      if (!order) return { orderId: null, items: [], total: 0 };
      
      const items = await OrderDetailModel.getByOrderId(order.id);
      return { orderId: order.id, items, total: order.totalAmount };
    } catch (e) {
      console.error('[CartController] getCart:', e);
      return { orderId: null, items: [], total: 0 };
    }
  },

  async updateQuantity({ orderDetailId, quantity, orderId, userId }) {
    try {
      await OrderDetailModel.updateQuantity(orderDetailId, quantity);
      await OrderModel.recalcTotal(orderId);
      return await this.getCart(userId);
    } catch (e) {
      console.error('[CartController] updateQuantity:', e);
      return await this.getCart(userId);
    }
  },

  async removeItem({ orderDetailId, orderId, userId }) {
    try {
      await OrderDetailModel.removeItem(orderDetailId);
      await OrderModel.recalcTotal(orderId);
      return await this.getCart(userId);
    } catch (e) {
      console.error('[CartController] removeItem:', e);
      return await this.getCart(userId);
    }
  },

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

  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }
};

export default CartController;
