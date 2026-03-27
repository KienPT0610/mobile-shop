import { getDatabase } from '../../../core/db';

const TicketModel = {
  async create({ userId, showtimeId, seatCodes, totalPrice, originalPrice, discountAmount, promoCode, paymentMethod }) {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT INTO Tickets
      (userId, showtimeId, seatCodes, totalPrice, originalPrice, discountAmount, promoCode, paymentMethod, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        showtimeId,
        seatCodes.join(','),
        totalPrice,
        originalPrice ?? totalPrice,
        discountAmount ?? 0,
        promoCode ?? null,
        paymentMethod ?? 'Ví điện tử',
        'booked',
      ]
    );
    return result.lastInsertRowId;
  },

  async getByUserId(userId) {
    const db = getDatabase();
    return db.getAllAsync(
      `SELECT tk.*, m.title as movieTitle, t.name as theaterName, s.startTime, s.room
       FROM Tickets tk
       JOIN Showtimes s ON tk.showtimeId = s.id
       JOIN Movies m ON s.movieId = m.id
       JOIN Theaters t ON s.theaterId = t.id
       WHERE tk.userId=?
       ORDER BY tk.bookedAt DESC`,
      [userId]
    );
  },

  async getById(ticketId) {
    const db = getDatabase();
    return db.getFirstAsync(
      `SELECT tk.*, u.fullName, m.title as movieTitle, m.posterUrl, t.name as theaterName, t.address, s.startTime, s.room
       FROM Tickets tk
       JOIN Users u ON tk.userId = u.id
       JOIN Showtimes s ON tk.showtimeId = s.id
       JOIN Movies m ON s.movieId = m.id
       JOIN Theaters t ON s.theaterId = t.id
       WHERE tk.id=?`,
      [ticketId]
    );
  },

  async getByShowtimeId(showtimeId) {
    const db = getDatabase();
    return db.getAllAsync('SELECT seatCodes FROM Tickets WHERE showtimeId=? AND status=?', [showtimeId, 'booked']);
  },
};

export default TicketModel;
