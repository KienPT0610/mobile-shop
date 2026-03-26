// @feature invoice | @layer Controller
import InvoiceModel from '../models/InvoiceModel';

const InvoiceController = {
  async getInvoices(userId) {
    try {
      return await InvoiceModel.getPaidByUser(userId);
    } catch (e) {
      console.error('[InvoiceController] getInvoices:', e);
      return [];
    }
  },

  async getInvoiceDetail(orderId) {
    try {
      return await InvoiceModel.getDetail(orderId);
    } catch (e) {
      console.error('[InvoiceController] getInvoiceDetail:', e);
      return null;
    }
  },

  async getTotalSpent(userId) {
    try {
      return await InvoiceModel.getTotalSpent(userId);
    } catch (e) {
      console.error('[InvoiceController] getTotalSpent:', e);
      return 0;
    }
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split(' ');
      const dateParts = parts[0].split('-');
      const timeParts = parts[1] ? parts[1].substr(0, 5) : '';
      return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]} ${timeParts}`.trim();
    } catch {
      return dateStr;
    }
  },

  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  },

  generateShareText(invoice) {
    return `🧾 HÓA ĐƠN #${String(invoice.id).padStart(4,'0')}\n` +
           `Khách hàng: ${invoice.fullName}\n` +
           `Ngày: ${this.formatDate(invoice.createdAt)}\n` +
           `---\n` +
           invoice.items.map(i => `${i.name} x${i.quantity}: ${this.formatPrice(i.quantity*i.unitPrice)}`).join('\n') +
           `\n---\nTổng cộng: ${this.formatPrice(invoice.totalAmount)}`;
  }
};

export default InvoiceController;
