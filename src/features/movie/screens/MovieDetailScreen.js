import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../../../components/Header';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import MovieController from '../controllers/MovieController';
import { useApp } from '../../../context/AppContext';

export default function MovieDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { movieId } = route.params;
  const { state } = useApp();
  const { isLoggedIn } = state;

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedTheaterId, setSelectedTheaterId] = useState(null);

  useEffect(() => {
    MovieController.getMovieDetail(movieId).then(setMovie);
    MovieController.getShowtimes({ movieId }).then((rows) => {
      setShowtimes(rows);
      setSelectedTheaterId(null);
    });
  }, [movieId]);

  const theatersInMovie = useMemo(() => {
    const map = new Map();
    showtimes.forEach((s) => {
      if (!map.has(s.theaterId)) {
        map.set(s.theaterId, { id: s.theaterId, name: s.theaterName, address: s.address, city: s.city });
      }
    });
    return [...map.values()];
  }, [showtimes]);

  const showtimesAtTheater = useMemo(() => {
    if (selectedTheaterId == null) return [];
    return showtimes.filter((s) => s.theaterId === selectedTheaterId).sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
  }, [showtimes, selectedTheaterId]);

  const selectedTheater = theatersInMovie.find((t) => t.id === selectedTheaterId);

  const goBook = (showtimeId) => {
    if (!isLoggedIn) {
      Alert.alert('Chưa đăng nhập nè 🌸', 'Đăng nhập để chọn ghế và thanh toán nha!', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    navigation.navigate('SeatBooking', { showtimeId });
  };

  if (!movie) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <Header title="Chi tiết phim 🎬" showBack={true} />
      <ScrollView contentContainerStyle={styles.content}>
        <ImageBackground source={{ uri: movie.posterUrl }} style={styles.banner} imageStyle={styles.bannerImg}>
          <View style={styles.overlay} />
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.subtitle}>
            {movie.genre} • {movie.duration} phút • ⭐ {movie.rating}
          </Text>
        </ImageBackground>

        <Text style={styles.description}>{movie.description}</Text>
        <Text style={styles.price}>Giá vé từ {MovieController.formatPrice(movie.basePrice)}</Text>

        <Text style={styles.flowHint}>Đặt vé đúng quy trình rạp: chọn rạp → chọn suất → chọn ghế 💕</Text>

        <Text style={styles.section}>Bước 1 — Chọn rạp chiếu 🏢</Text>
        {theatersInMovie.length === 0 ? (
          <Text style={styles.empty}>Chưa có suất chiếu cho phim này — xem tab Lịch chiếu sau nhé!</Text>
        ) : (
          theatersInMovie.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.theaterChip, selectedTheaterId === t.id && styles.theaterChipActive]}
              onPress={() => setSelectedTheaterId(t.id)}
            >
              <Text style={[styles.theaterName, selectedTheaterId === t.id && styles.theaterNameActive]}>{t.name}</Text>
              <Text style={styles.theaterAddr}>{t.address}</Text>
              {selectedTheaterId === t.id ? <Text style={styles.picked}>✓ Đang chọn</Text> : null}
            </TouchableOpacity>
          ))
        )}

        {selectedTheaterId != null && (
          <>
            <Text style={styles.section}>Bước 2 — Suất chiếu tại “{selectedTheater?.name}” ⏰</Text>
            {showtimesAtTheater.map((s) => (
              <TouchableOpacity key={s.id} style={styles.showtimeItem} onPress={() => goBook(s.id)}>
                <Text style={styles.showtimeTime}>{MovieController.formatTime(s.startTime)}</Text>
                <Text style={styles.showtimeSub}>
                  {s.room} • {s.format} • {s.language} • Còn {s.availableSeats} ghế
                </Text>
                <Text style={styles.pickSeat}>Chọn suất này → đặt vé 🎟️</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  banner: { height: 220, borderRadius: 20, overflow: 'hidden', justifyContent: 'flex-end', padding: 15 },
  bannerImg: { borderRadius: 20 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.38)' },
  title: { color: COLORS.surface, fontSize: FONTS.sizes.xl, fontWeight: '900' },
  subtitle: { color: COLORS.surface, marginTop: 5, fontWeight: '600' },
  description: { marginTop: 14, color: COLORS.text.primary, lineHeight: 22, fontWeight: '500' },
  price: { marginTop: 10, color: COLORS.primary, fontWeight: '900' },
  flowHint: {
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text.primary,
    fontWeight: '600',
    fontSize: FONTS.sizes.sm,
  },
  section: { marginTop: 18, marginBottom: 10, fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.text.primary },
  empty: { color: COLORS.text.secondary, fontWeight: '600' },
  theaterChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  theaterChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.background },
  theaterName: { fontWeight: '900', color: COLORS.text.primary, fontSize: FONTS.sizes.md },
  theaterNameActive: { color: COLORS.primary },
  theaterAddr: { marginTop: 4, color: COLORS.text.secondary, fontSize: FONTS.sizes.sm, fontWeight: '500' },
  picked: { marginTop: 8, color: COLORS.primary, fontWeight: '900', fontSize: 12 },
  showtimeItem: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  showtimeTime: { color: COLORS.text.primary, fontWeight: '900', fontSize: FONTS.sizes.lg },
  showtimeSub: { marginTop: 6, color: COLORS.text.secondary, fontWeight: '600' },
  pickSeat: { marginTop: 8, color: COLORS.primary, fontWeight: '800', fontSize: FONTS.sizes.sm },
});
