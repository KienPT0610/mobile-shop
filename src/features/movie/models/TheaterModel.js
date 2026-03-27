import { getDatabase } from '../../../core/db';

const TheaterModel = {
  async getAll() {
    const db = getDatabase();
    return db.getAllAsync('SELECT * FROM Theaters ORDER BY id ASC');
  },
};

export default TheaterModel;
