import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { CloudBackground } from '../components/CloudBackground';
import { Modal } from '../components/Modal';
import { SiaLogo } from '../components/SiaLogo';

const ANDROID_STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 0;

export const LoginScreen: React.FC = () => {
  const { login, showToast } = useApp();
  const [email, setEmail] = useState('budi@siabsen.id');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      showToast('Harap masukkan email dan password.', 'warning');
      return;
    }
    setIsLoggingIn(true);
    setTimeout(() => {
      login(email);
      setIsLoggingIn(false);
    }, 350);
  };

  const handleForgotPassword = () => {
    if (!forgotEmail.trim()) {
      showToast('Harap isi alamat email Anda.', 'warning');
      return;
    }
    showToast(`Instruksi reset password telah dikirim ke ${forgotEmail}`, 'success');
    setShowForgotModal(false);
    setForgotEmail('');
  };

  return (
    <CloudBackground>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: ANDROID_STATUS_BAR_HEIGHT + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          {/* Top Logo & Branding - Featuring official SIA Light Blue Logo */}
          <View style={styles.logoHeader}>
            <SiaLogo size={82} />
            <Text style={styles.appName}>SiAbsen</Text>
            <Text style={styles.appTagline}>"Hadir Tepat, Kerja Hebat."</Text>
            <Text style={styles.appDesc}>
              Sistem presensi cerdas & administrasi karyawan terintegrasi cloud modern.
            </Text>
          </View>

          {/* Quick Demo Access Bar */}
          <View style={styles.demoBar}>
            <Text style={styles.demoTitle}>AKSES CEPAT DEMO 1-KLIK:</Text>
            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.demoBtn,
                  { backgroundColor: COLORS.lightBlue, borderColor: COLORS.skyBlue },
                ]}
                onPress={() => login('budi@siabsen.id', 'employee')}
              >
                <Text style={{ fontSize: 16, marginRight: 6 }}>👨‍💻</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.demoBtnText, { color: COLORS.primaryDark }]}>
                    Login Karyawan
                  </Text>
                  <Text style={styles.demoSub}>Budi Pratama (Tech)</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.demoBtn,
                  { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
                ]}
                onPress={() => login('hendra@siabsen.id', 'admin')}
              >
                <Text style={{ fontSize: 16, marginRight: 6 }}>👑</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.demoBtnText, { color: '#991B1B' }]}>
                    Login Bos / Admin
                  </Text>
                  <Text style={[styles.demoSub, { color: '#B91C1C' }]}>
                    Hendra Wijaya (COO)
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Login Card */}
          <View style={[styles.card, SHADOWS.card]}>
            <Text style={styles.cardTitle}>Masuk ke Akun Anda</Text>
            <Text style={styles.cardSubtitle}>
              Masukkan kredensial Anda untuk melanjutkan
            </Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Kantor</Text>
              <TextInput
                style={styles.input}
                placeholder="nama@siabsen.id"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Kata Sandi</Text>
                <TouchableOpacity onPress={() => setShowForgotModal(true)}>
                  <Text style={styles.forgotLink}>Lupa Password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Text style={{ fontSize: 14 }}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.loginBtn, isLoggingIn && { opacity: 0.8 }]}
              onPress={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={[styles.loginBtnText, { marginLeft: 8 }]}>
                    Memverifikasi...
                  </Text>
                </View>
              ) : (
                <Text style={styles.loginBtnText}>Masuk ke Dashboard</Text>
              )}
            </TouchableOpacity>

            {/* Feature Badges */}
            <View style={styles.featuresRow}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📍</Text>
                <Text style={styles.featureText}>GPS Geofence</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>⏱️</Text>
                <Text style={styles.featureText}>Presensi Real-time</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📋</Text>
                <Text style={styles.featureText}>Alur Cuti Cepat</Text>
              </View>
            </View>
          </View>

          {/* Footer note */}
          <Text style={styles.footerNote}>
            SiAbsen Enterprise v2.5 • Dilindungi dengan Enkripsi & Keamanan Cloud
          </Text>
        </View>
      </ScrollView>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotModal}
        title="Pemulihan Kata Sandi"
        subtitle="Masukkan email terdaftar Anda untuk menerima tautan reset."
        onClose={() => setShowForgotModal(false)}
      >
        <View style={{ paddingTop: 8 }}>
          <Text style={styles.label}>Alamat Email</Text>
          <TextInput
            style={styles.input}
            placeholder="nama@siabsen.id"
            placeholderTextColor="#94A3B8"
            value={forgotEmail}
            onChangeText={setForgotEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.loginBtn, { marginTop: 16 }]}
            onPress={handleForgotPassword}
          >
            <Text style={styles.loginBtnText}>Kirim Tautan Reset</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </CloudBackground>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 460,
    alignItems: 'center',
  },
  logoHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.softNavy,
    letterSpacing: -0.8,
    marginTop: 10,
  },
  appTagline: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  appDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 320,
    lineHeight: 18,
  },
  demoBar: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
    textAlign: 'center',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  demoBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  demoSub: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.softNavy,
    marginBottom: 6,
  },
  forgotLink: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  featureText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  footerNote: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 18,
    textAlign: 'center',
  },
});
