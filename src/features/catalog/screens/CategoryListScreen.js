// @feature catalog | @layer Screen
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import CatalogController from '../controllers/CatalogController';
import CategoryCard from '../components/CategoryCard';
import Header from '../../../components/Header';

export default function CategoryListScreen() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const data = await CatalogController.getCategories();
    setCategories(data);
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map(i => <View key={i} style={styles.skeleton} />)}
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📦🎀</Text>
        <Text style={styles.emptyText}>Chưa có danh mục nào</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Tất cả danh mục 🌸" subtitle="Rất nhiều đồ dễ thương nha" />

      <FlatList
        data={categories}
        numColumns={2}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <CategoryCard 
            category={item} 
            onPress={() => navigation.navigate('ProductList', { categoryId: item.id, categoryName: item.name })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 20, paddingBottom: 110 },
  row: { justifyContent: 'space-between', marginBottom: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyIcon: { fontSize: 60, marginBottom: 20 },
  emptyText: { color: COLORS.text.secondary, fontSize: FONTS.sizes.md, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  skeleton: { width: 156, height: 156, borderRadius: 24, backgroundColor: COLORS.border, marginBottom: 20 }
});
