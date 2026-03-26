// @feature catalog | @layer Model
import { getDatabase } from '../../../core/db';

const CategoryModel = {
  async getAll() {
    const db = getDatabase();
    return db.getAllAsync('SELECT * FROM Categories ORDER BY name');
  },

  async getById(id) {
    const db = getDatabase();
    return db.getFirstAsync('SELECT * FROM Categories WHERE id=?', [id]);
  }
};

export default CategoryModel;
