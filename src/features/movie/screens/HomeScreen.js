import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from '../../../components/Header';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import MovieController from '../controllers/MovieController';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  useFocusEffect(
    useCallback(() => {
      MovieController.getMovies().then((data) => setMovies(data.slice(0, 3)));
      MovieController.getShowtimes().then((data) => setShowtimes(data.slice(0, 3)));
    }, [])
  );

  return (
    <View style={styles.container}>
      <Header title="Rạp xinh CineBooking 🎬" subtitle="Đặt vé nhanh — chọn ghế là xong!" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Tối nay xem gì nè? ✨</Text>
          <Text style={styles.heroSub}>Chọn phim, chọn rạp, chốt vé trong một phút thôi 💕</Text>
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('Movies')}>
              <Text style={styles.heroBtnText}>🎞️ Phim đang chiếu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.heroBtn, styles.secondaryBtn]} onPress={() => navigation.navigate('Theaters')}>
              <Text style={[styles.heroBtnText, { color: COLORS.text.primary }]}>🏢 Chọn rạp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.heroBtn, styles.secondaryBtn]} onPress={() => navigation.navigate('Showtimes')}>
              <Text style={[styles.heroBtnText, { color: COLORS.text.primary }]}>⏰ Lịch chiếu</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Phim đang hot nè 🔥</Text>
        {movies.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}>
            <ImageBackground source={{ uri: item.posterUrl }} style={styles.movieCard} imageStyle={styles.movieCardImage}>
              <View style={styles.overlay} />
              <Text style={styles.movieTitle}>{item.title}</Text>
              <Text style={styles.movieMeta}>
                {item.genre} • {item.duration} phút • ⭐ {item.rating}
              </Text>
            </ImageBackground>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Suất sắp tới nè ⏰</Text>
        {showtimes.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.showtimeCard}
            onPress={() => navigation.navigate('MovieDetail', { movieId: item.movieId })}
          >
            <Text style={styles.showtimeMovie}>{item.movieTitle}</Text>
            <Text style={styles.showtimeMeta}>
              {item.theaterName} • {MovieController.formatTime(item.startTime)}
            </Text>
            <Text style={styles.showtimeSeats}>
              Còn {item.availableSeats}/{item.totalSeats} ghế — bấm để chọn rạp & suất 💕
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  hero: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  heroTitle: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.text.primary },
  heroSub: { marginTop: 8, color: COLORS.text.secondary, fontSize: FONTS.sizes.md, fontWeight: '600' },
  heroActions: { flexDirection: 'row', marginTop: 14, flexWrap: 'wrap' },
  heroBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, marginRight: 8, marginBottom: 8 },
  secondaryBtn: { backgroundColor: COLORS.secondary },
  heroBtnText: { color: COLORS.surface, fontWeight: '900', fontSize: 13 },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.text.primary, marginBottom: 10, marginTop: 8 },
  movieCard: { height: 150, borderRadius: 20, overflow: 'hidden', marginBottom: 12, justifyContent: 'flex-end', padding: 14 },
  movieCardImage: { borderRadius: 20 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  movieTitle: { color: COLORS.surface, fontSize: FONTS.sizes.lg, fontWeight: '900' },
  movieMeta: { color: COLORS.surface, fontSize: FONTS.sizes.sm, marginTop: 4 },
  showtimeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  showtimeMovie: { fontSize: FONTS.sizes.md, fontWeight: '900', color: COLORS.text.primary },
  showtimeMeta: { marginTop: 4, color: COLORS.text.secondary, fontWeight: '600' },
  showtimeSeats: { marginTop: 6, color: COLORS.primary, fontWeight: '900' },
});
