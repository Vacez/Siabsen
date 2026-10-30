import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  useWindowDimensions,
} from 'react-native';
import Svg, { Rect, Line, Circle, Text as SvgText } from 'react-native-svg';
import {
  AlertTriangle,
  FileSpreadsheet,
  LayoutGrid,
  TableProperties,
  Search,
} from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';

export const AdminDashboardScreen: React.FC = () => {
  const { users, attendance, leaveRequests, navigateTo, todayDateStr } = useApp();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [searchEmployee, setSearchEmployee] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(isMobile ? 'cards' : 'table');

  const todayStr = todayDateStr;
  const activeEmployees = users.filter((u) => u.status === 'active' && u.role === 'employee');
  const todayAttendance = attendance.filter((a) => a.date === todayStr);

  const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
  const lateCount = todayAttendance.filter((a) => a.isLate).length;
  const totalAttendedToday = todayAttendance.length;
  const absentCount = Math.max(0, activeEmployees.length - totalAttendedToday);

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');
  const activeLeaveToday = leaveRequests.filter(
    (l) => l.status === 'approved' && l.startDate <= todayStr && l.endDate >= todayStr
  );

  // Departments list
  const departments = [
    'all',
    'Teknologi & IT',
    'Desain Produk',
    'Keuangan & Akuntansi',
    'Pemasaran & Bisnis',
  ];

  // Dynamic department statistics calculated from actual database
  const deptStats = departments
    .filter((d) => d !== 'all')
    .map((deptName) => {
      const deptEmployees = activeEmployees.filter((e) => e.department === deptName);
      const totalDept = deptEmployees.length;
      if (totalDept === 0) return { name: deptName, rate: 0, count: '0 Karyawan' };

      const presentDept = deptEmployees.filter((e) =>
        todayAttendance.some((a) => a.userId === e.id)
      ).length;

      const lateDept = deptEmployees.filter((e) =>
        todayAttendance.some((a) => a.userId === e.id && a.isLate)
      ).length;

      const onLeaveDept = deptEmployees.filter((e) =>
        activeLeaveToday.some((l) => l.userId === e.id)
      ).length;

      const rate = Math.round((presentDept / totalDept) * 100);
      let countStr = `${presentDept}/${totalDept} Hadir`;
      if (lateDept > 0) countStr += ` (${lateDept} Terlambat)`;
      if (onLeaveDept > 0) countStr += ` (${onLeaveDept} Cuti/Sakit)`;

      return {
        name: deptName,
        rate,
        count: countStr,
      };
    });

  // Dynamic past 5 workdays trends from actual attendance
  const recentDays = [-4, -3, -2, -1, 0].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const label = offset === 0 ? `${dayNames[d.getDay()]} (Hr)` : dayNames[d.getDay()];

    const atts = attendance.filter((a) => a.date === dateStr);
    const presentTotal = atts.filter((a) => a.status === 'present').length;
    const lateTotal = atts.filter((a) => a.isLate).length;
    const totalPossible = Math.max(activeEmployees.length, 1);

    const presentRate = Math.min(100, Math.round(((presentTotal + lateTotal) / totalPossible) * 100));
    const lateRate = Math.min(100, Math.round((lateTotal / totalPossible) * 100));

    const presentH = Math.max(8, Math.round((presentRate / 100) * 80));
    const lateH = lateRate > 0 ? Math.max(6, Math.round((lateRate / 100) * 80)) : 0;

    return {
      dateStr,
      label,
      presentRate,
      lateRate,
      presentH,
      lateH,
      isToday: offset === 0,
    };
  });

  // Live employee attendance status builder
  const employeeStatusList = activeEmployees.map((emp) => {
    const att = todayAttendance.find((a) => a.userId === emp.id);
    const leave = activeLeaveToday.find((l) => l.userId === emp.id);

    let statusKey: 'present' | 'late' | 'absent' | 'leave' = 'absent';
    let label = 'Belum Absen';
    let variant: 'success' | 'warning' | 'error' | 'info' | 'muted' = 'muted';

    if (leave) {
      statusKey = 'leave';
      label = `Sedang ${leave.type.toUpperCase()}`;
      variant = 'info';
    } else if (att) {
      if (att.isLate) {
        statusKey = 'late';
        label = `Terlambat (${att.lateMinutes}m)`;
        variant = 'warning';
      } else {
        statusKey = 'present';
        label = 'Hadir Tepat Waktu';
        variant = 'success';
      }
    }

    return {
      employee: emp,
      attendance: att,
      statusKey,
      label,
      variant,
    };
  });

  const filteredList = employeeStatusList.filter((item) => {
    const matchSearch =
      item.employee.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      item.employee.id.toLowerCase().includes(searchEmployee.toLowerCase());

    const matchDept = selectedDept === 'all' || item.employee.department === selectedDept;
    const matchStatus = selectedStatus === 'all' || item.statusKey === selectedStatus;

    return matchSearch && matchDept && matchStatus;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Dashboard Eksekutif & HR</Text>
          <Text style={styles.pageSubtitle}>
            Pantau kehadiran seluruh tim secara real-time, grafik tren, dan persetujuan pengajuan.
          </Text>
        </View>

        {pendingLeaves.length > 0 ? (
          <TouchableOpacity
            style={styles.pendingActionAlert}
            onPress={() => navigateTo('approvals')}
            activeOpacity={0.8}
          >
            <AlertTriangle size={18} color="#D97706" style={{ marginRight: 8 }} />
            <View>
              <Text style={styles.pendingActionTitle}>
                {pendingLeaves.length} Pengajuan Menunggu Persetujuan
              </Text>
              <Text style={styles.pendingActionSub}>Klik untuk meninjau keputusan →</Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 6 Key KPI Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Karyawan Aktif"
          value={activeEmployees.length}
          subtitle="Pegawai terdaftar"
          iconText="👥"
          accentColor={COLORS.primary}
        />
        <StatCard
          title="Hadir Hari Ini"
          value={presentCount}
          subtitle="Tepat waktu"
          iconText="✅"
          accentColor={COLORS.success}
        />
        <StatCard
          title="Terlambat Hari Ini"
          value={lateCount}
          subtitle="Lewat toleransi 15m"
          iconText="⚠️"
          accentColor={COLORS.warning}
        />
        <StatCard
          title="Belum Absen"
          value={absentCount}
          subtitle="Belum melakukan check-in"
          iconText="⏳"
          accentColor={COLORS.textMuted}
        />
        <StatCard
          title="Sedang Cuti / Izin"
          value={activeLeaveToday.length}
          subtitle="Pengajuan disetujui"
          iconText="🏖️"
          accentColor={COLORS.skyBlue}
        />
        <StatCard
          title="Menunggu Persetujuan"
          value={pendingLeaves.length}
          subtitle="Butuh keputusan pimpinan"
          iconText="📝"
          accentColor={COLORS.error}
        />
      </View>

      {/* SVG Charts Row: Attendance Trend & Department Breakdown */}
      <View style={styles.chartsRow}>
        {/* Weekly Trend Bar Chart */}
        <View style={[styles.chartCard, SHADOWS.card]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Grafik Tren Kehadiran Mingguan</Text>
              <Text style={styles.chartSubtitle}>Tingkat presensi tim 5 hari kerja terakhir</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>Hadir (%)</Text>
              <View style={[styles.legendDot, { backgroundColor: COLORS.warning, marginLeft: 10 }]} />
              <Text style={styles.legendText}>Terlambat (%)</Text>
            </View>
          </View>

          {/* SVG Bar Chart Visualization */}
          <View style={{ alignItems: 'center', marginTop: 14 }}>
            <Svg width="360" height="150" viewBox="0 0 360 150">
              {/* Grid Lines */}
              <Line x1="40" y1="20" x2="350" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <Line x1="40" y1="60" x2="350" y2="60" stroke="#F1F5F9" strokeWidth="1" />
              <Line x1="40" y1="100" x2="350" y2="100" stroke="#F1F5F9" strokeWidth="1" />

              {/* Y Axis labels */}
              <SvgText x="10" y="24" fontSize="10" fill="#94A3B8" fontWeight="600">100%</SvgText>
              <SvgText x="15" y="64" fontSize="10" fill="#94A3B8" fontWeight="600">50%</SvgText>
              <SvgText x="20" y="104" fontSize="10" fill="#94A3B8" fontWeight="600">0%</SvgText>

              {/* Dynamic 5-day Bars from actual attendance */}
              {recentDays.map((day, idx) => {
                const xPos = 65 + idx * 60;
                return (
                  <React.Fragment key={day.dateStr}>
                    {/* Present Bar */}
                    <Rect
                      x={xPos}
                      y={100 - day.presentH}
                      width="20"
                      height={day.presentH}
                      rx="4"
                      fill={day.isToday ? COLORS.primary : '#60A5FA'}
                    />
                    {/* Late Bar */}
                    {day.lateH > 0 && (
                      <Rect
                        x={xPos + 22}
                        y={100 - day.lateH}
                        width="10"
                        height={day.lateH}
                        rx="3"
                        fill={COLORS.warning}
                      />
                    )}
                    {/* Day label */}
                    <SvgText
                      x={xPos + 2}
                      y="125"
                      fontSize="10"
                      fill={day.isToday ? COLORS.primaryDark : '#64748B'}
                      fontWeight={day.isToday ? '800' : '600'}
                    >
                      {day.label}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>
        </View>

        {/* Department Attendance Distribution */}
        <View style={[styles.chartCard, SHADOWS.card]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Distribusi Kehadiran Departemen</Text>
              <Text style={styles.chartSubtitle}>Rasio hadir hari ini per divisi (Database Aktif)</Text>
            </View>
          </View>

          <View style={{ marginTop: 12, gap: 10 }}>
            {deptStats.map((d) => (
              <View key={d.name} style={styles.deptProgressRow}>
                <View style={styles.deptProgressInfo}>
                  <Text style={styles.deptNameText}>{d.name}</Text>
                  <Text style={styles.deptCountText}>{d.count}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${d.rate}%`,
                        backgroundColor: d.rate > 80 ? COLORS.success : d.rate > 40 ? COLORS.warning : COLORS.error,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Real-time Monitoring Table for Today */}
      <View style={[styles.tableCard, SHADOWS.card]}>
        <View style={styles.tableCardHeader}>
          <View>
            <Text style={styles.tableCardTitle}>Monitoring Kehadiran Real-time Hari Ini</Text>
            <Text style={styles.tableCardSub}>
              Data langsung sinkron dengan check-in mobile & web karyawan.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.rekapReportBtn}
            onPress={() => navigateTo('reports')}
            activeOpacity={0.7}
          >
            <FileSpreadsheet size={15} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.rekapReportText}>Lihat Rekap Bulanan</Text>
          </TouchableOpacity>
        </View>

        {/* Search & Filters */}
        <View style={styles.filterBar}>
          <TextInput
            style={styles.filterSearchInput}
            placeholder="Cari nama karyawan atau ID..."
            placeholderTextColor="#94A3B8"
            value={searchEmployee}
            onChangeText={setSearchEmployee}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {departments.map((dept) => (
                <TouchableOpacity
                  key={dept}
                  style={[
                    styles.deptPill,
                    selectedDept === dept && styles.deptPillActive,
                  ]}
                  onPress={() => setSelectedDept(dept)}
                >
                  <Text
                    style={[
                      styles.deptPillText,
                      selectedDept === dept && styles.deptPillTextActive,
                    ]}
                  >
                    {dept === 'all' ? 'Semua Divisi' : dept}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* View Mode Toggle: Cards vs Table on Mobile */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            marginTop: 4,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textSecondary }}>
            {filteredList.length} Karyawan Tercatat:
          </Text>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#F1F5F9',
              borderRadius: 8,
              padding: 2,
            }}
          >
            <TouchableOpacity
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 6,
                },
                viewMode === 'cards' && {
                  backgroundColor: '#FFFFFF',
                  elevation: 2,
                },
              ]}
              onPress={() => setViewMode('cards')}
            >
              <LayoutGrid
                size={13}
                color={viewMode === 'cards' ? COLORS.primaryDark : COLORS.textMuted}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: viewMode === 'cards' ? '800' : '600',
                  color: viewMode === 'cards' ? COLORS.primaryDark : COLORS.textMuted,
                }}
              >
                Kartu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 6,
                },
                viewMode === 'table' && {
                  backgroundColor: '#FFFFFF',
                  elevation: 2,
                },
              ]}
              onPress={() => setViewMode('table')}
            >
              <TableProperties
                size={13}
                color={viewMode === 'table' ? COLORS.primaryDark : COLORS.textMuted}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: viewMode === 'table' ? '800' : '600',
                  color: viewMode === 'table' ? COLORS.primaryDark : COLORS.textMuted,
                }}
              >
                Tabel
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {viewMode === 'cards' ? (
          /* Cards View Mode: Fits any screen without scrolling off */
          <View style={{ gap: 10, marginBottom: 8 }}>
            {filteredList.map((item) => (
              <View
                key={item.employee.id}
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  padding: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Image source={{ uri: item.employee.avatar }} style={styles.empAvatar} />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.empName}>{item.employee.name}</Text>
                      <Text style={styles.empId}>
                        {item.employee.id} • {item.employee.department}
                      </Text>
                    </View>
                  </View>
                  <Badge label={item.label} variant={item.variant} size="sm" />
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 8,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: '#EEF2F6',
                  }}
                >
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: COLORS.textMuted }}>
                      MASUK
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.textPrimary }}>
                      {item.attendance ? item.attendance.checkInTime : '--:--:--'}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: COLORS.textMuted }}>
                      PULANG
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.textPrimary }}>
                      {item.attendance?.checkOutTime ? item.attendance.checkOutTime : '--:--:--'}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: COLORS.textMuted }}>
                      MODE
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.primaryDark }}>
                      {item.attendance ? item.attendance.workType : '-'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          /* Table rows */
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={[styles.tableGridWrapper, { minWidth: 620 }]}>
              <View style={styles.gridHeadRow}>
                <Text style={[styles.gridHeadCell, { flex: 2 }]}>KARYAWAN</Text>
                <Text style={[styles.gridHeadCell, { flex: 1.5 }]}>DEPARTEMEN</Text>
                <Text style={[styles.gridHeadCell, { flex: 1 }]}>CHECK-IN</Text>
                <Text style={[styles.gridHeadCell, { flex: 1 }]}>CHECK-OUT</Text>
                <Text style={[styles.gridHeadCell, { flex: 1.4 }]}>STATUS</Text>
                <Text style={[styles.gridHeadCell, { flex: 1 }]}>MODE</Text>
              </View>

              {filteredList.map((item, index) => (
                <View
                  key={item.employee.id}
                  style={[
                    styles.gridRow,
                    index % 2 === 1 && { backgroundColor: '#F8FAFC' },
                  ]}
                >
                  {/* Employee info */}
                  <View
                    style={[
                      styles.gridCell,
                      { flex: 2, flexDirection: 'row', alignItems: 'center' },
                    ]}
                  >
                    <Image source={{ uri: item.employee.avatar }} style={styles.empAvatar} />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.empName}>{item.employee.name}</Text>
                      <Text style={styles.empId}>
                        {item.employee.id} • {item.employee.position}
                      </Text>
                    </View>
                  </View>

                  {/* Department */}
                  <View style={[styles.gridCell, { flex: 1.5 }]}>
                    <Text style={styles.cellDeptText}>{item.employee.department}</Text>
                  </View>

                  {/* Check-in */}
                  <View style={[styles.gridCell, { flex: 1 }]}>
                    <Text style={styles.cellTimeText}>
                      {item.attendance ? item.attendance.checkInTime : '--:--:--'}
                    </Text>
                  </View>

                  {/* Check-out */}
                  <View style={[styles.gridCell, { flex: 1 }]}>
                    <Text style={styles.cellTimeText}>
                      {item.attendance?.checkOutTime ? item.attendance.checkOutTime : '--:--:--'}
                    </Text>
                  </View>

                  {/* Status */}
                  <View style={[styles.gridCell, { flex: 1.4 }]}>
                    <Badge label={item.label} variant={item.variant} size="sm" />
                  </View>

                  {/* Mode */}
                  <View style={[styles.gridCell, { flex: 1 }]}>
                    <Text style={styles.cellModeText}>
                      {item.attendance ? item.attendance.workType : '-'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
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
  pendingActionAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pendingActionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9A3412',
  },
  pendingActionSub: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: '700',
    marginTop: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 20,
  },
  chartsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 24,
  },
  chartCard: {
    flex: 1,
    minWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  chartSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  deptProgressRow: {
    marginBottom: 8,
  },
  deptProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  deptNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  deptCountText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  tableCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FAFBFD',
  },
  tableCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  tableCardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rekapReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    borderWidth: 1,
    borderColor: COLORS.skyBlue,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  rekapReportText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  filterBar: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterSearchInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  deptPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  deptPillActive: {
    backgroundColor: COLORS.lightBlue,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  deptPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  deptPillTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  tableGridWrapper: {
    overflow: 'hidden',
  },
  gridHeadRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  gridHeadCell: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  gridCell: {
    justifyContent: 'center',
  },
  empAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.lightBlue,
  },
  empName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.softNavy,
  },
  empId: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  cellDeptText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cellTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cellModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
});
