// @feature catalog | @layer Screen
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import CatalogController from '../controllers/CatalogController';
import ProductCard from '../components/ProductCard';
import Header from '../../../components/Header';

const FILTERS = ['Tất cả 💕', 'Còn hàng ✨', 'Giá tăng 📈', 'Giá giảm 📉'];

export default function ProductListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId, categoryName } = route.params || {};

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả 💕');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    let data = [];
    if (categoryId) data = await CatalogController.getProductsByCategory(categoryId);
    else data = await CatalogController.getProducts();
    setProducts(data);
    applyFilter(data, search, activeFilter);
  };

  useEffect(() => { loadData(); }, [categoryId]);

  const applyFilter = (source, keyword, filterOpt) => {
    let res = [...source];
    if (keyword) {
      res = res.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
    }
    if (filterOpt === 'Còn hàng ✨') res = res.filter(p => p.stock > 0);
    if (filterOpt === 'Giá tăng 📈') res.sort((a,b) => a.price - b.price);
    if (filterOpt === 'Giá giảm 📉') res.sort((a,b) => b.price - a.price);
    setFiltered(res);
  };

  const onSearch = (text) => {
    setSearch(text);
    applyFilter(products, text, activeFilter);
  };

  const onFilter = (f) => {
    setActiveFilter(f);
    applyFilter(products, search, f);
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
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={item => item}
          renderItem={({item}) => (
            <TouchableOpacity 
              style={[styles.filterChip, activeFilter === item && styles.filterActive]}
              onPress={() => onFilter(item)}
            >
              <Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>{item}</Text>
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
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, backgroundColor: COLORS.surface,
    borderWidth: 2, borderColor: COLORS.border,
    marginRight: 10,
  },
  filterActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.text.secondary, fontSize: FONTS.sizes.sm, fontWeight: 'bold' },
  filterTextActive: { color: COLORS.surface },
  list: { paddingHorizontal: 20, paddingBottom: 110 },
  row: { justifyContent: 'space-between' },
  empty: { marginTop: 80, alignItems: 'center' },
  emptyIcon: { fontSize: 60, marginBottom: 15 },
  emptyText: { color: COLORS.text.secondary, fontSize: FONTS.sizes.md, fontWeight: 'bold' }
});
