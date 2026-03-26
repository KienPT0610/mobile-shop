// @feature invoice | @layer Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import InvoiceController from '../controllers/InvoiceController';

export default function InvoiceCard({ invoice, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.card}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>🧾</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.orderId}>Đơn #{String(invoice.id).padStart(4, '0')} 🎀</Text>
        <Text style={styles.date}>{InvoiceController.formatDate(invoice.createdAt)}</Text>
        <Text style={styles.itemCount}>{invoice.itemCount || 0} món đồ</Text>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={styles.total}>{InvoiceController.formatPrice(invoice.totalAmount)}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ĐÃ XONG ✨</Text>
        </View>
      </View>
      
      <View style={styles.chevronWrap}>
        <Text style={styles.chevron}>🌸</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 2, borderColor: COLORS.border
  },
  iconWrap: {
    width: 50, height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2, borderColor: COLORS.secondary
  },
  icon: { fontSize: 24 },
  info: { flex: 1 },
  orderId: {
    fontSize: FONTS.sizes.md,
    fontWeight: '900',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  date: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: 4,
    fontWeight: '500'
  },
  itemCount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.light,
    fontWeight: 'bold'
  },
  rightSection: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  total: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.text.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  chevronWrap: { justifyContent: 'center' },
  chevron: {
    fontSize: 16,
    color: COLORS.primary,
  }
});
