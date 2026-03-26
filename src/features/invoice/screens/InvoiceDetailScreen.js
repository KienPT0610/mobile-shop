// @feature invoice | @layer Screen
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import InvoiceController from '../controllers/InvoiceController';
import Header from '../../../components/Header';

export default function InvoiceDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const [invoice, setInvoice] = useState(null);
  const isFromCheckout = !!route.params?.invoice;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (route.params?.invoice) {
      setInvoice(route.params.invoice);
      Animated.spring(checkScale, { toValue: 1, tension: 50, friction: 3, useNativeDriver: true }).start();
    } else if (route.params?.orderId) {
      InvoiceController.getInvoiceDetail(route.params.orderId).then(setInvoice);
    }
  }, [route.params]);

  const handleShare = async () => {
    if (!invoice) return;
    const text = InvoiceController.generateShareText(invoice);
    import('react-native').then(({ Share }) => {
      Share.share({ message: text, title: `Hóa đơn xinh đồ #${invoice.id} 🎀` });
    });
  };

  if (!invoice) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <Header title={`Hóa đơn #${invoice.id} 🌸`} showBack={true} />

      <ScrollView contentContainerStyle={styles.content}>
        {isFromCheckout && (
          <View style={styles.successBlock}>
            <Animated.Text style={[styles.successIcon, { transform: [{ scale: checkScale }] }]}>💕</Animated.Text>
            <Text style={styles.successText}>Yayy, thanh toán thành công!</Text>
          </View>
        )}

        <View style={styles.actionsTop}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareIcon}>📤 Khoe với bạn bè</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.invoiceCard}>
          <Text style={styles.cardTitle}>Thông tin thanh toán ✨</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã đơn hàng</Text>
            <Text style={styles.infoValue}>#{String(invoice.id).padStart(4, '0')}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày giờ</Text>
            <Text style={styles.infoValue}>{InvoiceController.formatDate(invoice.createdAt)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Khách hàng</Text>
            <Text style={styles.infoValue}>{invoice.fullName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ĐÃ XONG 🎀</Text>
            </View>
          </View>

          <View style={styles.dashedLine} />

          <Text style={styles.cardTitle}>Đồ đã múc 🛍️</Text>
          {invoice.items?.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemMain}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>
                {InvoiceController.formatPrice(item.quantity * item.unitPrice)}
              </Text>
            </View>
          ))}

          <View style={styles.solidLine} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{InvoiceController.formatPrice(invoice.totalAmount)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {isFromCheckout && (
            <TouchableOpacity 
              style={[styles.btn, styles.btnOutline]} 
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={[styles.btnText, { color: COLORS.primary }]}>Về trang chủ</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.btn, styles.btnFilled]} 
            onPress={() => navigation.navigate('Main', { screen: 'Categories' })}
          >
            <Text style={styles.btnTextFilled}>Mua đồ tiếp hoy 🌸</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  successBlock: { alignItems: 'center', marginBottom: 20 },
  successIcon: { fontSize: 60, marginBottom: 10 },
  successText: { fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.primary },
  actionsTop: { alignItems: 'flex-end', marginBottom: 15 },
  shareBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  shareIcon: { fontSize: FONTS.sizes.md, fontWeight: 'bold', color: COLORS.text.primary },
  invoiceCard: { 
    backgroundColor: COLORS.surface, borderRadius: 32, padding: 25,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
    borderWidth: 2, borderColor: COLORS.secondary
  },
  cardTitle: { fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.text.primary, marginBottom: 15, marginTop: 5 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  infoLabel: { fontSize: FONTS.sizes.md, color: COLORS.text.secondary, fontWeight: 'bold' },
  infoValue: { fontSize: FONTS.sizes.md, fontWeight: '900', color: COLORS.text.primary },
  badge: { backgroundColor: COLORS.success, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: COLORS.text.primary, fontSize: 10, fontWeight: 'bold' },
  dashedLine: { height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.border, marginVertical: 20, borderRadius: 1 },
  solidLine: { height: 2, backgroundColor: COLORS.border, marginVertical: 20, borderRadius: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  itemMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  itemName: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text.primary, fontWeight: '600' },
  itemQty: { fontSize: FONTS.sizes.md, color: COLORS.text.secondary, width: 40, textAlign: 'right', fontWeight: 'bold' },
  itemTotal: { fontSize: FONTS.sizes.md, fontWeight: '900', color: COLORS.primary, width: 100, textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.text.primary },
  totalValue: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.primary },
  actions: { marginTop: 30, gap: 15, paddingBottom: 40 },
  btn: { height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  btnOutline: { borderWidth: 2, borderColor: COLORS.primary, backgroundColor: COLORS.surface },
  btnFilled: { backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  btnText: { fontSize: FONTS.sizes.md, fontWeight: '900' },
  btnTextFilled: { fontSize: FONTS.sizes.md, fontWeight: '900', color: COLORS.surface }
});
