import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { ArrowLeft, MapPin, Clock } from 'lucide-react-native';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, navigateTo, showToast, resetDemoData } = useApp();

  const [officeName, setOfficeName] = useState(settings.officeName);
  const [latitude, setLatitude] = useState(String(settings.latitude));
  const [longitude, setLongitude] = useState(String(settings.longitude));
  const [radius, setRadius] = useState(String(settings.geofenceRadiusMeters));
  const [workStartTime, setWorkStartTime] = useState(settings.workStartTime);
  const [workEndTime, setWorkEndTime] = useState(settings.workEndTime);
  const [tolerance, setTolerance] = useState(String(settings.lateToleranceMinutes));
  const [allowRemote, setAllowRemote] = useState(settings.allowRemoteWork);

  const handleSave = () => {
    updateSettings({
      officeName,
      latitude: parseFloat(latitude) || settings.latitude,
      longitude: parseFloat(longitude) || settings.longitude,
      geofenceRadiusMeters: parseInt(radius, 10) || settings.geofenceRadiusMeters,
      workStartTime,
      workEndTime,
      lateToleranceMinutes: parseInt(tolerance, 10) || settings.lateToleranceMinutes,
      allowRemoteWork: allowRemote,
    });
  };

  const handleReset = () => {
    setOfficeName('SiAbsen HQ - Menara Mandiri Sudirman');
    setLatitude('-6.2255');
    setLongitude('106.8093');
    setRadius('250');
    setWorkStartTime('08:30');
    setWorkEndTime('17:30');
    setTolerance('15');
    setAllowRemote(true);
    showToast('Nilai formulir telah direset ke default pabrik.', 'info');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Pengaturan Sistem & Kebijakan Absensi</Text>
          <Text style={styles.pageSubtitle}>
            Konfigurasi lokasi kantor GPS, radius geofencing, jam kerja resmi, dan toleransi.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigateTo('admin_dashboard')}
          activeOpacity={0.7}
        >
          <ArrowLeft size={13} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={styles.backBtnText}>Kembali ke Dashboard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGrid}>
        {/* Card 1: GPS Geofencing Settings */}
        <View style={[styles.card, SHADOWS.card]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <MapPin size={17} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>Lokasi Kantor & Geofence GPS</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Menentukan batasan radius presensi WFO bagi karyawan.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nama Lokasi Kantor / Gedung</Text>
            <TextInput
              style={styles.textInput}
              value={officeName}
              onChangeText={setOfficeName}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Latitude</Text>
              <TextInput
                style={styles.textInput}
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Longitude</Text>
              <TextInput
                style={styles.textInput}
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Radius Geofence Valid (Meter)</Text>
            <TextInput
              style={styles.textInput}
              value={radius}
              onChangeText={setRadius}
              keyboardType="numeric"
            />
            <Text style={styles.inputHelper}>
              Karyawan wajib berada dalam radius {radius} meter untuk presensi WFO.
            </Text>
          </View>
        </View>

        {/* Card 2: Work Schedule & Tolerance */}
        <View style={[styles.card, SHADOWS.card]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Clock size={17} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>Jadwal Kerja & Aturan Keterlambatan</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Perhitungan status Hadir Tepat Waktu atau Terlambat dihitung berdasarkan jadwal ini.
          </Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Jam Masuk Resmi (WIB)</Text>
              <TextInput
                style={styles.textInput}
                value={workStartTime}
                onChangeText={setWorkStartTime}
                placeholder="08:30"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Jam Pulang Resmi (WIB)</Text>
              <TextInput
                style={styles.textInput}
                value={workEndTime}
                onChangeText={setWorkEndTime}
                placeholder="17:30"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Toleransi Keterlambatan (Menit)</Text>
            <TextInput
              style={styles.textInput}
              value={tolerance}
              onChangeText={setTolerance}
              keyboardType="numeric"
            />
            <Text style={styles.inputHelper}>
              Check-in setelah {workStartTime} + {tolerance} menit akan otomatis ditandai Terlambat.
            </Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Izinkan Kerja Remote (WFH)</Text>
              <Text style={styles.toggleDesc}>
                Karyawan dapat memilih mode WFH saat melakukan check-in harian.
              </Text>
            </View>
            <Switch
              value={allowRemote}
              onValueChange={setAllowRemote}
              trackColor={{ false: '#CBD5E1', true: COLORS.skyBlue }}
              thumbColor={allowRemote ? COLORS.primary : '#FFFFFF'}
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsBar}>
        <TouchableOpacity
          style={{
            backgroundColor: '#FEF2F2',
            borderWidth: 1,
            borderColor: '#FECACA',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            marginRight: 'auto',
          }}
          onPress={() => resetDemoData()}
        >
          <Text style={{ color: COLORS.error, fontWeight: '700', fontSize: 13 }}>
            🔄 Reset Semua Data Demo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>Reset ke Nilai Awal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Simpan Pengaturan Sistem</Text>
        </TouchableOpacity>
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
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  card: {
    flex: 1,
    minWidth: 320,
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
    marginVertical: 8,
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
  inputHelper: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 14,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  toggleDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  resetBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
