import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/Badge';
import { ArrowLeft } from 'lucide-react-native';

export const ProfileScreen: React.FC = () => {
  const { currentUser, updateEmployee, showToast, navigateTo, logout } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdateProfile = () => {
    if (!currentUser) return;
    updateEmployee(currentUser.id, {
      name,
      phone,
    });
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword) {
      showToast('Harap masukkan password lama dan password baru.', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password baru minimal 6 karakter.', 'warning');
      return;
    }
    showToast('Kata sandi Anda berhasil diperbarui secara aman!', 'success');
    setOldPassword('');
    setNewPassword('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Profil & Pengaturan Akun</Text>
          <Text style={styles.pageSubtitle}>
            Kelola data diri, nomor kontak darurat, serta keamanan kata sandi Anda.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() =>
            navigateTo(
              currentUser?.role === 'admin'
                ? 'admin_dashboard'
                : 'employee_dashboard'
            )
          }
          activeOpacity={0.7}
        >
          <ArrowLeft size={13} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={styles.backBtnText}>Kembali ke Dashboard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileGrid}>
        {/* Left: Profile Card */}
        <View style={[styles.profileCard, SHADOWS.card]}>
          <View style={styles.avatarWrap}>
            <Image
              source={{
                uri:
                  currentUser?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              }}
              style={styles.avatarImg}
            />
            <View style={styles.statusDot} />
          </View>

          <Text style={styles.profileName}>{currentUser?.name}</Text>
          <Text style={styles.profileRole}>{currentUser?.position}</Text>
          <Text style={styles.profileDept}>{currentUser?.department}</Text>

          <View style={{ marginTop: 10 }}>
            <Badge
              label={
                currentUser?.role === 'admin'
                  ? 'BOS / ADMINISTRATOR'
                  : 'KARYAWAN TETAP'
              }
              variant={currentUser?.role === 'admin' ? 'error' : 'primary'}
            />
          </View>

          <View style={styles.metaBox}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>ID KARYAWAN</Text>
              <Text style={styles.metaVal}>{currentUser?.id}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>TANGGAL GABUNG</Text>
              <Text style={styles.metaVal}>{currentUser?.joinDate}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>SISA CUTI</Text>
              <Text style={[styles.metaVal, { color: COLORS.primaryDark, fontWeight: '800' }]}>
                {currentUser?.remainingLeaveDays} Hari
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutBtnText}>Keluar dari Akun (Logout)</Text>
          </TouchableOpacity>
        </View>

        {/* Right: Edit & Security Forms */}
        <View style={styles.formsCol}>
          {/* Edit Information */}
          <View style={[styles.card, SHADOWS.card]}>
            <Text style={styles.cardTitle}>Informasi Kontak & Biodata</Text>
            <Text style={styles.cardSubtitle}>Perbarui informasi nama dan nomor telepon</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Lengkap</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Perusahaan (Permanen)</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: '#F1F5F9' }]}
                value={currentUser?.email}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nomor Handphone / WhatsApp</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <TouchableOpacity style={styles.saveProfileBtn} onPress={handleUpdateProfile}>
              <Text style={styles.saveProfileBtnText}>Simpan Perubahan Profil</Text>
            </TouchableOpacity>
          </View>

          {/* Security & Password */}
          <View style={[styles.card, SHADOWS.card, { marginTop: 20 }]}>
            <Text style={styles.cardTitle}>Keamanan & Ganti Password</Text>
            <Text style={styles.cardSubtitle}>Pastikan password Anda kuat dan terlindungi</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kata Sandi Lama</Text>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kata Sandi Baru</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Minimal 6 karakter"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <TouchableOpacity style={styles.savePasswordBtn} onPress={handleChangePassword}>
              <Text style={styles.savePasswordBtnText}>Perbarui Kata Sandi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.softNavy,
  },
  pageSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  backBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  profileCard: {
    flex: 1.5,
    minWidth: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.lightBlue,
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.softNavy,
  },
  profileRole: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
  },
  profileDept: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  metaBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginVertical: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.softNavy,
  },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.error,
  },
  formsCol: {
    flex: 2.5,
    minWidth: 320,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.softNavy,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  saveProfileBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveProfileBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  savePasswordBtn: {
    backgroundColor: COLORS.softNavy,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  savePasswordBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
