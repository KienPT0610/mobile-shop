// @feature catalog | @layer Screen
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import CatalogController from '../controllers/CatalogController';
import ProductCard from '../components/ProductCard';
import Header from '../../../components/Header';

const STOCK_FILTERS = ['Tất cả 💕', 'Còn hàng ✨', 'Sắp hết hàng ⏰'];
const SORT_FILTERS = ['Mới nhất 🆕', 'Giá tăng 📈', 'Giá giảm 📉', 'Tên A-Z 🔤'];
const PRICE_FILTERS = ['Mọi giá 💗', 'Dưới 500k 🐣', '500k-2tr 🌸', 'Trên 2tr 👑'];

export default function ProductListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId, categoryName, keyword } = route.params || {};

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState(keyword || '');
  const [activeStockFilter, setActiveStockFilter] = useState('Tất cả 💕');
  const [activeSort, setActiveSort] = useState('Mới nhất 🆕');
  const [activePriceFilter, setActivePriceFilter] = useState('Mọi giá 💗');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    let data = [];
    if (categoryId) data = await CatalogController.getProductsByCategory(categoryId);
    else data = await CatalogController.getProducts();
    setProducts(data);
    applyFilter(data, search, activeStockFilter, activeSort, activePriceFilter);
  };

  useEffect(() => { loadData(); }, [categoryId]);

  useEffect(() => {
    if (typeof keyword === 'string') {
      setSearch(keyword);
      applyFilter(products, keyword, activeStockFilter, activeSort, activePriceFilter);
    }
  }, [keyword]);

  const applyFilter = (source, keywordText, stockFilter, sortOpt, priceFilter) => {
    let res = [...source];
    if (keywordText) {
      const key = keywordText.toLowerCase().trim();
      res = res.filter(p =>
        p.name.toLowerCase().includes(key) ||
        (p.categoryName || '').toLowerCase().includes(key)
      );
    }
    if (stockFilter === 'Còn hàng ✨') res = res.filter(p => p.stock > 0);
    if (stockFilter === 'Sắp hết hàng ⏰') res = res.filter(p => p.stock > 0 && p.stock <= 10);

    if (priceFilter === 'Dưới 500k 🐣') res = res.filter(p => p.price < 500000);
    if (priceFilter === '500k-2tr 🌸') res = res.filter(p => p.price >= 500000 && p.price <= 2000000);
    if (priceFilter === 'Trên 2tr 👑') res = res.filter(p => p.price > 2000000);

    if (sortOpt === 'Giá tăng 📈') res.sort((a, b) => a.price - b.price);
    if (sortOpt === 'Giá giảm 📉') res.sort((a, b) => b.price - a.price);
    if (sortOpt === 'Tên A-Z 🔤') res.sort((a, b) => a.name.localeCompare(b.name));
    if (sortOpt === 'Mới nhất 🆕') res.sort((a, b) => b.id - a.id);
    setFiltered(res);
  };

  const onSearch = (text) => {
    setSearch(text);
    applyFilter(products, text, activeStockFilter, activeSort, activePriceFilter);
  };

  const onFilterStock = (f) => {
    setActiveStockFilter(f);
    applyFilter(products, search, f, activeSort, activePriceFilter);
  };

  const onFilterSort = (f) => {
    setActiveSort(f);
    applyFilter(products, search, activeStockFilter, f, activePriceFilter);
  };

  const onFilterPrice = (f) => {
    setActivePriceFilter(f);
    applyFilter(products, search, activeStockFilter, activeSort, f);
  };

  const resetFilters = () => {
    setSearch('');
    setActiveStockFilter('Tất cả 💕');
    setActiveSort('Mới nhất 🆕');
    setActivePriceFilter('Mọi giá 💗');
    applyFilter(products, '', 'Tất cả 💕', 'Mới nhất 🆕', 'Mọi giá 💗');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Header 
        title={categoryName || 'Tất cả sản phẩm 🛍️'} 
        subtitle="Dễ thương không cưỡng nổi" 
        showBack={true} 
      />

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔎</Text>
        <TextInput 
          style={styles.searchInput}
          placeholder="Tìm món đồ xinh xắn..."
          placeholderTextColor={COLORS.text.light}
          value={search}
          onChangeText={onSearch}
        />
      </View>

      <View style={styles.filterWrap}>
        <View style={styles.filterHeading}>
          <Text style={styles.filterTitle}>Lọc nhẹ nhàng nè ✨</Text>
          <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STOCK_FILTERS}
          keyExtractor={item => item}
          renderItem={({item}) => (
            <TouchableOpacity 
              style={[styles.filterChip, activeStockFilter === item && styles.filterActive]}
              onPress={() => onFilterStock(item)}
            >
              <Text style={[styles.filterText, activeStockFilter === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={PRICE_FILTERS}
          keyExtractor={item => item}
          contentContainerStyle={styles.secondFilterRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, activePriceFilter === item && styles.filterActive]}
              onPress={() => onFilterPrice(item)}
            >
              <Text style={[styles.filterText, activePriceFilter === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={SORT_FILTERS}
          keyExtractor={item => item}
          contentContainerStyle={styles.secondFilterRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeSort === item && styles.filterActive]}
              onPress={() => onFilterSort(item)}
            >
              <Text style={[styles.filterText, activeSort === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌸</Text>
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào nha</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard 
            product={item} 
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchWrap: {
    flexDirection: 'row', paddingHorizontal: 20, backgroundColor: COLORS.surface,
    marginHorizontal: 20, marginTop: 20, borderRadius: 24, alignItems: 'center', height: 50,
    borderWidth: 2, borderColor: COLORS.secondary,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2
  },
  searchIcon: { fontSize: 20, marginRight: 15 },
  searchInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text.primary, fontWeight: '500' },
  filterWrap: { paddingHorizontal: 20, paddingVertical: 15 },
  filterHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  filterTitle: { color: COLORS.text.secondary, fontSize: FONTS.sizes.sm, fontWeight: '900' },
  resetBtn: { backgroundColor: COLORS.secondary, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  resetText: { color: COLORS.text.primary, fontSize: FONTS.sizes.sm, fontWeight: '900' },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, backgroundColor: COLORS.surface,
    borderWidth: 2, borderColor: COLORS.border,
    marginRight: 10,
  },
  secondFilterRow: { paddingTop: 10 },
  filterActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.text.secondary, fontSize: FONTS.sizes.sm, fontWeight: 'bold' },
  filterTextActive: { color: COLORS.surface },
  list: { paddingHorizontal: 20, paddingBottom: 110 },
  row: { justifyContent: 'space-between' },
  empty: { marginTop: 80, alignItems: 'center' },
  emptyIcon: { fontSize: 60, marginBottom: 15 },
  emptyText: { color: COLORS.text.secondary, fontSize: FONTS.sizes.md, fontWeight: 'bold' }
});
