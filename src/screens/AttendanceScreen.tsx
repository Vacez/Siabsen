import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { DigitalClock } from '../components/DigitalClock';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { CheckmarkModal } from '../components/CheckmarkModal';
import { Clock, LogOut, CheckCircle2, MapPin, Building2, Home, Check } from 'lucide-react-native';

export const AttendanceScreen: React.FC = () => {
  const {
    currentUser,
    settings,
    todayAttendance,
    checkIn,
    checkOut,
    showToast,
    navigateTo,
  } = useApp();

  const [workType, setWorkType] = useState<'WFO' | 'WFH'>('WFO');
  const [notes, setNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    time: string;
    isLate: boolean;
    statusText: string;
  }>({
    time: '',
    isLate: false,
    statusText: 'Tepat Waktu',
  });

  // GPS Simulation vs Real GPS State
  const [useRealGps, setUseRealGps] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [realCoord, setRealCoord] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    distanceMeters: number;
  } | null>(null);

  // Haversine formula
  const getDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const handleRequestRealGps = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      setIsDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(5));
          const lon = parseFloat(pos.coords.longitude.toFixed(5));
          const dist = getDistanceMeters(lat, lon, settings.latitude, settings.longitude);
          setRealCoord({
            latitude: lat,
            longitude: lon,
            address: `Koordinat Nyata (${lat}, ${lon})`,
            distanceMeters: dist,
          });
          setUseRealGps(true);
          setIsDetectingGps(false);
          showToast(`Lokasi GPS asli terdeteksi! Jarak ke HQ: ${dist} meter`, 'info');
        },
        (err) => {
          setIsDetectingGps(false);
          showToast(`Izin lokasi GPS tidak diberikan: ${err.message}`, 'warning');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      showToast('Fitur GPS browser tidak didukung pada platform ini.', 'warning');
    }
  };

  // Active coordinates
  const currentCoord = useRealGps && realCoord
    ? realCoord
    : {
        latitude: settings.latitude,
        longitude: settings.longitude,
        address: `${settings.officeName} - Area Kantor Pusat`,
        distanceMeters: 35,
      };

  const distanceMeters = currentCoord.distanceMeters;
  const isInsideGeofence = distanceMeters <= settings.geofenceRadiusMeters;

  const handleTriggerCheckIn = () => {
    if (workType === 'WFO' && !isInsideGeofence) {
      showToast(
        `Lokasi Anda berada di luar radius kantor (${distanceMeters}m dari batas ${settings.geofenceRadiusMeters}m). Harap lakukan presensi di area kantor.`,
        'error'
      );
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const res = checkIn(workType, notes);
      setIsProcessing(false);
      setShowConfirmModal(false);

      if (res.success) {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes()
        ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;

        const [startH, startM] = settings.workStartTime.split(':').map(Number);
        const lateM = now.getHours() * 60 + now.getMinutes() - (startH * 60 + startM);
        const isLate = lateM > settings.lateToleranceMinutes;

        setSuccessInfo({
          time: timeStr,
          isLate,
          statusText: isLate ? `Terlambat ${lateM - settings.lateToleranceMinutes}m` : 'Hadir Tepat Waktu',
        });
        setShowSuccessModal(true);
      }
    }, 400);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Portal Presensi Harian</Text>
          <Text style={styles.pageSubtitle}>
            Catat jam masuk dan pulang kerja secara akurat & terverifikasi GPS.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigateTo('employee_dashboard')}
        >
          <Text style={styles.backBtnText}>← Kembali ke Dashboard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainGrid}>
        {/* Left Column: Form & Check-in / Check-out */}
        <View style={styles.leftCol}>
          {/* Status & Work Mode Card */}
          <View style={[styles.card, SHADOWS.card]}>
            <Text style={styles.cardSectionTitle}>1. Mode Kehadiran Hari Ini</Text>
            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[
                  styles.modeOption,
                  workType === 'WFO' && styles.modeOptionActive,
                ]}
                onPress={() => setWorkType('WFO')}
                disabled={!!todayAttendance}
              >
                <Text style={{ fontSize: 24, marginBottom: 4 }}>🏢</Text>
                <Text
                  style={[
                    styles.modeOptionTitle,
                    workType === 'WFO' && styles.modeOptionTitleActive,
                  ]}
                >
                  Work From Office (WFO)
                </Text>
                <Text style={styles.modeOptionDesc}>Bekerja langsung di kantor pusat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeOption,
                  workType === 'WFH' && styles.modeOptionActive,
                ]}
                onPress={() => setWorkType('WFH')}
                disabled={!!todayAttendance}
              >
                <Text style={{ fontSize: 24, marginBottom: 4 }}>🏠</Text>
                <Text
                  style={[
                    styles.modeOptionTitle,
                    workType === 'WFH' && styles.modeOptionTitleActive,
                  ]}
                >
                  Work From Home (WFH)
                </Text>
                <Text style={styles.modeOptionDesc}>Bekerja remote / dari rumah</Text>
              </TouchableOpacity>
            </View>

            {/* GPS Location & Radius Card */}
            <View style={styles.locationBox}>
              <View style={styles.locationHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, marginRight: 8 }}>📍</Text>
                  <Text style={styles.locationTitle}>Verifikasi Lokasi GPS</Text>
                </View>
                <Badge
                  label={
                    workType === 'WFH'
                      ? 'Mode Remote Terverifikasi'
                      : isInsideGeofence
                      ? 'Dalam Radius Kantor'
                      : 'Di Luar Radius'
                  }
                  variant={
                    workType === 'WFH'
                      ? 'info'
                      : isInsideGeofence
                      ? 'success'
                      : 'error'
                  }
                />
              </View>

              <Text style={styles.locationAddress}>{currentCoord.address}</Text>

              <View style={styles.coordRow}>
                <Text style={styles.coordText}>
                  Koordinat: {currentCoord.latitude}, {currentCoord.longitude}
                </Text>
                <Text style={styles.distanceText}>
                  {workType === 'WFO'
                    ? `Jarak ke HQ: ±${distanceMeters} m (Maks: ${settings.geofenceRadiusMeters}m)`
                    : 'WFH: Lokasi dicatat untuk kepatuhan regulasi'}
                </Text>
              </View>

              {/* GPS toggle / detect button */}
              <View style={{ marginTop: 10, flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: useRealGps ? COLORS.lightBlue : '#F1F5F9',
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: useRealGps ? COLORS.skyBlue : '#E2E8F0',
                  }}
                  onPress={handleRequestRealGps}
                  disabled={isDetectingGps}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.primaryDark }}>
                    {isDetectingGps ? '⏳ Mendeteksi GPS...' : '📡 Gunakan GPS Asli Perangkat'}
                  </Text>
                </TouchableOpacity>

                {useRealGps && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#FFFFFF',
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#CBD5E1',
                    }}
                    onPress={() => setUseRealGps(false)}
                  >
                    <Text style={{ fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' }}>
                      Reset ke Mode Kantor
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Notes input */}
            <View style={styles.notesBox}>
              <Text style={styles.inputLabel}>Catatan Presensi (Opsional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: Fokus pengerjaan fitur checkout & meeting klien..."
                placeholderTextColor="#94A3B8"
                value={notes}
                onChangeText={setNotes}
                editable={!todayAttendance}
              />
            </View>

            {/* Big Action Button */}
            <View style={{ marginTop: 20 }}>
              {!todayAttendance ? (
                <TouchableOpacity
                  style={styles.bigCheckInBtn}
                  onPress={() => setShowConfirmModal(true)}
                  activeOpacity={0.8}
                >
                  <Clock size={28} color="#FFFFFF" style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bigCheckInText}>Lakukan Check-In Masuk</Text>
                    <Text style={styles.bigCheckInSub}>
                      Simpan timestamp & verifikasi kehadiran hari ini
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : !todayAttendance.checkOutTime ? (
                <View>
                  <View style={styles.alreadyInBanner}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <CheckCircle2 size={16} color="#15803D" style={{ marginRight: 6 }} />
                      <Text style={styles.alreadyInTitle}>
                        Anda sudah Check-in pada pukul {todayAttendance.checkInTime} WIB
                      </Text>
                    </View>
                    <Text style={styles.alreadyInSub}>
                      Mode: {todayAttendance.workType} • Status:{' '}
                      {todayAttendance.isLate
                        ? `Terlambat ${todayAttendance.lateMinutes} menit`
                        : 'Tepat Waktu'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.bigCheckOutBtn}
                    onPress={() => checkOut()}
                    activeOpacity={0.8}
                  >
                    <LogOut size={28} color="#FFFFFF" style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bigCheckInText}>Lakukan Check-Out Pulang</Text>
                      <Text style={styles.bigCheckInSub}>
                        Akhiri jam kerja & simpan total akumulasi jam kerja
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.completedCard}>
                  <CheckCircle2 size={36} color="#15803D" style={{ marginBottom: 6 }} />
                  <Text style={styles.completedTitle}>Absensi Hari Ini Lengkap!</Text>
                  <Text style={styles.completedSub}>
                    Check-in: {todayAttendance.checkInTime} WIB | Check-out:{' '}
                    {todayAttendance.checkOutTime} WIB
                  </Text>
                  <Text style={styles.completedDuration}>
                    Total Durasi Kerja: {todayAttendance.workDurationHours} Jam{' '}
                    {todayAttendance.workDurationMinutes} Menit
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Right Column: Clock & Attendance Policy */}
        <View style={styles.rightCol}>
          <DigitalClock />

          <View style={[styles.policyCard, SHADOWS.card]}>
            <Text style={styles.policyTitle}>📋 Aturan & Ketentuan Presensi</Text>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleBullet}>•</Text>
              <Text style={styles.ruleText}>
                Jam masuk resmi kantor: <Text style={styles.bold}>{settings.workStartTime} WIB</Text>
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleBullet}>•</Text>
              <Text style={styles.ruleText}>
                Toleransi keterlambatan maksimal:{' '}
                <Text style={styles.bold}>{settings.lateToleranceMinutes} menit</Text> (hingga pukul{' '}
                08:45 WIB).
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleBullet}>•</Text>
              <Text style={styles.ruleText}>
                Jam pulang resmi kantor: <Text style={styles.bold}>{settings.workEndTime} WIB</Text>.
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleBullet}>•</Text>
              <Text style={styles.ruleText}>
                Presensi WFO wajib mengaktifkan GPS dan berada dalam radius{' '}
                <Text style={styles.bold}>{settings.geofenceRadiusMeters} meter</Text> dari kantor.
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleBullet}>•</Text>
              <Text style={styles.ruleText}>
                Duplikasi presensi pada tanggal yang sama dicegah secara otomatis oleh sistem server.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        title="Konfirmasi Presensi Masuk"
        subtitle="Pastikan data kehadiran Anda sudah sesuai sebelum disimpan."
        onClose={() => setShowConfirmModal(false)}
      >
        <View style={{ paddingTop: 6 }}>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>Nama Karyawan:</Text>
            <Text style={styles.confirmVal}>{currentUser?.name}</Text>
          </View>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>Departemen:</Text>
            <Text style={styles.confirmVal}>{currentUser?.department}</Text>
          </View>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>Mode Kerja:</Text>
            <Text style={[styles.confirmVal, { color: COLORS.primary }]}>{workType}</Text>
          </View>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>Verifikasi Lokasi:</Text>
            <Text style={[styles.confirmVal, { color: COLORS.success }]}>
              {workType === 'WFO' ? 'Menara Mandiri Sudirman (Dalam Radius)' : 'Lokasi Remote (WFH)'}
            </Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelModalBtn}
              onPress={() => setShowConfirmModal(false)}
              disabled={isProcessing}
            >
              <Text style={styles.cancelModalText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitModalBtn, isProcessing && { opacity: 0.8 }]}
              onPress={handleTriggerCheckIn}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={[styles.submitModalText, { marginLeft: 8 }]}>Memvalidasi...</Text>
                </View>
              ) : (
                <Text style={styles.submitModalText}>Ya, Check-In Sekarang</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Checkmark celebratory modal on success */}
      <CheckmarkModal
        visible={showSuccessModal}
        time={successInfo.time}
        statusText={successInfo.statusText}
        isLate={successInfo.isLate}
        workType={workType}
        onClose={() => setShowSuccessModal(false)}
      />
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
    marginBottom: 16,
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
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  mainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  leftCol: {
    flex: 3,
    minWidth: 280,
  },
  rightCol: {
    flex: 2,
    minWidth: 280,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.softNavy,
    marginBottom: 14,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  modeOption: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  modeOptionActive: {
    backgroundColor: COLORS.lightBlue,
    borderColor: COLORS.primary,
  },
  modeOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modeOptionTitleActive: {
    color: COLORS.primaryDark,
  },
  modeOptionDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  locationBox: {
    backgroundColor: '#FAFBFD',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  locationAddress: {
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: 8,
  },
  coordRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
    paddingTop: 8,
  },
  coordText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  distanceText: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: '600',
    marginTop: 2,
  },
  notesBox: {
    marginBottom: 10,
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
  bigCheckInBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  bigCheckInIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  bigCheckInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  bigCheckInSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    marginTop: 2,
  },
  alreadyInBanner: {
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  alreadyInTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  alreadyInSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bigCheckOutBtn: {
    backgroundColor: COLORS.error,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  completedCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
  },
  completedSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  completedDuration: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
    marginTop: 8,
  },
  policyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.softNavy,
    marginBottom: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ruleBullet: {
    fontSize: 14,
    color: COLORS.primary,
    marginRight: 8,
    marginTop: -2,
  },
  ruleText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  bold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  confirmLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  confirmVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.softNavy,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelModalText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  submitModalBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitModalText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
