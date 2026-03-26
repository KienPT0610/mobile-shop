// @feature invoice | @layer Screen
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import { useApp } from '../../../context/AppContext';
import InvoiceController from '../controllers/InvoiceController';
import InvoiceCard from '../components/InvoiceCard';
import Header from '../../../components/Header';

export default function InvoiceListScreen() {
  const navigation = useNavigation();
  const { state } = useApp();
  const { user, isLoggedIn } = state;

  const [invoices, setInvoices] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (isLoggedIn && user) {
      const list = await InvoiceController.getInvoices(user.id);
      const total = await InvoiceController.getTotalSpent(user.id);
      setInvoices(list);
      setTotalSpent(total);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [isLoggedIn, user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Header title="Lịch sử mua sắm 🛍️" subtitle="Những món đồ xinh đã rinh" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyText}>Đăng nhập để xem lịch sử mua hàng</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.actionBtnText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Lịch sử mua sắm 🛍️" subtitle="Những món đồ xinh đã rinh" />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Tổng thiệt hại 🥰</Text>
        <Text style={styles.summaryTotal}>{InvoiceController.formatPrice(totalSpent)}</Text>
      </View>

      <FlatList
        data={invoices}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { marginTop: 40, backgroundColor: 'transparent' }]}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyText}>Chưa chốt đơn nào cả</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
              <Text style={styles.actionBtnText}>Mua sắm ngay 🧸</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <InvoiceCard 
            invoice={item} 
            onPress={() => navigation.navigate('InvoiceDetail', { orderId: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  summaryCard: { 
    marginHorizontal: 20, marginTop: 15, marginBottom: 20, backgroundColor: COLORS.secondary, borderRadius: 24, padding: 25, 
    alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 4, 
    borderWidth: 2, borderColor: COLORS.surface
  },
  summaryLabel: { fontSize: FONTS.sizes.lg, color: COLORS.text.primary, marginBottom: 10, fontWeight: 'bold' },
  summaryTotal: { fontSize: FONTS.sizes.xxxl, fontWeight: '900', color: COLORS.text.primary },
  list: { paddingHorizontal: 20, paddingBottom: 110 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.text.secondary, marginBottom: 30, fontWeight: 'bold' },
  actionBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 18, borderRadius: 25, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  actionBtnText: { color: COLORS.surface, fontSize: FONTS.sizes.md, fontWeight: '900' }
});
