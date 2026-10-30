import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  Download,
  Printer,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Building,
  LayoutGrid,
  TableProperties,
  ArrowRight,
} from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';

export const ReportScreen: React.FC = () => {
  const { attendance, leaveRequests, showToast, todayDateStr } = useApp();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [selectedMonth, setSelectedMonth] = useState(todayDateStr.slice(0, 7));
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchEmployee, setSearchEmployee] = useState('');
  // On mobile default to 'cards' so it never cuts off or overflows; on desktop default to 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(isMobile ? 'cards' : 'table');

  const departments = [
    'all',
    'Teknologi & IT',
    'Desain Produk',
    'Keuangan & Akuntansi',
    'Pemasaran & Bisnis',
  ];

  const filteredAttendance = attendance.filter((a) => {
    const matchMonth = a.date.startsWith(selectedMonth);
    const matchDept = selectedDept === 'all' || a.department === selectedDept;
    const matchSearch =
      !searchEmployee ||
      a.userName.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      a.userId.toLowerCase().includes(searchEmployee.toLowerCase());
    return matchMonth && matchDept && matchSearch;
  });

  const totalHadir = filteredAttendance.filter((a) => a.status === 'present').length;
  const totalTerlambat = filteredAttendance.filter((a) => a.isLate).length;
  const totalJamKerja = filteredAttendance.reduce(
    (acc, curr) => acc + (curr.workDurationHours || 8),
    0
  );

  const approvedLeavesThisMonth = leaveRequests.filter(
    (l) => l.status === 'approved' && l.startDate.startsWith(selectedMonth)
  );
  const totalCutiDays = approvedLeavesThisMonth
    .filter((l) => l.type === 'cuti')
    .reduce((sum, l) => sum + l.daysCount, 0);
  const totalIzinDays = approvedLeavesThisMonth
    .filter((l) => l.type === 'izin')
    .reduce((sum, l) => sum + l.daysCount, 0);
  const totalSakitDays = approvedLeavesThisMonth
    .filter((l) => l.type === 'sakit')
    .reduce((sum, l) => sum + l.daysCount, 0);

  const handleExportCSV = () => {
    const headers = [
      'ID Presensi',
      'ID Karyawan',
      'Nama Karyawan',
      'Departemen',
      'Tanggal',
      'Jam Masuk',
      'Jam Pulang',
      'Durasi (Jam)',
      'Status',
      'Keterlambatan (Mnt)',
      'Mode Kerja',
      'Lokasi',
    ];

    const rows = filteredAttendance.map((a) => [
      a.id,
      a.userId,
      `"${a.userName}"`,
      `"${a.department}"`,
      a.date,
      a.checkInTime,
      a.checkOutTime || '-',
      a.workDurationHours || '-',
      a.status,
      a.lateMinutes,
      a.workType,
      `"${a.location?.address || 'Kantor Pusat'}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Laporan_Presensi_SiAbsen_${selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('File CSV berhasil diunduh ke perangkat Anda!', 'success');
    } else {
      showToast('File CSV berhasil dibuat dan siap diunduh.', 'success');
    }
  };

  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    } else {
      showToast('Mode cetak laporan disiapkan.', 'info');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: isMobile ? 14 : 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <Text style={[styles.pageTitle, isMobile && { fontSize: 20 }]}>
            Rekapitulasi & Laporan Kehadiran
          </Text>
          <Text style={styles.pageSubtitle}>
            Ekspor laporan presensi bulanan, evaluasi keterlambatan, dan jam kerja pegawai.
          </Text>
        </View>

        <View style={styles.actionBtnsRow}>
          <TouchableOpacity style={styles.printBtn} onPress={handlePrint} activeOpacity={0.7}>
            <Printer size={15} color={COLORS.softNavy} style={{ marginRight: 6 }} />
            <Text style={styles.printBtnText}>Cetak</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exportBtn} onPress={handleExportCSV} activeOpacity={0.7}>
            <Download size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.exportBtnText}>Ekspor CSV</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Card */}
      <View style={[styles.filterCard, SHADOWS.card]}>
        <View style={styles.filterInputsRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Periode Bulan:</Text>
            <View style={styles.monthPillRow}>
              {['2026-10', '2026-09', '2026-08'].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.monthPill, selectedMonth === m && styles.monthPillActive]}
                  onPress={() => setSelectedMonth(m)}
                >
                  <Text
                    style={[
                      styles.monthPillText,
                      selectedMonth === m && styles.monthPillTextActive,
                    ]}
                  >
                    {m === '2026-10'
                      ? 'Okt 2026'
                      : m === '2026-09'
                      ? 'Sep 2026'
                      : 'Agu 2026'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.filterItem, { flex: 1 }]}>
            <Text style={styles.filterLabel}>Departemen:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.monthPillRow}>
                {departments.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.monthPill, selectedDept === d && styles.monthPillActive]}
                    onPress={() => setSelectedDept(d)}
                  >
                    <Text
                      style={[
                        styles.monthPillText,
                        selectedDept === d && styles.monthPillTextActive,
                      ]}
                    >
                      {d === 'all' ? 'Semua Divisi' : d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Search by Employee Name / ID */}
        <View style={{ marginTop: 12 }}>
          <Text style={styles.filterLabel}>Cari Karyawan:</Text>
          <View style={styles.searchWrap}>
            <Search size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama karyawan atau ID (cth: Budi, USR-001)..."
              placeholderTextColor="#94A3B8"
              value={searchEmployee}
              onChangeText={setSearchEmployee}
            />
          </View>
        </View>
      </View>

      {/* KPI Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Kehadiran"
          value={filteredAttendance.length}
          subtitle={`Presensi tercatat ${selectedMonth}`}
          iconText="📅"
          accentColor={COLORS.primary}
        />
        <StatCard
          title="Hadir Tepat Waktu"
          value={totalHadir}
          subtitle="Tingkat kedisiplinan tinggi"
          iconText="🎯"
          accentColor={COLORS.success}
        />
        <StatCard
          title="Total Keterlambatan"
          value={totalTerlambat}
          subtitle="Perlu pembinaan"
          iconText="⚠️"
          accentColor={COLORS.warning}
        />
        <StatCard
          title="Akumulasi Jam Kerja"
          value={`${totalJamKerja} Jam`}
          subtitle="Total produktivitas tim"
          iconText="⏱️"
          accentColor={COLORS.skyBlue}
        />
      </View>

      {/* Secondary KPI: Cuti, Izin, Sakit */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Cuti Disetujui"
          value={`${totalCutiDays} Hari`}
          subtitle={`Bulan ${selectedMonth}`}
          iconText="🏖️"
          accentColor={COLORS.primary}
        />
        <StatCard
          title="Izin Disetujui"
          value={`${totalIzinDays} Hari`}
          subtitle="Keperluan mendesak"
          iconText="📝"
          accentColor={COLORS.warning}
        />
        <StatCard
          title="Sakit / Opname"
          value={`${totalSakitDays} Hari`}
          subtitle="Surat dokter terverifikasi"
          iconText="🏥"
          accentColor={COLORS.error}
        />
      </View>

      {/* Printable Report Sheet */}
      <View style={[styles.reportSheet, SHADOWS.card]}>
        {/* Sheet Header */}
        <View style={styles.sheetHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.companyTitle}>PT SIABSEN DIGITAL INDONESIA</Text>
            <Text style={[styles.reportDocumentTitle, isMobile && { fontSize: 16 }]}>
              LEMBAR REKAPITULASI KEHADIRAN
            </Text>
            <Text style={styles.documentMeta}>
              Periode: {selectedMonth} • {selectedDept === 'all' ? 'Semua Divisi' : selectedDept}
            </Text>
          </View>
          <View style={styles.validStampClean}>
            <CheckCircle2 size={13} color={COLORS.success} style={{ marginRight: 4 }} />
            <Text style={styles.validStampText}>TERVERIFIKASI</Text>
          </View>
        </View>

        {/* View Mode Toggle: Card View vs Table View */}
        <View style={styles.viewModeToggleRow}>
          <Text style={styles.viewModeLabel}>
            Menampilkan {filteredAttendance.length} data kehadiran:
          </Text>
          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'cards' && styles.toggleBtnActive]}
              onPress={() => setViewMode('cards')}
              activeOpacity={0.7}
            >
              <LayoutGrid
                size={14}
                color={viewMode === 'cards' ? COLORS.primaryDark : COLORS.textMuted}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.toggleBtnText,
                  viewMode === 'cards' && styles.toggleBtnTextActive,
                ]}
              >
                Kartu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'table' && styles.toggleBtnActive]}
              onPress={() => setViewMode('table')}
              activeOpacity={0.7}
            >
              <TableProperties
                size={14}
                color={viewMode === 'table' ? COLORS.primaryDark : COLORS.textMuted}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.toggleBtnText,
                  viewMode === 'table' && styles.toggleBtnTextActive,
                ]}
              >
                Tabel
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* VIEW MODE 1: MOBILE CARDS (Fits 100% cleanly without cutting off) */}
        {viewMode === 'cards' ? (
          <View style={styles.cardListWrapper}>
            {filteredAttendance.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={{ color: COLORS.textMuted }}>Tidak ada data kehadiran yang sesuai.</Text>
              </View>
            ) : (
              filteredAttendance.map((row) => (
                <View key={row.id} style={styles.recordCard}>
                  {/* Top: Date & Status */}
                  <View style={styles.recordCardTop}>
                    <View style={styles.recordDateWrap}>
                      <Calendar size={13} color={COLORS.primary} style={{ marginRight: 5 }} />
                      <Text style={styles.recordDateText}>{row.date}</Text>
                    </View>
                    <Badge
                      label={row.isLate ? `Terlambat (${row.lateMinutes}m)` : 'Tepat Waktu'}
                      variant={row.isLate ? 'warning' : 'success'}
                      size="sm"
                    />
                  </View>

                  {/* Middle: Name & Dept */}
                  <View style={styles.recordEmpRow}>
                    <Text style={styles.recordEmpName}>{row.userName}</Text>
                    <Text style={styles.recordEmpDept}>{row.department}</Text>
                  </View>

                  {/* Bottom: Times & Duration */}
                  <View style={styles.recordTimesRow}>
                    <View style={styles.timeBlock}>
                      <Text style={styles.timeBlockLabel}>MASUK</Text>
                      <Text style={styles.timeBlockVal}>{row.checkInTime}</Text>
                    </View>

                    <View style={styles.timeBlock}>
                      <Text style={styles.timeBlockLabel}>PULANG</Text>
                      <Text style={styles.timeBlockVal}>{row.checkOutTime || '--:--:--'}</Text>
                    </View>

                    <View style={styles.timeBlock}>
                      <Text style={styles.timeBlockLabel}>DURASI</Text>
                      <Text style={[styles.timeBlockVal, { color: COLORS.primaryDark }]}>
                        {row.workDurationHours !== undefined ? `${row.workDurationHours} Jam` : '8 Jam'}
                      </Text>
                    </View>

                    <View style={styles.timeBlock}>
                      <Text style={styles.timeBlockLabel}>MODE</Text>
                      <Text style={styles.timeBlockVal}>{row.workType}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          /* VIEW MODE 2: FULL DATA TABLE (With smooth horizontal scroll indicator) */
          <View>
            <View style={styles.tableScrollHint}>
              <Text style={styles.tableScrollHintText}>
                Geser ke kanan untuk melihat kolom lengkap →
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={[styles.tableWrapper, { minWidth: 680 }]}>
                <View style={styles.tHeadRow}>
                  <Text style={[styles.tHeadCell, { flex: 1.2 }]}>TANGGAL</Text>
                  <Text style={[styles.tHeadCell, { flex: 2 }]}>NAMA KARYAWAN</Text>
                  <Text style={[styles.tHeadCell, { flex: 1.6 }]}>DEPARTEMEN</Text>
                  <Text style={[styles.tHeadCell, { flex: 1.1 }]}>MASUK</Text>
                  <Text style={[styles.tHeadCell, { flex: 1.1 }]}>PULANG</Text>
                  <Text style={[styles.tHeadCell, { flex: 0.9 }]}>DURASI</Text>
                  <Text style={[styles.tHeadCell, { flex: 1.3 }]}>STATUS</Text>
                </View>

                {filteredAttendance.map((row, idx) => (
                  <View
                    key={row.id}
                    style={[
                      styles.tBodyRow,
                      idx % 2 === 1 && { backgroundColor: '#F8FAFC' },
                    ]}
                  >
                    <Text style={[styles.tCellText, { flex: 1.2, fontWeight: '700' }]}>
                      {row.date}
                    </Text>
                    <Text
                      style={[
                        styles.tCellText,
                        { flex: 2, fontWeight: '700', color: COLORS.softNavy },
                      ]}
                    >
                      {row.userName}
                    </Text>
                    <Text style={[styles.tCellText, { flex: 1.6, color: COLORS.textSecondary }]}>
                      {row.department}
                    </Text>
                    <Text style={[styles.tCellText, { flex: 1.1 }]}>{row.checkInTime}</Text>
                    <Text style={[styles.tCellText, { flex: 1.1 }]}>
                      {row.checkOutTime || '--:--'}
                    </Text>
                    <Text
                      style={[
                        styles.tCellText,
                        { flex: 0.9, color: COLORS.primaryDark, fontWeight: '700' },
                      ]}
                    >
                      {row.workDurationHours !== undefined ? `${row.workDurationHours}j` : '8j'}
                    </Text>
                    <View style={{ flex: 1.3 }}>
                      <Badge
                        label={row.isLate ? `Terlambat (${row.lateMinutes}m)` : 'Tepat Waktu'}
                        variant={row.isLate ? 'warning' : 'success'}
                        size="sm"
                      />
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Sign-off footer */}
        <View style={styles.signOffRow}>
          <View style={styles.signBox}>
            <Text style={styles.signLabel}>Dibuat Oleh:</Text>
            <View style={{ height: 32 }} />
            <Text style={styles.signName}>Sistem Otomatis SiAbsen</Text>
            <Text style={styles.signRole}>Timestamp Cloud Engine</Text>
          </View>

          <View style={styles.signBox}>
            <Text style={styles.signLabel}>Disetujui Oleh:</Text>
            <View style={{ height: 32 }} />
            <Text style={styles.signName}>Hendra Wijaya</Text>
            <Text style={styles.signRole}>COO & Head of HR</Text>
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
  actionBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  printBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.softNavy,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  filterInputsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterItem: {
    minWidth: 150,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.softNavy,
    marginBottom: 6,
  },
  monthPillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  monthPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  monthPillActive: {
    backgroundColor: COLORS.lightBlue,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  monthPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  monthPillTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.softNavy,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 14,
  },
  reportSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 14,
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  companyTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  reportDocumentTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.softNavy,
    marginTop: 2,
  },
  documentMeta: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  validStampClean: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  validStampText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  viewModeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  viewModeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleButtons: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  toggleBtnTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  cardListWrapper: {
    gap: 10,
    marginBottom: 20,
  },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  recordCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  recordCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recordDateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.softNavy,
  },
  recordEmpRow: {
    marginBottom: 8,
  },
  recordEmpName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  recordEmpDept: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  recordTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  timeBlock: {
    alignItems: 'center',
    flex: 1,
  },
  timeBlockLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  timeBlockVal: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tableScrollHint: {
    backgroundColor: '#F0F9FF',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  tableScrollHintText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  tableWrapper: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 20,
  },
  tHeadRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tHeadCell: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  tBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tCellText: {
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  signOffRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  signBox: {
    alignItems: 'center',
  },
  signLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  signName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.softNavy,
    textDecorationLine: 'underline',
  },
  signRole: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
