// @feature catalog | @layer Controller
import CategoryModel from '../models/CategoryModel';
import ProductModel from '../models/ProductModel';

const CatalogController = {
  async getCategories() {
    try {
      return await CategoryModel.getAll();
    } catch (e) {
      console.error('[CatalogController] getCategories:', e);
      return [];
    }
  },

  async getProducts() {
    try {
      return await ProductModel.getAll();
    } catch (e) {
      console.error('[CatalogController] getProducts:', e);
      return [];
    }
  },

  async getProductsByCategory(catId) {
    try {
      return await ProductModel.getByCategoryId(catId);
    } catch (e) {
      console.error('[CatalogController] getProductsByCategory:', e);
      return [];
    }
  },

  async getProductById(id) {
    try {
      return await ProductModel.getById(id);
    } catch (e) {
      console.error('[CatalogController] getProductById:', e);
      return null;
    }
  },

  async searchProducts(keyword) {
    if (!keyword?.trim()) return await this.getProducts();
    try {
      return await ProductModel.searchByName(keyword.trim());
    } catch (e) {
      console.error('[CatalogController] searchProducts:', e);
      return [];
    }
  },

  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }
};

export default CatalogController;
