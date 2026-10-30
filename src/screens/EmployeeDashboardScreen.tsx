import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { DigitalClock } from '../components/DigitalClock';
import { Badge } from '../components/Badge';
import { StatCard } from '../components/StatCard';
import { RequestProgressBar } from '../components/RequestProgressBar';
import { Clock, LogOut, CalendarDays, Bell, CheckCircle2 } from 'lucide-react-native';

export const EmployeeDashboardScreen: React.FC = () => {
  const {
    currentUser,
    todayAttendance,
    checkIn,
    checkOut,
    attendance,
    leaveRequests,
    notifications,
    navigateTo,
    cancelLeaveRequest,
  } = useApp();

  const [liveWorkSeconds, setLiveWorkSeconds] = useState(0);

  // Admin announcements & recent notifications
  const recentAlerts = notifications
    .filter((n) => n.userId === 'all' || n.userId === currentUser?.id)
    .slice(0, 2);

  // Filter attendance for current employee
  const myAttendance = attendance.filter((a) => a.userId === currentUser?.id);
  const presentDays = myAttendance.filter((a) => a.status === 'present').length;
  const lateDays = myAttendance.filter((a) => a.isLate).length;
  
  // My leave requests
  const myLeaves = leaveRequests.filter((l) => l.userId === currentUser?.id);
  const approvedLeaves = myLeaves.filter((l) => l.status === 'approved').length;

  // Live timer for work duration if checked in today and not checked out
  useEffect(() => {
    if (!todayAttendance || todayAttendance.checkOutTime) {
      setLiveWorkSeconds(0);
      return;
    }

    const [h, m, s] = todayAttendance.checkInTime.split(':').map(Number);
    const inDate = new Date();
    inDate.setHours(h, m, s, 0);

    const updateTimer = () => {
      const now = new Date();
      const diffSec = Math.max(0, Math.floor((now.getTime() - inDate.getTime()) / 1000));
      setLiveWorkSeconds(diffSec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [todayAttendance]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getAttendanceStatusBadge = () => {
    if (!todayAttendance) {
      return { label: 'Belum Absen', variant: 'muted' as const };
    }
    if (todayAttendance.checkOutTime) {
      return { label: 'Sudah Check-out (Selesai Bekerja)', variant: 'success' as const };
    }
    if (todayAttendance.isLate) {
      return { label: `Sedang Bekerja (Terlambat ${todayAttendance.lateMinutes}m)`, variant: 'warning' as const };
    }
    return { label: 'Sedang Bekerja (Tepat Waktu)', variant: 'info' as const };
  };

  const currentStatus = getAttendanceStatusBadge();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Welcome Banner */}
      <View style={[styles.welcomeCard, SHADOWS.card]}>
        <View style={styles.welcomeLeft}>
          <Text style={styles.greetingTitle}>
            Selamat pagi, {currentUser?.name} ☁️
          </Text>
          <Text style={styles.greetingSub}>
            "Semoga harimu produktif! Hadir Tepat, Kerja Hebat."
          </Text>
          <View style={styles.positionBadge}>
            <Text style={styles.positionText}>
              {currentUser?.position} • {currentUser?.department}
            </Text>
          </View>
        </View>
        <View style={styles.clockWrap}>
          <DigitalClock />
        </View>
      </View>

      {/* Admin Notification & Announcement Banner */}
      {recentAlerts.length > 0 && (
        <View
          style={{
            backgroundColor: '#EFF6FF',
            borderRadius: 14,
            padding: 14,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#BFDBFE',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#DBEAFE',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Bell size={18} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.softNavy }}>
              {recentAlerts[0].title}
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
              {recentAlerts[0].message}
            </Text>
          </View>
        </View>
      )}

      {/* Main Attendance Action Card */}
      <View style={[styles.actionCard, SHADOWS.card]}>
        <View style={styles.actionCardHeader}>
          <View>
            <Text style={styles.actionCardTitle}>Status Presensi Hari Ini</Text>
            <Text style={styles.actionCardSub}>Jadwal Kantor: 08:30 - 17:30 WIB (Toleransi 15 Menit)</Text>
          </View>
          <Badge label={currentStatus.label} variant={currentStatus.variant} />
        </View>

        <View style={styles.attendanceInfoRow}>
          <View style={styles.timeInfoBox}>
            <Text style={styles.timeInfoLabel}>JAM CHECK-IN</Text>
            <Text style={styles.timeInfoVal}>
              {todayAttendance ? todayAttendance.checkInTime : '--:--:--'}
            </Text>
            {todayAttendance?.isLate ? (
              <Text style={{ fontSize: 11, color: COLORS.warning, fontWeight: '700' }}>
                Terlambat {todayAttendance.lateMinutes} mnt
              </Text>
            ) : todayAttendance ? (
              <Text style={{ fontSize: 11, color: COLORS.success, fontWeight: '700' }}>
                Tepat Waktu
              </Text>
            ) : null}
          </View>

          <View style={styles.timeInfoBox}>
            <Text style={styles.timeInfoLabel}>DURASI KERJA HARI INI</Text>
            <Text style={[styles.timeInfoVal, { color: COLORS.primary }]}>
              {todayAttendance && !todayAttendance.checkOutTime
                ? formatTimer(liveWorkSeconds)
                : todayAttendance?.workDurationHours !== undefined
                ? `${todayAttendance.workDurationHours}j ${todayAttendance.workDurationMinutes}m`
                : '00:00:00'}
            </Text>
            <Text style={{ fontSize: 11, color: COLORS.textMuted }}>
              {todayAttendance && !todayAttendance.checkOutTime ? 'Live Timer Berjalan' : 'Total Jam Tercatat'}
            </Text>
          </View>

          <View style={styles.timeInfoBox}>
            <Text style={styles.timeInfoLabel}>JAM CHECK-OUT</Text>
            <Text style={styles.timeInfoVal}>
              {todayAttendance?.checkOutTime ? todayAttendance.checkOutTime : '--:--:--'}
            </Text>
            <Text style={{ fontSize: 11, color: COLORS.textMuted }}>
              {todayAttendance?.checkOutTime ? 'Presensi Selesai' : 'Belum Check-out'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          {!todayAttendance ? (
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => navigateTo('attendance')}
              activeOpacity={0.8}
            >
              <Clock size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryActionText}>Buka Portal Presensi Check-In</Text>
            </TouchableOpacity>
          ) : !todayAttendance.checkOutTime ? (
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: COLORS.error }]}
              onPress={() => checkOut()}
              activeOpacity={0.8}
            >
              <LogOut size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryActionText}>Lakukan Check-Out Sekarang</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.completedNotice}>
              <CheckCircle2 size={16} color="#15803D" style={{ marginRight: 6 }} />
              <Text style={styles.completedNoticeText}>
                Seluruh absensi hari ini lengkap. Selamat beristirahat!
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.leaveActionBtn}
            onPress={() => navigateTo('leave_request')}
            activeOpacity={0.8}
          >
            <CalendarDays size={16} color={COLORS.primaryDark} style={{ marginRight: 6 }} />
            <Text style={styles.leaveActionText}>Ajukan Cuti / Izin</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Monthly Summary Statistics */}
      <Text style={styles.sectionHeading}>Ringkasan Kehadiran Bulan Ini</Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="Hadir Tepat Waktu"
          value={presentDays}
          subtitle="Presensi harian tercatat"
          iconText="🎯"
          accentColor={COLORS.success}
        />
        <StatCard
          title="Terlambat"
          value={lateDays}
          subtitle="Melewati batas toleransi"
          iconText="⚠️"
          accentColor={COLORS.warning}
        />
        <StatCard
          title="Cuti / Izin Disetujui"
          value={approvedLeaves}
          subtitle="Hari pengajuan diterima"
          iconText="🏖️"
          accentColor={COLORS.primary}
        />
        <StatCard
          title="Sisa Kuota Cuti"
          value={`${currentUser?.remainingLeaveDays || 0} Hari`}
          subtitle="Cuti tahunan tersedia"
          iconText="🌴"
          accentColor={COLORS.skyBlue}
        />
      </View>

      {/* Recent Leave Requests Section */}
      <View style={[styles.recentSection, SHADOWS.card]}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Pengajuan Terakhir Saya</Text>
          <TouchableOpacity onPress={() => navigateTo('leave_request')}>
            <Text style={styles.viewAllText}>Lihat Semua →</Text>
          </TouchableOpacity>
        </View>

        {myLeaves.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>📋</Text>
            <Text style={styles.emptyTitle}>Belum ada riwayat pengajuan</Text>
            <Text style={styles.emptySub}>Ajukan cuti, izin, atau sakit melalui tombol di atas.</Text>
          </View>
        ) : (
          myLeaves.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.leaveItemCard}>
              <View style={styles.leaveItemTop}>
                <View>
                  <Text style={styles.leaveTypeTitle}>{item.subType}</Text>
                  <Text style={styles.leaveDates}>
                    📅 {item.startDate} s/d {item.endDate} ({item.daysCount} hari)
                  </Text>
                </View>
                <Badge
                  label={
                    item.status === 'pending'
                      ? 'Menunggu Persetujuan'
                      : item.status === 'approved'
                      ? 'Disetujui'
                      : item.status === 'rejected'
                      ? 'Ditolak'
                      : 'Dibatalkan'
                  }
                  variant={
                    item.status === 'approved'
                      ? 'success'
                      : item.status === 'pending'
                      ? 'warning'
                      : item.status === 'rejected'
                      ? 'error'
                      : 'muted'
                  }
                />
              </View>

              <Text style={styles.leaveReasonText}>"{item.reason}"</Text>

              {item.reviewNote ? (
                <View style={styles.reviewNoteBox}>
                  <Text style={styles.reviewNoteTitle}>
                    Catatan Pimpinan ({item.reviewedBy}):
                  </Text>
                  <Text style={styles.reviewNoteBody}>{item.reviewNote}</Text>
                </View>
              ) : null}

              {/* Progress bar timeline */}
              <RequestProgressBar
                status={item.status}
                createdAt={item.createdAt}
                reviewedAt={item.reviewedAt}
                reviewedBy={item.reviewedBy}
              />

              {item.status === 'pending' ? (
                <TouchableOpacity
                  style={styles.cancelRequestBtn}
                  onPress={() => cancelLeaveRequest(item.id)}
                >
                  <Text style={styles.cancelRequestText}>Batalkan Pengajuan</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 16,
  },
  welcomeLeft: {
    flex: 1,
    minWidth: 260,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.softNavy,
  },
  greetingSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  positionBadge: {
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#CFE6FB',
  },
  positionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  clockWrap: {
    minWidth: 260,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 24,
  },
  actionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
    marginBottom: 16,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  actionCardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  attendanceInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  timeInfoBox: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeInfoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  timeInfoVal: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.softNavy,
    marginVertical: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  primaryActionBtn: {
    flex: 2,
    minWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryActionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  leaveActionBtn: {
    flex: 1,
    minWidth: 160,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.lightBlue,
    borderWidth: 1,
    borderColor: COLORS.skyBlue,
  },
  leaveActionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  leaveActionText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
  completedNotice: {
    flex: 2,
    minWidth: 220,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 14,
    justifyContent: 'center',
  },
  completedNoticeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.softNavy,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  recentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  leaveItemCard: {
    backgroundColor: '#FAFBFD',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  leaveItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  leaveTypeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  leaveDates: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  leaveReasonText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  reviewNoteBox: {
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  reviewNoteTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  reviewNoteBody: {
    fontSize: 11,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  cancelRequestBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  cancelRequestText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.error,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.softNavy,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
