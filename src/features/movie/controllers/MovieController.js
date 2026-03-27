import MovieModel from '../models/MovieModel';
import TheaterModel from '../models/TheaterModel';
import ShowtimeModel from '../models/ShowtimeModel';

const MovieController = {
  async getMovies() {
    try {
      return await MovieModel.getAll();
    } catch (e) {
      console.error('[MovieController] getMovies', e);
      return [];
    }
  },

  async searchMovies(keyword) {
    try {
      if (!keyword?.trim()) return await MovieModel.getAll();
      return await MovieModel.search(keyword.trim());
    } catch (e) {
      console.error('[MovieController] searchMovies', e);
      return [];
    }
  },

  async getMovieDetail(id) {
    try {
      return await MovieModel.getById(id);
    } catch (e) {
      console.error('[MovieController] getMovieDetail', e);
      return null;
    }
  },

  async getTheaters() {
    try {
      return await TheaterModel.getAll();
    } catch (e) {
      console.error('[MovieController] getTheaters', e);
      return [];
    }
  },

  /**
   * Lịch chiếu: có thể lọc theo phim và/hoặc rạp (đúng nghiệp vụ rạp).
   * @param {{ movieId?: number, theaterId?: number } | number | null} filters — hỗ trợ cách gọi cũ getShowtimes(movieId)
   */
  async getShowtimes(filters = null) {
    try {
      let movieId;
      let theaterId;
      if (typeof filters === 'number') {
        movieId = filters;
      } else if (filters && typeof filters === 'object') {
        movieId = filters.movieId;
        theaterId = filters.theaterId;
      }
      if (movieId && theaterId) return await ShowtimeModel.getByMovieAndTheater(movieId, theaterId);
      if (movieId) return await ShowtimeModel.getByMovieId(movieId);
      if (theaterId) return await ShowtimeModel.getByTheaterId(theaterId);
      return await ShowtimeModel.getAll();
    } catch (e) {
      console.error('[MovieController] getShowtimes', e);
      return [];
    }
  },

  async getShowtimeDetail(showtimeId) {
    try {
      return await ShowtimeModel.getById(showtimeId);
    } catch (e) {
      console.error('[MovieController] getShowtimeDetail', e);
      return null;
    }
  },

  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  },

  formatTime(value) {
    const d = new Date(value.replace(' ', 'T'));
    return d.toLocaleString('vi-VN', { hour12: false });
  },
};

export default MovieController;
