// @feature auth | @layer Controller
import UserModel from '../models/UserModel';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@movie/session_user';

const AuthController = {
  async login(username, password) {
    if (!username || !password) {
      return { success: false, message: 'Vui lòng nhập đầy đủ thông tin' };
    }
    try {
      const user = await UserModel.verifyCredentials(username, password);
      if (user) {
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return { success: true, user };
      } else {
        return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu' };
      }
    } catch (e) {
      console.error('[AuthController] login:', e);
      return { success: false, message: 'Đã xảy ra lỗi hệ thống' };
    }
  },

  async logout() {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      return { success: true };
    } catch (e) {
      console.error('[AuthController] logout:', e);
      return { success: false, message: e.message };
    }
  },

  async checkSession() {
    try {
      const stored = await AsyncStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Verify from DB again if needed, or simply return user
      const user = await UserModel.findById(parsed.id);
      return user || null;
    } catch (e) {
      console.error('[AuthController] checkSession:', e);
      return null;
    }
  },

  async register(username, password, fullName) {
    if (!username || !password) return { success: false, message: 'Tên đăng nhập và mật khẩu không được rỗng' };
    try {
      const existing = await UserModel.findByUsername(username);
      if (existing) return { success: false, message: 'Tên đăng nhập đã tồn tại' };

      const result = await UserModel.create({ username, password, fullName });
      return { success: true, insertId: result.insertId };
    } catch (e) {
      console.error('[AuthController] register:', e);
      return { success: false, message: 'Đã xảy ra lỗi hệ thống' };
    }
  }
};

export default AuthController;
