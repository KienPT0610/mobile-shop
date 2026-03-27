import { getDatabase } from '../../../core/db';
import TicketModel from '../models/TicketModel';
import ShowtimeModel from '../../movie/models/ShowtimeModel';

const PROMOTIONS = {
  CINE10: { type: 'percent', value: 10, maxDiscount: 50000, description: 'Giảm 10% — tối đa 50k 💕' },
  STUDENT20: { type: 'percent', value: 20, maxDiscount: 70000, description: 'Ưu đãi sinh viên —20% 🎓' },
  NIGHT30K: { type: 'flat', value: 30000, description: 'Suất khuya — giảm thẳng 30k 🌙' },
};

const TicketController = {
  getPromotions() {
    return PROMOTIONS;
  },

  calcDiscount({ subtotal, promoCode }) {
    const code = String(promoCode || '').trim().toUpperCase();
    const promo = PROMOTIONS[code];
    if (!promo || !subtotal || subtotal <= 0) return { valid: false, code: '', discount: 0, reason: 'Mã không hợp lệ.' };

    let discount = 0;
    if (promo.type === 'percent') {
      discount = Math.floor((subtotal * promo.value) / 100);
      if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
    } else {
      discount = promo.value;
    }
    discount = Math.min(discount, subtotal);
    return { valid: true, code, discount, promo };
  },

  async getTakenSeats(showtimeId) {
    try {
      const rows = await TicketModel.getByShowtimeId(showtimeId);
      const taken = new Set();
      rows.forEach((r) => {
        const seats = String(r.seatCodes || '').split(',').filter(Boolean);
        seats.forEach((s) => taken.add(s));
      });
      return [...taken];
    } catch (e) {
      console.error('[TicketController] getTakenSeats', e);
      return [];
    }
  },

  async bookTicket({ userId, showtimeId, seatCodes, seatPrice, promoCode, paymentMethod }) {
    if (!userId) return { success: false, message: 'Bạn cần đăng nhập để đặt vé nha 💕' };
    if (!seatCodes?.length) return { success: false, message: 'Chọn ít nhất một ghế xinh xắn đi nè!' };
    if (!paymentMethod) return { success: false, message: 'Chọn phương thức thanh toán trước nhé!' };

    const db = getDatabase();
    try {
      let ticketId = null;
      await db.withTransactionAsync(async () => {
        const showtime = await ShowtimeModel.getById(showtimeId);
        if (!showtime) throw new Error('Không tìm thấy suất chiếu.');
        if (showtime.availableSeats < seatCodes.length) throw new Error('Không đủ ghế trống rồi, thử suất khác nha!');

        const taken = await this.getTakenSeats(showtimeId);
        const isConflict = seatCodes.some((s) => taken.includes(s));
        if (isConflict) throw new Error('Co ghe vua duoc dat, vui long chon ghe khac.');

        const originalPrice = seatCodes.length * seatPrice;
        const promoResult = this.calcDiscount({ subtotal: originalPrice, promoCode });
        const discountAmount = promoResult.valid ? promoResult.discount : 0;
        const totalPrice = Math.max(0, originalPrice - discountAmount);
        ticketId = await TicketModel.create({
          userId,
          showtimeId,
          seatCodes,
          totalPrice,
          originalPrice,
          discountAmount,
          promoCode: promoResult.valid ? promoResult.code : null,
          paymentMethod,
        });
        await ShowtimeModel.reduceAvailableSeats(showtimeId, seatCodes.length);
      });

      const ticket = await TicketModel.getById(ticketId);
      return { success: true, ticket };
    } catch (e) {
      console.error('[TicketController] bookTicket', e);
      return { success: false, message: e.message || 'Đặt vé chưa thành công, thử lại sau nha!' };
    }
  },

  async getMyTickets(userId) {
    try {
      if (!userId) return [];
      return await TicketModel.getByUserId(userId);
    } catch (e) {
      console.error('[TicketController] getMyTickets', e);
      return [];
    }
  },

  async getTicketDetail(ticketId) {
    try {
      return await TicketModel.getById(ticketId);
    } catch (e) {
      console.error('[TicketController] getTicketDetail', e);
      return null;
    }
  },
};

export default TicketController;
