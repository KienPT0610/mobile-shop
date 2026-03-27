import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../../../components/Header';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import MovieController from '../controllers/MovieController';

const SORT_OPTIONS = ['Mới nhất', 'Đánh giá cao', 'Giá vé thấp', 'Giá vé cao'];

export default function MovieListScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [allMovies, setAllMovies] = useState([]);
  const [typingKeyword, setTypingKeyword] = useState('');
  const [activeGenre, setActiveGenre] = useState('Tất cả');
  const [sortMode, setSortMode] = useState('Mới nhất');

  const loadMovies = async () => {
    const data = await MovieController.getMovies();
    setAllMovies(data);
  };

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(typingKeyword), 260);
    return () => clearTimeout(timer);
  }, [typingKeyword]);

  const genres = useMemo(() => {
    const unique = [...new Set(allMovies.map((m) => m.genre).filter(Boolean))];
    return ['Tất cả', ...unique];
  }, [allMovies]);

  const movies = useMemo(() => {
    let result = [...allMovies];
    const key = search.trim().toLowerCase();
    if (key) {
      result = result.filter((m) => `${m.title} ${m.genre}`.toLowerCase().includes(key));
    }
    if (activeGenre !== 'Tất cả') {
      result = result.filter((m) => m.genre === activeGenre);
    }
    if (sortMode === 'Đánh giá cao') result.sort((a, b) => b.rating - a.rating);
    if (sortMode === 'Giá vé thấp') result.sort((a, b) => a.basePrice - b.basePrice);
    if (sortMode === 'Giá vé cao') result.sort((a, b) => b.basePrice - a.basePrice);
    if (sortMode === 'Mới nhất') result.sort((a, b) => b.id - a.id);
    return result;
  }, [allMovies, search, activeGenre, sortMode]);

  return (
    <View style={styles.container}>
      <Header title="Danh sách phim 🎞️" subtitle="Tìm kiếm & lọc như rạp thật nè" />
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔎</Text>
        <TextInput
          value={typingKeyword}
          onChangeText={setTypingKeyword}
          placeholder="Tìm tên phim, thể loại..."
          placeholderTextColor={COLORS.text.light}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.filterArea}>
        <Text style={styles.filterLabel}>Thể loại</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {genres.map((genre) => (
            <TouchableOpacity key={genre} style={[styles.chip, activeGenre === genre && styles.chipActive]} onPress={() => setActiveGenre(genre)}>
              <Text style={[styles.chipText, activeGenre === genre && styles.chipTextActive]}>{genre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={[styles.filterLabel, { marginTop: 10 }]}>Sắp xếp</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginTop: 6 }}>
          {SORT_OPTIONS.map((s) => (
            <TouchableOpacity key={s} style={[styles.chip, sortMode === s && styles.chipActive]} onPress={() => setSortMode(s)}>
              <Text style={[styles.chipText, sortMode === s && styles.chipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Không tìm thấy phim nào khớp — thử từ khóa khác nha 🌸</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}>
              <Image source={{ uri: item.posterUrl }} style={styles.poster} />
              <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>
                  {item.genre} • {item.duration} phút
                </Text>
                <Text style={styles.meta}>⭐ {item.rating}</Text>
                <Text style={styles.price}>Từ {MovieController.formatPrice(item.basePrice)}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.scheduleLink}
              onPress={() => navigation.navigate('Showtimes', { movieId: item.id, movieTitle: item.title })}
            >
              <Text style={styles.scheduleLinkText}>📅 Lịch chiếu toàn hệ thống — chọn rạp & suất</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchWrap: {
    margin: 20,
    marginBottom: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, height: 46, color: COLORS.text.primary, fontWeight: '600' },
  filterArea: { paddingHorizontal: 20, paddingBottom: 8 },
  filterLabel: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.text.secondary, marginBottom: 4 },
  chip: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.text.secondary, fontWeight: '700', fontSize: 12 },
  chipTextActive: { color: COLORS.surface, fontWeight: '900' },
  list: { paddingHorizontal: 20, paddingBottom: 110 },
  empty: { textAlign: 'center', color: COLORS.text.secondary, fontWeight: '600', paddingVertical: 40, paddingHorizontal: 20 },
  cardWrap: { marginBottom: 14 },
  scheduleLink: {
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scheduleLinkText: { color: COLORS.text.primary, fontWeight: '800', fontSize: FONTS.sizes.sm },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    flexDirection: 'row',
    padding: 10,
  },
  poster: { width: 90, height: 120, borderRadius: 14, backgroundColor: COLORS.background },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  title: { fontSize: FONTS.sizes.md, fontWeight: '900', color: COLORS.text.primary },
  meta: { color: COLORS.text.secondary, fontWeight: '600', marginTop: 3 },
  price: { color: COLORS.primary, fontWeight: '900', marginTop: 4 },
});
