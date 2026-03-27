import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../../../components/Header';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import MovieController from '../../movie/controllers/MovieController';
import TicketController from '../controllers/TicketController';
import { useApp } from '../../../context/AppContext';

const ROWS = 'ABCDEFGH'.split('');
const COLS = [1, 2, 3, 4, 5, 6, 7, 8];

/** Phương thức thanh toán — nhãn tiếng Việt, lưu đúng vào vé */
const PAYMENT_METHODS = [
  { label: 'Ví điện tử', hint: 'VNPAY / QR siêu nhanh', emoji: '💳' },
  { label: 'Thẻ ngân hàng', hint: 'Visa, Mastercard', emoji: '🏦' },
  { label: 'Momo', hint: 'Ví MoMo', emoji: '💜' },
  { label: 'ZaloPay', hint: 'Thanh toán ZaloPay', emoji: '💙' },
];

export default function SeatBookingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { state } = useApp();
  const { user, isLoggedIn } = state;
  const { showtimeId } = route.params;

  const [showtime, setShowtime] = useState(null);
  const [takenSeats, setTakenSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].label);

  useEffect(() => {
    MovieController.getShowtimeDetail(showtimeId).then(setShowtime);
    TicketController.getTakenSeats(showtimeId).then(setTakenSeats);
  }, [showtimeId]);

  const subtotal = useMemo(() => (showtime ? selected.length * showtime.basePrice : 0), [selected, showtime]);
  const promoPreview = useMemo(
    () => TicketController.calcDiscount({ subtotal, promoCode: appliedPromo || '' }),
    [subtotal, appliedPromo]
  );
  const total = Math.max(0, subtotal - (promoPreview.valid ? promoPreview.discount : 0));

  const toggleSeat = (seatCode) => {
    if (takenSeats.includes(seatCode)) return;
    setSelected((prev) => (prev.includes(seatCode) ? prev.filter((s) => s !== seatCode) : [...prev, seatCode]));
  };

  const runBooking = async () => {
    setSubmitting(true);
    const res = await TicketController.bookTicket({
      userId: user.id,
      showtimeId,
      seatCodes: selected,
      seatPrice: showtime.basePrice,
      promoCode: appliedPromo || '',
      paymentMethod,
    });
    setSubmitting(false);
    if (!res.success) {
      Alert.alert('Ôi chà…', res.message);
      TicketController.getTakenSeats(showtimeId).then(setTakenSeats);
      return;
    }
    navigation.replace('TicketDetail', { ticketId: res.ticket.id, justBooked: true });
  };

  const handleBook = () => {
    if (!isLoggedIn) {
      Alert.alert('Chưa đăng nhập nè 🌸', 'Đăng nhập để giữ ghế và thanh toán nha!', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    if (selected.length === 0) {
      Alert.alert('Chọn ghế trước nha', 'Bấm vào ghế trống để chọn ít nhất một chỗ xinh xắn 💺');
      return;
    }
    Alert.alert(
      'Xác nhận thanh toán 💕',
      `Bạn sẽ thanh toán ${MovieController.formatPrice(total)} bằng ${paymentMethod}.\nGhế: ${selected.join(', ')}\nBấm "Đồng ý" để hoàn tất đặt vé!`,
      [
        { text: 'Suy lại chút', style: 'cancel' },
        { text: 'Đồng ý', onPress: () => runBooking() },
      ]
    );
  };

  if (!showtime) return <View style={styles.container} />;

  const promotionEntries = Object.entries(TicketController.getPromotions());

  const handleApplyPromo = () => {
    const preview = TicketController.calcDiscount({ subtotal, promoCode });
    if (!promoCode.trim()) {
      setAppliedPromo(null);
      return;
    }
    if (!preview.valid) {
      Alert.alert('Mã khuyến mãi', 'Mã không đúng hoặc chưa đủ điều kiện áp dụng nha 🥺');
      return;
    }
    setAppliedPromo(preview.code);
  };

  return (
    <View style={styles.container}>
      <Header title="Chọn ghế & thanh toán" showBack={true} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{showtime.movieTitle}</Text>
        <Text style={styles.meta}>
          {showtime.theaterName} • {showtime.room}
        </Text>
        <Text style={styles.meta}>{MovieController.formatTime(showtime.startTime)}</Text>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.background, borderColor: COLORS.border }]} />
            <Text style={styles.legendText}>Trống</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#E0E0E0' }]} />
            <Text style={styles.legendText}>Đã bán</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>Bạn chọn</Text>
          </View>
        </View>

        <View style={styles.screen}>
          <Text style={styles.screenText}>MÀN HÌNH</Text>
        </View>

        <View style={styles.grid}>
          {ROWS.map((r) => (
            <View key={r} style={styles.row}>
              {COLS.map((c) => {
                const code = `${r}${c}`;
                const isTaken = takenSeats.includes(code);
                const isSelected = selected.includes(code);
                return (
                  <TouchableOpacity
                    key={code}
                    style={[styles.seat, isTaken && styles.takenSeat, isSelected && styles.selectedSeat]}
                    onPress={() => toggleSeat(code)}
                  >
                    <Text style={[styles.seatText, isSelected && { color: COLORS.surface }]}>{code}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>💺 Ghế đã chọn</Text>
          <Text style={styles.summaryText}>{selected.join(', ') || 'Chưa chọn ghế nào — bấm vào ô trống nha!'}</Text>
          <Text style={styles.priceLine}>Tạm tính: {MovieController.formatPrice(subtotal)}</Text>

          <Text style={styles.blockTitle}>🎁 Mã khuyến mãi</Text>
          <View style={styles.promoWrap}>
            <TextInput
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder="Nhập mã (vd: CINE10)"
              placeholderTextColor={COLORS.text.light}
              style={styles.promoInput}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyPromo}>
              <Text style={styles.applyText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promoChips}>
            {promotionEntries.map(([code, cfg]) => (
              <TouchableOpacity
                key={code}
                style={[styles.promoChip, appliedPromo === code && styles.promoChipActive]}
                onPress={() => {
                  setPromoCode(code);
                  setAppliedPromo(code);
                }}
              >
                <Text style={[styles.promoChipText, appliedPromo === code && styles.promoChipTextActive]}>{code}</Text>
                <Text style={[styles.promoHint, appliedPromo === code && styles.promoChipTextActive]}>{cfg.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.discountLine}>
            Giảm giá: −{MovieController.formatPrice(promoPreview.valid ? promoPreview.discount : 0)}
          </Text>
          <Text style={styles.total}>Tổng thanh toán: {MovieController.formatPrice(total)}</Text>

          <Text style={styles.blockTitle}>💳 Thanh toán — chọn cách bạn thích</Text>
          <Text style={styles.paymentHint}>Chọn một phương thức (demo trong app — không trừ tiền thật nha 🌸)</Text>
          <View style={styles.methodWrap}>
            {PAYMENT_METHODS.map((m) => (
              <TouchableOpacity
                key={m.label}
                style={[styles.methodCard, paymentMethod === m.label && styles.methodCardActive]}
                onPress={() => setPaymentMethod(m.label)}
              >
                <Text style={styles.methodEmoji}>{m.emoji}</Text>
                <Text style={[styles.methodLabel, paymentMethod === m.label && styles.methodLabelActive]}>{m.label}</Text>
                <Text style={styles.methodSub}>{m.hint}</Text>
                {paymentMethod === m.label ? <Text style={styles.check}>✓ Đang chọn</Text> : null}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.bookBtn, (submitting || selected.length === 0) && { opacity: 0.6 }]}
            disabled={submitting || selected.length === 0}
            onPress={handleBook}
          >
            <Text style={styles.bookText}>{submitting ? 'Đang xử lý...' : 'Xác nhận đặt vé & thanh toán 💕'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.text.primary },
  meta: { color: COLORS.text.secondary, marginTop: 4, fontWeight: '600' },
  legend: { flexDirection: 'row', marginTop: 12, marginBottom: 4, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 14, marginBottom: 4 },
  dot: { width: 14, height: 14, borderRadius: 4, marginRight: 6, borderWidth: 1 },
  legendText: { fontSize: 11, fontWeight: '700', color: COLORS.text.secondary },
  screen: {
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  screenText: { fontWeight: '900', color: COLORS.text.primary, letterSpacing: 3, fontSize: 12 },
  grid: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 10, borderWidth: 2, borderColor: COLORS.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  seat: {
    width: '11.5%',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  takenSeat: { backgroundColor: '#E0E0E0' },
  selectedSeat: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  seatText: { fontSize: 10, fontWeight: '700', color: COLORS.text.primary },
  summary: {
    marginTop: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 14,
  },
  summaryTitle: { fontWeight: '900', color: COLORS.text.primary, marginBottom: 6 },
  summaryText: { color: COLORS.text.secondary, fontWeight: '600' },
  priceLine: { marginTop: 8, color: COLORS.text.secondary, fontWeight: '700' },
  blockTitle: { marginTop: 12, fontWeight: '900', color: COLORS.text.primary },
  paymentHint: { marginTop: 4, fontSize: 12, color: COLORS.text.secondary, fontWeight: '500' },
  promoWrap: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  promoInput: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  applyBtn: { marginLeft: 8, backgroundColor: COLORS.secondary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  applyText: { color: COLORS.text.primary, fontWeight: '900', fontSize: 12 },
  promoChips: { paddingTop: 10, paddingBottom: 4 },
  promoChip: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    minWidth: 128,
  },
  promoChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  promoChipText: { color: COLORS.text.primary, fontWeight: '900', fontSize: 12 },
  promoChipTextActive: { color: COLORS.surface },
  promoHint: { marginTop: 2, color: COLORS.text.secondary, fontSize: 10, fontWeight: '600' },
  discountLine: { marginTop: 8, color: '#2E7D32', fontWeight: '900' },
  total: { marginTop: 8, color: COLORS.primary, fontSize: FONTS.sizes.lg, fontWeight: '900' },
  methodWrap: { marginTop: 10 },
  methodCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    padding: 12,
    marginBottom: 4,
  },
  methodCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.secondary },
  methodEmoji: { fontSize: 20, marginBottom: 4 },
  methodLabel: { fontWeight: '900', color: COLORS.text.primary, fontSize: FONTS.sizes.md },
  methodLabelActive: { color: COLORS.text.primary },
  methodSub: { fontSize: 11, color: COLORS.text.secondary, marginTop: 2, fontWeight: '600' },
  check: { marginTop: 6, color: COLORS.primary, fontWeight: '900', fontSize: 12 },
  bookBtn: { marginTop: 14, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  bookText: { color: COLORS.surface, fontWeight: '900' },
});
