import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../../../components/Header';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import MovieController from '../controllers/MovieController';

export default function TheaterListScreen() {
  const navigation = useNavigation();
  const [theaters, setTheaters] = useState([]);

  useEffect(() => {
    MovieController.getTheaters().then(setTheaters);
  }, []);

  const openShowtimes = (item) => {
    navigation.navigate('Showtimes', {
      theaterId: item.id,
      theaterName: item.name,
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Rạp chiếu phim 🏢" subtitle="Chọn rạp để xem suất chiếu & đặt vé" />
      <FlatList
        data={theaters}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.9} onPress={() => openShowtimes(item)}>
            <ImageBackground source={{ uri: item.imageUrl }} style={styles.card} imageStyle={styles.cardImg}>
              <View style={styles.overlay} />
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.addr}>{item.address}</Text>
              <Text style={styles.city}>{item.city}</Text>
              <View style={styles.cta}>
                <Text style={styles.ctaText}>Xem lịch chiếu tại rạp này →</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 20, paddingBottom: 120 },
  card: { minHeight: 170, marginBottom: 14, borderRadius: 20, overflow: 'hidden', padding: 14, justifyContent: 'flex-end' },
  cardImg: { borderRadius: 20 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.38)' },
  name: { color: COLORS.surface, fontWeight: '900', fontSize: FONTS.sizes.lg },
  addr: { color: COLORS.surface, marginTop: 5, fontWeight: '600' },
  city: { color: COLORS.secondary, marginTop: 4, fontWeight: '800' },
  cta: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  ctaText: { color: COLORS.primary, fontWeight: '900', fontSize: 12 },
});
