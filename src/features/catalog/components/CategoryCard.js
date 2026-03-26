// @feature catalog | @layer Component
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';

export default function CategoryCard({ category, onPress }) {
  const [scale] = useState(new Animated.Value(1));
  const [imgError, setImgError] = useState(false);

  const handlePressIn = () => { Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }).start(); };
  const handlePressOut = () => { Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start(); };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <ImageBackground
          source={imgError || !category.imageUrl ? null : { uri: category.imageUrl }}
          style={styles.image}
          imageStyle={styles.imageStyle}
          onError={() => setImgError(true)}
        >
          {imgError && <View style={styles.fallback} />}
          <LinearGradient
            colors={['transparent', 'rgba(255, 158, 187, 0.7)', 'rgba(255, 158, 187, 0.9)']}
            style={styles.gradient}
          />
          <Text style={styles.name}>{category.name}</Text>
        </ImageBackground>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 156, height: 156, borderRadius: 24, overflow: 'hidden',
    backgroundColor: COLORS.surface, borderWidth: 3, borderColor: COLORS.background,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
  },
  image: { width: '100%', height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  imageStyle: { borderRadius: 20 },
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%', borderRadius: 20 },
  fallback: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.secondary },
  name: { color: COLORS.surface, fontSize: FONTS.sizes.lg, fontWeight: '900', margin: 15, position: 'absolute', bottom: 0, textAlign: 'center' }
});
