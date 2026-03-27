import { getDatabase } from '../../../core/db';

const MovieModel = {
  async getAll() {
    const db = getDatabase();
    return db.getAllAsync('SELECT * FROM Movies ORDER BY id DESC');
  },

  async getById(id) {
    const db = getDatabase();
    return db.getFirstAsync('SELECT * FROM Movies WHERE id=?', [id]);
  },

  async search(keyword) {
    const db = getDatabase();
    return db.getAllAsync('SELECT * FROM Movies WHERE title LIKE ? ORDER BY id DESC', [`%${keyword}%`]);
  },
};

export default MovieModel;
