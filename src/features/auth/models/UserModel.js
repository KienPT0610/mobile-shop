// @feature auth | @layer Model
import { getDatabase } from '../../../core/db';

const UserModel = {
  async findByUsername(username) {
    const db = getDatabase();
    return db.getFirstAsync('SELECT * FROM Users WHERE username=?', [username]);
  },

  async findById(id) {
    const db = getDatabase();
    return db.getFirstAsync('SELECT * FROM Users WHERE id=?', [id]);
  },

  async create({ username, password, fullName }) {
    const db = getDatabase();
    const result = await db.runAsync('INSERT INTO Users (username, password, fullName) VALUES (?, ?, ?)', 
      [username, password, fullName]);
    return { insertId: result.lastInsertRowId };
  },

  async verifyCredentials(username, password) {
    const db = getDatabase();
    return db.getFirstAsync('SELECT id, username, fullName FROM Users WHERE username=? AND password=?', 
      [username, password]);
  }
};

export default UserModel;
