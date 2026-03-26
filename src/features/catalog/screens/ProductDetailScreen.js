// @feature catalog | @layer Screen
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ImageBackground, Dimensions, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import CatalogController from '../controllers/CatalogController';
import { useApp, setCartAction } from '../../../context/AppContext';
import CartController from '../../cart/controllers/CartController'; 
import Header from '../../../components/Header';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params;
  const { state, dispatch } = useApp();
  const { isLoggedIn, user, cart } = state;

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    CatalogController.getProductById(productId).then(setProduct);
  }, [productId]);

  if (!product) return null;

  const total = product.price * qty;

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      Alert.alert('Chưa đăng nhập nè 🌸', 'Bạn nhớ đăng nhập để thêm vào giỏ hàng nha.', [
        { text: 'Xíu nữa', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }
    setAdding(true);
    const result = await CartController.addToCart({
      userId: user.id,
      productId: product.id,
      quantity: qty,
      unitPrice: product.price,
      productName: product.name,
      imageUrl: product.imageUrl
    });
    setAdding(false);
    
    if (result.success) {
      dispatch(setCartAction(result.cart));
      Alert.alert('Yeaaah 🎉', 'Đã thả đồ vào giỏ thành công rồi nha 💕');
    } else {
      Alert.alert('Ui dza 😥', result.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Chi tiết sản phẩm 🎀" showBack={true} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground source={{ uri: product.imageUrl }} style={styles.image}>
          <LinearGradient colors={['transparent', 'rgba(255,182,193,0.3)', COLORS.surface]} style={styles.gradient} />
        </ImageBackground>

        <View style={styles.content}>
          <View style={styles.badgeWrap}>
            <View style={[styles.badge, product.stock > 0 ? styles.badgeInStock : styles.badgeOutStock]}>
              <Text style={styles.badgeText}>{product.stock > 0 ? `Còn ${product.stock} items` : 'Hết sạch ùi'}</Text>
            </View>
            {product.categoryName && (
              <View style={[styles.badge, { backgroundColor: COLORS.secondary, marginLeft: 8 }]}>
                <Text style={[styles.badgeText, { color: COLORS.text.primary }]}>{product.categoryName}</Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{CatalogController.formatPrice(product.price)}</Text>
          
          <Text style={styles.sectionTitle}>Mô tả chút xíu nha 👇</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.qtyWrap}>
          <TouchableOpacity 
            style={styles.qtyBtn} 
            onPress={() => setQty(Math.max(1, qty - 1))}
          >
            <Text style={styles.qtyText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyVal}>{qty}</Text>
          <TouchableOpacity 
            style={styles.qtyBtn} 
            onPress={() => setQty(Math.min(product.stock, qty + 1))}
          >
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.addBtn, (product.stock === 0 || adding) && { opacity: 0.6 }]} 
          disabled={product.stock === 0 || adding}
          onPress={handleAddToCart}
        >
          <Text style={styles.addBtnText}>
            {adding ? 'Đang thêm...' : `🛍️ Mua ${CatalogController.formatPrice(total)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  image: { width: width, height: 320 },
  gradient: { flex: 1, justifyContent: 'flex-end' },
  content: { padding: 25, backgroundColor: COLORS.surface, marginTop: -30, borderTopLeftRadius: 36, borderTopRightRadius: 36 },
  badgeWrap: { flexDirection: 'row', marginBottom: 15 },
  badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  badgeInStock: { backgroundColor: COLORS.success },
  badgeOutStock: { backgroundColor: COLORS.error },
  badgeText: { fontSize: FONTS.sizes.xs, fontWeight: '900', color: COLORS.text.primary },
  name: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.text.primary, marginBottom: 12 },
  price: { fontSize: FONTS.sizes.xxxl, fontWeight: '900', color: COLORS.primary, marginBottom: 25 },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', color: COLORS.text.secondary, marginBottom: 15 },
  description: { fontSize: FONTS.sizes.md, color: COLORS.text.primary, lineHeight: 26, fontWeight: '500' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 15, paddingBottom: 35, backgroundColor: COLORS.surface, borderTopWidth: 2, borderTopColor: COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 6, borderWidth: 2, borderColor: COLORS.border },
  qtyBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  qtyText: { fontSize: 22, color: COLORS.text.primary, fontWeight: 'bold' },
  qtyVal: { fontSize: FONTS.sizes.xl, fontWeight: '900', marginHorizontal: 18, color: COLORS.text.primary },
  addBtn: { flex: 1, marginLeft: 20, backgroundColor: COLORS.primary, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  addBtnText: { color: COLORS.surface, fontSize: FONTS.sizes.lg, fontWeight: '900' }
});
