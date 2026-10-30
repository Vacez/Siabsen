import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/Badge';
import { RequestProgressBar } from '../components/RequestProgressBar';
import { Palmtree, FileText, HeartPulse, Paperclip, ArrowLeft } from 'lucide-react-native';

export const LeaveRequestScreen: React.FC = () => {
  const {
    currentUser,
    leaveRequests,
    submitLeaveRequest,
    cancelLeaveRequest,
    showToast,
    navigateTo,
  } = useApp();

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [activeTab, setActiveTab] = useState<'cuti' | 'izin' | 'sakit'>('cuti');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [subType, setSubType] = useState('Cuti Tahunan');
  const [startDate, setStartDate] = useState('2026-11-10');
  const [endDate, setEndDate] = useState('2026-11-12');
  const [daysCount, setDaysCount] = useState('3');
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  // Tab switcher effect
  const handleTabChange = (tab: 'cuti' | 'izin' | 'sakit') => {
    setActiveTab(tab);
    if (tab === 'cuti') {
      setSubType('Cuti Tahunan');
      setDaysCount('3');
    } else if (tab === 'izin') {
      setSubType('Izin Keperluan Mendesak');
      setDaysCount('1');
    } else {
      setSubType('Sakit Rawat Jalan');
      setDaysCount('2');
      setAttachmentName('Surat_Keterangan_Dokter.pdf');
    }
  };

  const handleSubmit = () => {
    if (!startDate || !endDate || !reason.trim()) {
      showToast('Harap isi tanggal dan alasan pengajuan.', 'warning');
      return;
    }

    const count = parseInt(daysCount, 10) || 1;

    if (activeTab === 'cuti' && currentUser && currentUser.remainingLeaveDays < count) {
      showToast(
        `Kuota cuti Anda tidak mencukupi (Tersedia: ${currentUser.remainingLeaveDays} hari, Diajukan: ${count} hari).`,
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = submitLeaveRequest({
        type: activeTab,
        subType,
        startDate,
        endDate,
        daysCount: count,
        reason,
        attachmentName: attachmentName || undefined,
      });

      setIsSubmitting(false);
      if (res.success) {
        setReason('');
        setAttachmentName('');
      }
    }, 350);
  };

  // Filter my requests
  const myLeaves = leaveRequests.filter((l) => l.userId === currentUser?.id);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: isMobile ? 14 : 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Page Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, minWidth: 200 }}>
          <Text style={[styles.pageTitle, isMobile && { fontSize: 19 }]}>
            Formulir Pengajuan Cuti, Izin & Sakit
          </Text>
          <Text style={styles.pageSubtitle}>
            Ajukan permohonan ketidakhadiran kerja dengan alur persetujuan digital otomatis.
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

      <View style={[styles.contentGrid, isMobile && { flexDirection: 'column' }]}>
        {/* Left Side: Creation Form */}
        <View style={[styles.formCol, isMobile && { width: '100%', minWidth: '100%' }]}>
          <View style={[styles.card, SHADOWS.card]}>
            {/* Type Tabs */}
            <View style={styles.typeTabs}>
              <TouchableOpacity
                style={[styles.typeTab, activeTab === 'cuti' && styles.typeTabActive]}
                onPress={() => handleTabChange('cuti')}
                activeOpacity={0.7}
              >
                <Palmtree
                  size={15}
                  color={activeTab === 'cuti' ? COLORS.primaryDark : COLORS.textSecondary}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    activeTab === 'cuti' && styles.typeTabTextActive,
                  ]}
                >
                  Cuti Kerja
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeTab, activeTab === 'izin' && styles.typeTabActive]}
                onPress={() => handleTabChange('izin')}
                activeOpacity={0.7}
              >
                <FileText
                  size={15}
                  color={activeTab === 'izin' ? COLORS.primaryDark : COLORS.textSecondary}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    activeTab === 'izin' && styles.typeTabTextActive,
                  ]}
                >
                  Izin Khusus
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeTab, activeTab === 'sakit' && styles.typeTabActive]}
                onPress={() => handleTabChange('sakit')}
                activeOpacity={0.7}
              >
                <HeartPulse
                  size={15}
                  color={activeTab === 'sakit' ? COLORS.primaryDark : COLORS.textSecondary}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    activeTab === 'sakit' && styles.typeTabTextActive,
                  ]}
                >
                  Sakit
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quota Info for Cuti */}
            {activeTab === 'cuti' ? (
              <View style={styles.quotaNotice}>
                <Text style={styles.quotaText}>
                  Sisa Kuota Cuti Tahunan Anda:{' '}
                  <Text style={{ fontWeight: '800', color: COLORS.primaryDark }}>
                    {currentUser?.remainingLeaveDays || 0} Hari Kerja
                  </Text>
                </Text>
              </View>
            ) : null}

            {/* Sub-type Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Jenis / Kategori Pengajuan</Text>
              <View style={styles.subTypePillRow}>
                {activeTab === 'cuti' && (
                  <>
                    {['Cuti Tahunan', 'Cuti Bersama', 'Cuti Menikah', 'Cuti Melahirkan'].map(
                      (item) => (
                        <TouchableOpacity
                          key={item}
                          style={[
                            styles.subTypePill,
                            subType === item && styles.subTypePillActive,
                          ]}
                          onPress={() => setSubType(item)}
                        >
                          <Text
                            style={[
                              styles.subTypePillText,
                              subType === item && styles.subTypePillTextActive,
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </>
                )}

                {activeTab === 'izin' && (
                  <>
                    {[
                      'Izin Keperluan Mendesak',
                      'Izin Setengah Hari',
                      'Izin Urusan Kependudukan',
                      'Izin Duka Cita',
                    ].map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.subTypePill,
                          subType === item && styles.subTypePillActive,
                        ]}
                        onPress={() => setSubType(item)}
                      >
                        <Text
                          style={[
                            styles.subTypePillText,
                            subType === item && styles.subTypePillTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {activeTab === 'sakit' && (
                  <>
                    {['Sakit Rawat Jalan', 'Sakit Rawat Inap (Opname)', 'Isolasi Medis'].map(
                      (item) => (
                        <TouchableOpacity
                          key={item}
                          style={[
                            styles.subTypePill,
                            subType === item && styles.subTypePillActive,
                          ]}
                          onPress={() => setSubType(item)}
                        >
                          <Text
                            style={[
                              styles.subTypePillText,
                              subType === item && styles.subTypePillTextActive,
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </>
                )}
              </View>
            </View>

            {/* Date Inputs */}
            <View style={styles.dateRow}>
              <View style={{ flex: 1, minWidth: 95 }}>
                <Text style={styles.inputLabel}>Tanggal Mulai</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>
              <View style={{ flex: 1, minWidth: 95 }}>
                <Text style={styles.inputLabel}>Tanggal Selesai</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
              <View style={{ width: isMobile ? 70 : 85 }}>
                <Text style={styles.inputLabel}>Total Hari</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  value={daysCount}
                  onChangeText={setDaysCount}
                />
              </View>
            </View>

            {/* Reason */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Alasan / Keterangan Lengkap</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Jelaskan alasan pengajuan Anda secara terperinci..."
                placeholderTextColor="#94A3B8"
                value={reason}
                onChangeText={setReason}
                multiline
              />
            </View>

            {/* Attachment */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Lampiran / Dokumen Pendukung (Opsional / Surat Dokter)
              </Text>
              <View style={styles.attachmentRow}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="Nama file lampiran (cth: Surat_Dokter.pdf)"
                  placeholderTextColor="#94A3B8"
                  value={attachmentName}
                  onChangeText={setAttachmentName}
                />
                <TouchableOpacity
                  style={styles.attachBtn}
                  onPress={() => {
                    setAttachmentName(`Lampiran_${activeTab.toUpperCase()}_${Date.now()}.pdf`);
                    showToast('File contoh berhasil dilampirkan.', 'info');
                  }}
                >
                  <Text style={styles.attachBtnText}>Pilih File</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && { opacity: 0.8 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={[styles.submitBtnText, { marginLeft: 8 }]}>
                    Mengirim Pengajuan...
                  </Text>
                </View>
              ) : (
                <Text style={styles.submitBtnText}>Kirim Pengajuan ke Pimpinan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Side: My Leave History & Status */}
        <View style={[styles.historyCol, isMobile && { width: '100%', minWidth: '100%' }]}>
          <View style={[styles.card, SHADOWS.card]}>
            <Text style={styles.cardSectionTitle}>Riwayat Status Pengajuan Saya</Text>
            <Text style={styles.cardSubtitle}>
              Pantau status persetujuan dari Bos / Manajemen secara langsung.
            </Text>

            {myLeaves.length === 0 ? (
              <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>📭</Text>
                <Text style={{ color: COLORS.textMuted }}>Belum ada pengajuan dibuat.</Text>
              </View>
            ) : (
              myLeaves.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyItemTop}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.historyItemType}>{item.subType}</Text>
                      <Text style={styles.historyItemDate}>
                        {item.startDate} s/d {item.endDate} ({item.daysCount} hari)
                      </Text>
                    </View>
                    <Badge
                      label={
                        item.status === 'pending'
                          ? 'Menunggu'
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
                      size="sm"
                    />
                  </View>

                  <Text style={styles.historyReason}>"{item.reason}"</Text>

                  {item.attachmentName ? (
                    <Text style={styles.attachmentTag}>📎 {item.attachmentName}</Text>
                  ) : null}

                  {item.reviewNote ? (
                    <View style={styles.decisionNoteBox}>
                      <Text style={styles.decisionNoteTitle}>
                        Catatan Pimpinan ({item.reviewedBy}):
                      </Text>
                      <Text style={styles.decisionNoteBody}>{item.reviewNote}</Text>
                    </View>
                  ) : null}

                  {/* Visual Progress Bar Timeline */}
                  <RequestProgressBar
                    status={item.status}
                    createdAt={item.createdAt}
                    reviewedAt={item.reviewedAt}
                    reviewedBy={item.reviewedBy}
                  />

                  {item.status === 'pending' ? (
                    <TouchableOpacity
                      style={styles.cancelActionBtn}
                      onPress={() => cancelLeaveRequest(item.id)}
                    >
                      <Text style={styles.cancelActionText}>Batalkan Pengajuan</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))
            )}
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
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  formCol: {
    flex: 3,
    minWidth: 320,
  },
  historyCol: {
    flex: 2,
    minWidth: 280,
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
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  typeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  typeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  typeTabTextActive: {
    color: COLORS.primaryDark,
  },
  quotaNotice: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CFE6FB',
  },
  quotaText: {
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.softNavy,
    marginBottom: 6,
  },
  subTypePillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subTypePill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  subTypePillActive: {
    backgroundColor: COLORS.lightBlue,
    borderColor: COLORS.primary,
  },
  subTypePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  subTypePillTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  attachmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  attachBtn: {
    backgroundColor: COLORS.lightBlue,
    borderWidth: 1,
    borderColor: COLORS.skyBlue,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  historyItem: {
    backgroundColor: '#FAFBFD',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  historyItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  historyItemType: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  historyItemDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  historyReason: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  attachmentTag: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 6,
  },
  decisionNoteBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  decisionNoteTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  decisionNoteBody: {
    fontSize: 11,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  cancelActionBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cancelActionText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.error,
  },
});
