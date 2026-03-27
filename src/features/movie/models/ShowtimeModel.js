import { getDatabase } from '../../../core/db';

const baseQuery = `
  SELECT s.*, m.title as movieTitle, m.posterUrl, m.basePrice, t.name as theaterName, t.address, t.city
  FROM Showtimes s
  JOIN Movies m ON m.id = s.movieId
  JOIN Theaters t ON t.id = s.theaterId
`;

const ShowtimeModel = {
  async getAll() {
    const db = getDatabase();
    return db.getAllAsync(`${baseQuery} ORDER BY s.startTime ASC`);
  },

  async getByMovieId(movieId) {
    const db = getDatabase();
    return db.getAllAsync(`${baseQuery} WHERE s.movieId=? ORDER BY s.startTime ASC`, [movieId]);
  },

  async getByTheaterId(theaterId) {
    const db = getDatabase();
    return db.getAllAsync(`${baseQuery} WHERE s.theaterId=? ORDER BY s.startTime ASC`, [theaterId]);
  },

  async getByMovieAndTheater(movieId, theaterId) {
    const db = getDatabase();
    return db.getAllAsync(
      `${baseQuery} WHERE s.movieId=? AND s.theaterId=? ORDER BY s.startTime ASC`,
      [movieId, theaterId]
    );
  },

  async getById(showtimeId) {
    const db = getDatabase();
    return db.getFirstAsync(`${baseQuery} WHERE s.id=?`, [showtimeId]);
  },

  async reduceAvailableSeats(showtimeId, qty) {
    const db = getDatabase();
    await db.runAsync(
      'UPDATE Showtimes SET availableSeats = availableSeats - ? WHERE id=? AND availableSeats >= ?',
      [qty, showtimeId, qty]
    );
  },
};

export default ShowtimeModel;
