import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Header from '../../../components/Header';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import MovieController from '../controllers/MovieController';
import { useApp } from '../../../context/AppContext';

export default function ShowtimeListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { state } = useApp();
  const { isLoggedIn } = state;

  const params = route.params || {};
  const [filterTheaterId, setFilterTheaterId] = useState(params.theaterId ?? null);
  const [filterMovieId, setFilterMovieId] = useState(params.movieId ?? null);
  const [showtimes, setShowtimes] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [movies, setMovies] = useState([]);

  useFocusEffect(
    useCallback(() => {
      MovieController.getTheaters().then(setTheaters);
      MovieController.getMovies().then(setMovies);
    }, [])
  );

  useEffect(() => {
    setFilterTheaterId(params.theaterId ?? null);
    setFilterMovieId(params.movieId ?? null);
  }, [params.theaterId, params.movieId]);

  useEffect(() => {
    MovieController.getShowtimes({
      theaterId: filterTheaterId || undefined,
      movieId: filterMovieId || undefined,
    }).then(setShowtimes);
  }, [filterTheaterId, filterMovieId]);

  const sections = useMemo(() => {
    const byMovie = {};
    showtimes.forEach((s) => {
      const key = s.movieTitle || 'Phim';
      if (!byMovie[key]) byMovie[key] = [];
      byMovie[key].push(s);
    });
    return Object.entries(byMovie)
      .sort((a, b) => a[0].localeCompare(b[0], 'vi'))
      .map(([title, data]) => ({
        title,
        data: [...data].sort((a, b) => String(a.startTime).localeCompare(String(b.startTime))),
      }));
  }, [showtimes]);

  const onBook = (showtimeId) => {
    if (!isLoggedIn) {
      Alert.alert('Chưa đăng nhập nè 🌸', 'Đăng nhập để chọn ghế và thanh toán nha!', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    navigation.navigate('SeatBooking', { showtimeId });
  };

  const subtitle = useMemo(() => {
    const parts = [];
    if (filterTheaterId) {
      const name = theaters.find((t) => t.id === filterTheaterId)?.name;
      parts.push(`Rạp: ${name || params.theaterName || '…'}`);
    }
    if (filterMovieId) {
      const title = movies.find((m) => m.id === filterMovieId)?.title;
      parts.push(`Phim: ${title || params.movieTitle || '…'}`);
    }
    if (parts.length === 0) return 'Chọn rạp / phim để lọc — hoặc xem toàn hệ thống';
    return parts.join(' • ');
  }, [filterTheaterId, filterMovieId, theaters, movies, params.theaterName, params.movieTitle]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.theaterLine}>{item.theaterName}</Text>
      <Text style={styles.meta}>
        {item.room} • {MovieController.formatTime(item.startTime)} • {item.format} • {item.language}
      </Text>
      <Text style={styles.seats}>Còn {item.availableSeats} ghế trống</Text>
      <TouchableOpacity style={styles.bookBtn} onPress={() => onBook(item.id)}>
        <Text style={styles.bookText}>Chọn suất này — đặt vé 💖</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Lịch chiếu 🎬" subtitle={subtitle} />

      <View style={styles.filterBlock}>
        <Text style={styles.filterLabel}>Lọc theo rạp</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <TouchableOpacity
            style={[styles.chip, filterTheaterId == null && styles.chipActive]}
            onPress={() => {
              setFilterTheaterId(null);
              navigation.setParams({ theaterId: undefined, theaterName: undefined });
            }}
          >
            <Text style={[styles.chipText, filterTheaterId == null && styles.chipTextActive]}>Tất cả rạp</Text>
          </TouchableOpacity>
          {theaters.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.chip, filterTheaterId === t.id && styles.chipActive]}
              onPress={() => setFilterTheaterId(t.id)}
            >
              <Text style={[styles.chipText, filterTheaterId === t.id && styles.chipTextActive]} numberOfLines={1}>
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.filterLabel, { marginTop: 10 }]}>Lọc theo phim</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <TouchableOpacity
            style={[styles.chip, filterMovieId == null && styles.chipActive]}
            onPress={() => {
              setFilterMovieId(null);
              navigation.setParams({ movieId: undefined, movieTitle: undefined });
            }}
          >
            <Text style={[styles.chipText, filterMovieId == null && styles.chipTextActive]}>Tất cả phim</Text>
          </TouchableOpacity>
          {movies.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.chip, filterMovieId === m.id && styles.chipActive]}
              onPress={() => setFilterMovieId(m.id)}
            >
              <Text style={[styles.chipText, filterMovieId === m.id && styles.chipTextActive]} numberOfLines={1}>
                {m.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>Không có suất nào khớp — thử đổi bộ lọc nha 🌸</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  filterBlock: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  filterLabel: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.text.secondary, marginBottom: 6 },
  chipRow: { paddingBottom: 4, flexDirection: 'row', alignItems: 'center' },
  chip: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    maxWidth: 200,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.text.secondary, fontWeight: '700', fontSize: 12 },
  chipTextActive: { color: COLORS.surface, fontWeight: '900' },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  sectionHeader: {
    fontSize: FONTS.sizes.md,
    fontWeight: '900',
    color: COLORS.text.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  theaterLine: { fontSize: FONTS.sizes.md, fontWeight: '900', color: COLORS.primary },
  meta: { marginTop: 4, color: COLORS.text.secondary, fontWeight: '600' },
  seats: { marginTop: 8, color: COLORS.text.primary, fontWeight: '800' },
  bookBtn: { marginTop: 10, backgroundColor: COLORS.primary, borderRadius: 14, alignItems: 'center', paddingVertical: 11 },
  bookText: { color: COLORS.surface, fontWeight: '900' },
  empty: { textAlign: 'center', color: COLORS.text.secondary, fontWeight: '600', paddingVertical: 40 },
});
