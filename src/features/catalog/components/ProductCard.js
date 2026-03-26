// @feature catalog | @layer Component
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import CatalogController from '../controllers/CatalogController';

export default function ProductCard({ product, onPress }) {
  const handleAdd = () => {
    onPress();
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.card}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: product.imageUrl }} 
          style={styles.image} 
          defaultSource={{ uri: 'https://via.placeholder.com/150' }}
        />
        {product.stock === 0 && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Hết ùi</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>{CatalogController.formatPrice(product.price)}</Text>
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
        <Text style={styles.addText}>🧸</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 6
  },
  imageContainer: {
    width: '100%',
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  outOfStockBadge: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 183, 178, 0.7)',
    justifyContent: 'center', alignItems: 'center',
  },
  outOfStockText: { color: COLORS.text.primary, fontWeight: '900', fontSize: FONTS.sizes.lg },
  info: { padding: 12, paddingBottom: 20, alignItems: 'center' },
  name: { fontSize: FONTS.sizes.md, color: COLORS.text.primary, marginBottom: 8, height: 40, textAlign: 'center', fontWeight: '600' },
  price: { fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.primary },
  addBtn: {
    position: 'absolute', bottom: -5, right: -5,
    backgroundColor: COLORS.secondary, width: 44, height: 44,
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.surface,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5
  },
  addText: { fontSize: 20 }
});
