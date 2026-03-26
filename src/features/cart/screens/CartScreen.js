// @feature cart | @layer Screen
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import { useApp, setCartAction, clearCartAction } from '../../../context/AppContext';
import CartController from '../controllers/CartController';
import CartItem from '../components/CartItem';
import Header from '../../../components/Header';

export default function CartScreen() {
  const navigation = useNavigation();
  const { state, dispatch } = useApp();
  const { user, isLoggedIn, cart } = state;
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (isLoggedIn && user) {
        setLoading(true);
        CartController.getCart(user.id).then(data => {
          dispatch(setCartAction(data));
          setLoading(false);
        });
      }
    }, [isLoggedIn, user])
  );

  const handleUpdateQuantity = async (orderDetailId, quantity) => {
    const updated = await CartController.updateQuantity({
      orderDetailId, 
      quantity, 
      orderId: cart.orderId, 
      userId: user.id
    });
    dispatch(setCartAction(updated));
  };

  const handleRemove = async (orderDetailId) => {
    const updated = await CartController.removeItem({
      orderDetailId,
      orderId: cart.orderId,
      userId: user.id
    });
    dispatch(setCartAction(updated));
  };

  const handleCheckout = () => {
    Alert.alert(
      'Chốt đơn nha 💕',
      `Tổng thiệt hại là ${CartController.formatPrice(cart.total)}, bạn chắc chưa?`,
      [
        { text: 'Suy nghĩ lại', style: 'cancel' },
        { 
          text: 'Chốt luôn', 
          style: 'default',
          onPress: async () => {
            setCheckoutLoading(true);
            const result = await CartController.checkout(cart.orderId, user.id);
            setCheckoutLoading(false);
            
            if (result.success) {
              dispatch(clearCartAction());
              navigation.navigate('InvoiceDetail', { invoice: result.invoice });
            } else {
              Alert.alert('Ui dza 😥', result.message || 'Thanh toán thất bại ùi');
            }
          }
        }
      ]
    );
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Header title="Giỏ hàng của bạn 🛒" subtitle="Vui lòng đăng nhập nha" showBack={false} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🙈</Text>
          <Text style={styles.emptyText}>Bạn chưa đăng nhập kìa</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.actionBtnText}>Đăng nhập thôi 🌸</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Giỏ hàng của bạn 🛒" subtitle="..." />
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Giỏ hàng của bạn 🛒" subtitle="Rỗng tuếch luôn" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛍️💨</Text>
          <Text style={styles.emptyText}>Chưa có món đồ nào cả</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
            <Text style={styles.actionBtnText}>Đi mua sắm liền 🎀</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const itemsCount = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <View style={styles.container}>
      <Header title="Giỏ hàng của bạn 🛒" subtitle="Sắp chốt được rồi nè" />

      <FlatList
        data={cart.items}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CartItem 
            item={item} 
            onRemove={handleRemove} 
            onUpdateQuantity={handleUpdateQuantity} 
          />
        )}
      />

      <View style={styles.bottomBar}>
        <View style={styles.summaryWrap}>
          <Text style={styles.summaryText}>{itemsCount} items xinh xẻo</Text>
          <Text style={styles.totalText}>{CartController.formatPrice(cart.total)}</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.checkoutBtn, checkoutLoading && { opacity: 0.7 }]} 
          onPress={handleCheckout}
          disabled={checkoutLoading}
        >
          {checkoutLoading ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <Text style={styles.checkoutBtnText}>Thanh toán 💸</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyText: { fontSize: FONTS.sizes.lg, color: COLORS.text.secondary, marginBottom: 35, fontWeight: 'bold' },
  actionBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 35, paddingVertical: 18, borderRadius: 25, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  actionBtnText: { color: COLORS.surface, fontSize: FONTS.sizes.md, fontWeight: '900' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  bottomBar: { 
    paddingHorizontal: 25, paddingTop: 20, paddingBottom: 105,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 36, borderTopRightRadius: 36,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 6
  },
  summaryWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
  summaryText: { fontSize: FONTS.sizes.md, color: COLORS.text.secondary, fontWeight: 'bold' },
  totalText: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.primary },
  checkoutBtn: { 
    backgroundColor: COLORS.primary, 
    height: 56, borderRadius: 20, 
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
  },
  checkoutBtnText: { color: COLORS.surface, fontSize: FONTS.sizes.xl, fontWeight: '900' }
});
