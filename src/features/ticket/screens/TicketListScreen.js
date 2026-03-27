import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from '../../../components/Header';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import TicketController from '../controllers/TicketController';
import { useApp } from '../../../context/AppContext';
import MovieController from '../../movie/controllers/MovieController';

export default function TicketListScreen() {
  const navigation = useNavigation();
  const { state } = useApp();
  const { user, isLoggedIn } = state;
  const [tickets, setTickets] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      if (isLoggedIn && user) TicketController.getMyTickets(user.id).then(setTickets);
      else setTickets([]);
    }, [isLoggedIn, user])
  );

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Header title="Vé của tôi 🎟️" subtitle="Đăng nhập để xem vé đã đặt nha" />
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🙈</Text>
          <Text style={styles.empty}>Bạn chưa đăng nhập kìa!</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.btnText}>Đăng nhập thôi 💕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Vé của tôi 🎟️" subtitle="Lịch sử đặt vé xem phim" />
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyList}>Chưa có vé nào — đi đặt phim thôi nào 🌸</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}>
            <Text style={styles.movie}>{item.movieTitle}</Text>
            <Text style={styles.meta}>{item.theaterName}</Text>
            <Text style={styles.meta}>
              {MovieController.formatTime(item.startTime)} • {item.room}
            </Text>
            <Text style={styles.seats}>Ghế: {item.seatCodes}</Text>
            <Text style={styles.price}>{MovieController.formatPrice(item.totalPrice)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 20, paddingBottom: 120 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 10,
  },
  movie: { fontWeight: '900', color: COLORS.text.primary, fontSize: FONTS.sizes.md },
  meta: { marginTop: 4, color: COLORS.text.secondary, fontWeight: '600' },
  seats: { marginTop: 6, fontWeight: '800', color: COLORS.text.primary },
  price: { marginTop: 6, color: COLORS.primary, fontWeight: '900' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  empty: { textAlign: 'center', color: COLORS.text.secondary, fontWeight: '700', marginBottom: 8 },
  emptyList: { textAlign: 'center', color: COLORS.text.secondary, fontWeight: '600', paddingVertical: 40 },
  btn: { marginTop: 8, backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 },
  btnText: { color: COLORS.surface, fontWeight: '900' },
});
