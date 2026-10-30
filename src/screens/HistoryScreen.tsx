import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import {
  Search,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  LayoutGrid,
  TableProperties,
} from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/Badge';

export const HistoryScreen: React.FC = () => {
  const { currentUser, attendance, navigateTo } = useApp();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(isMobile ? 'cards' : 'table');

  const myAttendance = attendance.filter((a) => a.userId === currentUser?.id);

  const filtered = myAttendance.filter((item) => {
    const matchSearch =
      item.date.includes(search) ||
      (item.notes && item.notes.toLowerCase().includes(search.toLowerCase())) ||
      item.workType.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'late'
        ? item.isLate
        : filterStatus === 'wfh'
        ? item.workType === 'WFH'
        : item.status === filterStatus;

    return matchSearch && matchStatus;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: isMobile ? 14 : 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, minWidth: 200 }}>
          <Text style={[styles.pageTitle, isMobile && { fontSize: 20 }]}>
            Riwayat Kehadiran Lengkap
          </Text>
          <Text style={styles.pageSubtitle}>
            Catatan historis absensi masuk, pulang, durasi jam kerja, dan status keterlambatan.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigateTo('employee_dashboard')}
          activeOpacity={0.7}
        >
          <ArrowLeft size={13} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={styles.backBtnText}>Kembali ke Dashboard</Text>
        </TouchableOpacity>
      </View>

      {/* Filter & Search Bar */}
      <View style={[styles.filterCard, SHADOWS.card]}>
        <View style={styles.searchWrap}>
          <Search size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari berdasarkan tanggal (YYYY-MM-DD), catatan, mode..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <View style={styles.filterPillsRow}>
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'present', label: 'Tepat Waktu' },
              { id: 'late', label: 'Terlambat' },
              { id: 'wfh', label: 'Remote / WFH' },
            ].map((pill) => (
              <TouchableOpacity
                key={pill.id}
                style={[
                  styles.filterPill,
                  filterStatus === pill.id && styles.filterPillActive,
                ]}
                onPress={() => setFilterStatus(pill.id)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    filterStatus === pill.id && styles.filterPillTextActive,
                  ]}
                >
                  {pill.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Attendance Table / List Card */}
      <View style={[styles.tableCard, SHADOWS.card]}>
        <View style={styles.tableHeader}>
          <View>
            <Text style={styles.tableTitle}>Daftar Presensi ({filtered.length} Catatan)</Text>
            <Text style={styles.tableSub}>Format Waktu: Waktu Indonesia Barat (WIB)</Text>
          </View>

          {/* View toggle */}
          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'cards' && styles.toggleBtnActive]}
              onPress={() => setViewMode('cards')}
            >
              <LayoutGrid
                size={13}
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
            >
              <TableProperties
                size={13}
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

        {filtered.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Calendar size={36} color={COLORS.textMuted} style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.softNavy }}>
              Tidak ada catatan kehadiran yang cocok
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
              Coba sesuaikan kata kunci pencarian atau filter status Anda.
            </Text>
          </View>
        ) : viewMode === 'cards' ? (
          /* Cards View Mode: 100% Screen width friendly */
          <View style={{ gap: 10 }}>
            {filtered.map((item) => (
              <View key={item.id} style={styles.historyCardItem}>
                <View style={styles.historyCardTop}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Calendar size={13} color={COLORS.primary} style={{ marginRight: 5 }} />
                    <Text style={styles.historyCardDate}>{item.date}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Badge
                      label={item.workType}
                      variant={item.workType === 'WFO' ? 'primary' : 'info'}
                      size="sm"
                    />
                    <Badge
                      label={item.isLate ? `Terlambat (${item.lateMinutes}m)` : 'Tepat Waktu'}
                      variant={item.isLate ? 'warning' : 'success'}
                      size="sm"
                    />
                  </View>
                </View>

                <View style={styles.historyTimesRow}>
                  <View style={styles.timeBlock}>
                    <Text style={styles.timeBlockLabel}>MASUK</Text>
                    <Text style={styles.timeBlockVal}>{item.checkInTime}</Text>
                  </View>

                  <View style={styles.timeBlock}>
                    <Text style={styles.timeBlockLabel}>PULANG</Text>
                    <Text style={styles.timeBlockVal}>{item.checkOutTime || '--:--:--'}</Text>
                  </View>

                  <View style={styles.timeBlock}>
                    <Text style={styles.timeBlockLabel}>DURASI</Text>
                    <Text style={[styles.timeBlockVal, { color: COLORS.primaryDark }]}>
                      {item.workDurationHours !== undefined
                        ? `${item.workDurationHours} Jam`
                        : item.checkOutTime
                        ? 'Tercatat'
                        : 'Sedang Bekerja'}
                    </Text>
                  </View>
                </View>

                {item.notes ? (
                  <Text style={styles.noteBox} numberOfLines={2}>
                    "{item.notes}"
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          /* Table Rows */
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={[styles.tableWrapper, { minWidth: 620 }]}>
              <View style={styles.gridHeaderRow}>
                <Text style={[styles.gridHeaderCell, { flex: 1.2 }]}>TANGGAL</Text>
                <Text style={[styles.gridHeaderCell, { flex: 1 }]}>CHECK-IN</Text>
                <Text style={[styles.gridHeaderCell, { flex: 1 }]}>CHECK-OUT</Text>
                <Text style={[styles.gridHeaderCell, { flex: 1.2 }]}>DURASI</Text>
                <Text style={[styles.gridHeaderCell, { flex: 1 }]}>MODE</Text>
                <Text style={[styles.gridHeaderCell, { flex: 1.3 }]}>STATUS</Text>
              </View>

              {filtered.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.gridDataRow,
                    index % 2 === 1 && { backgroundColor: '#F8FAFC' },
                  ]}
                >
                  <View style={{ flex: 1.2 }}>
                    <Text style={styles.dateCellText}>{item.date}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.timeCellText}>{item.checkInTime}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.timeCellText}>
                      {item.checkOutTime || '--:--:--'}
                    </Text>
                  </View>

                  <View style={{ flex: 1.2 }}>
                    <Text style={styles.durationCellText}>
                      {item.workDurationHours !== undefined
                        ? `${item.workDurationHours}j ${item.workDurationMinutes}m`
                        : item.checkOutTime
                        ? 'Tercatat'
                        : 'Berjalan'}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Badge
                      label={item.workType}
                      variant={item.workType === 'WFO' ? 'primary' : 'info'}
                      size="sm"
                    />
                  </View>

                  <View style={{ flex: 1.3 }}>
                    <Badge
                      label={item.isLate ? 'Terlambat' : 'Tepat Waktu'}
                      variant={item.isLate ? 'warning' : 'success'}
                      size="sm"
                    />
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
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
    paddingVertical: 9,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterPillActive: {
    backgroundColor: COLORS.lightBlue,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  tableSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
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
  historyCardItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  historyCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyCardDate: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  historyTimesRow: {
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
  noteBox: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
  },
  tableWrapper: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  gridHeaderCell: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  gridDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dateCellText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.softNavy,
  },
  timeCellText: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  durationCellText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
});
