import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp, logoutAction } from '../context/AppContext';
import AuthController from '../features/auth/controllers/AuthController';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

export default function Header({ title, subtitle, showBack = false }) {
  const navigation = useNavigation();
  const { state, dispatch } = useApp();
  const { user, isLoggedIn } = state;

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn muốn đăng xuất khỏi app?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đồng ý', style: 'destructive', onPress: async () => {
          await AuthController.logout();
          dispatch(logoutAction());
        } 
      }
    ]);
  };

  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <View style={styles.backCircle}>
            <Text style={styles.backIcon}>🌸</Text>
          </View>
          <Text style={styles.backText}>Trở lại</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.titleWrap}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}

      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Main', { screen: 'Tickets' })}>
          <Text style={styles.cartIcon}>🎟️</Text>
        </TouchableOpacity>

        {/* Avatar / Login */}
        {isLoggedIn ? (
          <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
            <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || '🎀'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginIcon}>💖</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderBottomEndRadius: 32,
    borderBottomStartRadius: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 5,
  },
  titleWrap: { flex: 1, paddingRight: 10 },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.primary },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.text.secondary, marginTop: 4, fontWeight: '500' },
  backBtn: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backCircle: {
    width: 36, height: 36, borderRadius: 18, 
    backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8
  },
  backIcon: { fontSize: 16 },
  backText: { fontSize: FONTS.sizes.md, fontWeight: 'bold', color: COLORS.text.primary },
  rightSection: { flexDirection: 'row', alignItems: 'center' },
  cartBtn: { position: 'relative', marginRight: 15, padding: 5, backgroundColor: COLORS.background, borderRadius: 20, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  cartIcon: { fontSize: 20 },
  avatarBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5
  },
  avatarText: { color: COLORS.text.primary, fontWeight: 'bold', fontSize: FONTS.sizes.lg },
  loginBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary
  },
  loginIcon: { fontSize: 18 }
});
