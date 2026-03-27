// @feature auth | @layer Screen
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import AuthController from '../controllers/AuthController';
import { useApp, loginAction } from '../../../context/AppContext';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation();
  const { dispatch } = useApp();

  const [isLoginSync, setIsLoginSync] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!username || !password || (!isLoginSync && !fullName)) {
      setErrorMsg('Điền đủ thông tin giúp mình nha 🌸');
      triggerShake();
      return;
    }

    setLoading(true);
    let res;

    if (isLoginSync) {
      res = await AuthController.login(username, password);
    } else {
      res = await AuthController.register(username, password, fullName);
      if (res.success) {
        setIsLoginSync(true);
        setErrorMsg('Tạo tài khoản xong rùi! Giờ đăng nhập thôi 💕');
      }
    }

    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      triggerShake();
    } else if (isLoginSync) {
      dispatch(loginAction(res.user));
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>← Trở về</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>🎬 CineBooking</Text>
        <Text style={styles.slogan}>Đặt vé xinh — xem phim là chill 💖</Text>
      </View>

      <View style={styles.bottomSection}>
        <Animated.View style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={styles.title}>{isLoginSync ? 'Mừng bạn quay lại 💕' : 'Thành viên mới ơi 🌸'}</Text>

          {!!errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {!isLoginSync && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ tên xinh xắn</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Ví dụ: Nguyễn Thị Mai"
                placeholderTextColor={COLORS.text.light}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên đăng nhập</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
              placeholder="Nhập username của bạn"
              placeholderTextColor={COLORS.text.light}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu bí mật</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.text.light}
            />
          </View>

          <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.submitText}>{loading ? 'Đang xử lý...' : isLoginSync ? 'Đăng nhập 🐾' : 'Đăng ký 🎉'}</Text>
          </TouchableOpacity>

          <View style={styles.switchWrap}>
            <Text style={styles.switchText}>{isLoginSync ? 'Chưa có tài khoản?' : 'Đã có tài khoản rồi?'}</Text>
            <TouchableOpacity
              onPress={() => {
                setIsLoginSync(!isLoginSync);
                setErrorMsg('');
              }}
            >
              <Text style={styles.switchLink}>{isLoginSync ? 'Đăng ký ngay' : 'Đăng nhập luôn'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  topSection: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  backBtn: { position: 'absolute', top: 50, left: 20 },
  backIcon: { fontSize: FONTS.sizes.md, color: COLORS.surface, fontWeight: 'bold' },
  logo: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.surface,
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  slogan: { fontSize: FONTS.sizes.md, color: COLORS.surface, fontWeight: '600' },
  bottomSection: {
    height: height * 0.65,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 25,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 32,
    padding: 30,
    marginTop: -60,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.text.primary, marginBottom: 25, textAlign: 'center' },
  errorBox: { backgroundColor: COLORS.error + '40', padding: 12, borderRadius: 12, marginBottom: 20 },
  errorText: { color: '#D32F2F', textAlign: 'center', fontWeight: 'bold' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: FONTS.sizes.sm, color: COLORS.text.secondary, marginBottom: 8, fontWeight: 'bold' },
  input: {
    height: 50,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingHorizontal: 15,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitText: { color: COLORS.surface, fontSize: FONTS.sizes.lg, fontWeight: '900' },
  switchWrap: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  switchText: { color: COLORS.text.secondary, marginRight: 5, fontWeight: '600' },
  switchLink: { color: COLORS.primary, fontWeight: '900' },
});
