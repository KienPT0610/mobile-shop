// @feature catalog | @layer Screen
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import { useApp } from '../../../context/AppContext';
import CatalogController from '../controllers/CatalogController';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import Header from '../../../components/Header';

const { width } = Dimensions.get('window');
const BANNERS = [
  { id: '1', color: '#FFB6C1', text: '🌟 Siêu sale 9.9 - Giảm 50%', emoji: '🎊' },
  { id: '2', color: '#FFD1DC', text: '🧸 Freeship mọi đơn hàng', emoji: '🚚' },
  { id: '3', color: '#A8E6CF', text: '🐰 Hàng mới về - Mua ngay', emoji: '🛍️' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { state } = useApp();
  const { user, isLoggedIn } = state;

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  
  const bannerRef = useRef(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      let next = bannerIndex + 1;
      if (next >= BANNERS.length) next = 0;
      setBannerIndex(next);
      bannerRef.current?.scrollToIndex({ index: next, animated: true });
    }, 3000);
    return () => clearInterval(timer);
  }, [bannerIndex]);

  useFocusEffect(
    React.useCallback(() => {
      CatalogController.getCategories().then(setCategories);
      CatalogController.getProducts().then(res => setProducts(res.slice(0, 6))); 
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Sử dụng global Header */}
      <Header 
        title={isLoggedIn ? `Xin chào, ${user?.fullName} 🧸` : 'Khám phá ShopEase 🐰'}
        subtitle="Hôm nay bạn muốn mua gì nào?"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <FlatList
            ref={bannerRef}
            data={BANNERS}
            keyExtractor={item => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.bannerSlide, { backgroundColor: item.color }]}>
                <Text style={styles.bannerEmoji}>{item.emoji}</Text>
                <Text style={styles.bannerText}>{item.text}</Text>
              </View>
            )}
          />
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh mục yêu thích 🥰</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Categories')} style={styles.seeAllBtn}>
            <Text style={styles.seeAll}>Tất cả</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <View style={{ marginRight: 15 }}>
              <CategoryCard 
                category={item} 
                onPress={() => navigation.navigate('ProductList', { categoryId: item.id, categoryName: item.name })}
              />
            </View>
          )}
        />

        {/* Featured Products Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sản phẩm nổi bật 🌟</Text>
        </View>
        <View style={styles.productGrid}>
          {products.map(item => (
            <ProductCard 
              key={item.id} 
              product={item} 
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            />
          ))}
        </View>
        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  bannerContainer: { height: 160, marginBottom: 25, marginTop: 15 },
  bannerSlide: {
    width: width - 40,
    height: 150,
    marginHorizontal: 20,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 2,
    borderColor: COLORS.surface
  },
  bannerEmoji: { fontSize: 40, marginBottom: 5 },
  bannerText: { color: COLORS.text.primary, fontSize: FONTS.sizes.lg, fontWeight: '900', textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.text.primary },
  seeAllBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  seeAll: { color: COLORS.text.primary, fontSize: FONTS.sizes.sm, fontWeight: 'bold' },
  categoryList: { paddingHorizontal: 20, paddingBottom: 20 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 }
});
