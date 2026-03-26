// @feature cart | @layer Component
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import CartController from '../controllers/CartController';

export default function CartItem({ item, onRemove, onUpdateQuantity }) {
  const handleRemove = () => {
    Alert.alert('Xóa món này 😥', 'Bạn hong muốn mua món này nữa hả?', [
      { text: 'Chưa chắc', style: 'cancel' },
      { text: 'Xóa nha', style: 'destructive', onPress: () => onRemove(item.id) }
    ]);
  };

  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.image} 
        defaultSource={{ uri: 'https://via.placeholder.com/80' }}
      />
      
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.price}>{CartController.formatPrice(item.unitPrice)}</Text>
        
        <View style={styles.actions}>
          <View style={styles.qtyWrap}>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => item.quantity > 1 && onUpdateQuantity(item.id, item.quantity - 1)}
            >
              <Text style={styles.qtyText}>−</Text>
            </TouchableOpacity>
            
            <Text style={styles.qtyVal}>{item.quantity}</Text>
            
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
            <Text style={styles.removeIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 12,
    marginBottom: 15,
    borderWidth: 2, borderColor: COLORS.border,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3
  },
  image: {
    width: 80, height: 80,
    borderRadius: 16, backgroundColor: COLORS.background,
    marginRight: 15
  },
  info: { flex: 1, justifyContent: 'space-between' },
  name: { fontSize: FONTS.sizes.md, color: COLORS.text.primary, fontWeight: 'bold' },
  price: { fontSize: FONTS.sizes.lg, color: COLORS.primary, fontWeight: '900', marginVertical: 5 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 16, paddingHorizontal: 4, paddingVertical: 4 },
  qtyBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 1 },
  qtyText: { fontSize: 18, color: COLORS.text.primary, fontWeight: 'bold' },
  qtyVal: { fontSize: FONTS.sizes.md, fontWeight: '900', marginHorizontal: 15, color: COLORS.text.primary },
  removeBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 18 },
  removeIcon: { fontSize: 18 }
});
