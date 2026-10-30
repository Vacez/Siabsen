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
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { LeaveRequest } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { RequestProgressBar } from '../components/RequestProgressBar';
import { ArrowLeft, CheckCircle2, XCircle, Paperclip } from 'lucide-react-native';

export const ApprovalScreen: React.FC = () => {
  const { leaveRequests, reviewLeaveRequest, navigateTo } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [decisionAction, setDecisionAction] = useState<'approved' | 'rejected'>('approved');
  const [decisionNote, setDecisionNote] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  const filteredRequests = leaveRequests.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const pendingCount = leaveRequests.filter((l) => l.status === 'pending').length;

  const handleOpenDecisionModal = (req: LeaveRequest, action: 'approved' | 'rejected') => {
    setSelectedRequest(req);
    setDecisionAction(action);
    setDecisionNote(
      action === 'approved'
        ? 'Disetujui. Selamat beristirahat dan koordinasikan tugas dengan tim.'
        : 'Mohon maaf pengajuan belum dapat disetujui karena jadwal operasional mendesak.'
    );
    setShowConfirmModal(true);
  };

  const handleConfirmDecision = () => {
    if (!selectedRequest) return;
    setIsSubmittingDecision(true);
    setTimeout(() => {
      reviewLeaveRequest(selectedRequest.id, decisionAction, decisionNote);
      setIsSubmittingDecision(false);
      setShowConfirmModal(false);
      setSelectedRequest(null);
    }, 350);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Persetujuan Pengajuan Karyawan</Text>
          <Text style={styles.pageSubtitle}>
            Tinjau dan ambil keputusan terhadap permohonan cuti, izin, atau sakit karyawan.
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

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {[
          { id: 'pending', label: 'Menunggu Persetujuan', badge: pendingCount },
          { id: 'approved', label: 'Disetujui' },
          { id: 'rejected', label: 'Ditolak' },
          { id: 'all', label: 'Semua Pengajuan' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabBtn, filterStatus === tab.id && styles.tabBtnActive]}
            onPress={() => setFilterStatus(tab.id)}
          >
            <Text
              style={[
                styles.tabBtnText,
                filterStatus === tab.id && styles.tabBtnTextActive,
              ]}
            >
              {tab.label}
            </Text>
            {tab.badge !== undefined && tab.badge > 0 ? (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{tab.badge}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>

      {/* List of Applications */}
      {filteredRequests.length === 0 ? (
        <View style={[styles.emptyCard, SHADOWS.card]}>
          <CheckCircle2 size={36} color={COLORS.success} style={{ marginBottom: 10 }} />
          <Text style={styles.emptyTitle}>
            Tidak ada pengajuan dengan status {filterStatus.toUpperCase()}
          </Text>
          <Text style={styles.emptySub}>
            Semua permohonan karyawan saat ini telah selesai diproses.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 14 }}>
          {filteredRequests.map((req) => (
            <View key={req.id} style={[styles.requestCard, SHADOWS.card]}>
              <View style={styles.cardTopRow}>
                {/* Employee info */}
                <View style={styles.employeeInfo}>
                  <Image
                    source={{
                      uri:
                        req.userAvatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                    }}
                    style={styles.avatar}
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.employeeName}>{req.userName}</Text>
                    <Text style={styles.employeeDept}>{req.department}</Text>
                    <Text style={styles.submittedAt}>
                      Diajukan: {req.createdAt} • ID: {req.id}
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                <Badge
                  label={
                    req.status === 'pending'
                      ? 'Menunggu Persetujuan'
                      : req.status === 'approved'
                      ? 'Disetujui'
                      : req.status === 'rejected'
                      ? 'Ditolak'
                      : 'Dibatalkan'
                  }
                  variant={
                    req.status === 'approved'
                      ? 'success'
                      : req.status === 'pending'
                      ? 'warning'
                      : req.status === 'rejected'
                      ? 'error'
                      : 'muted'
                  }
                />
              </View>

              {/* Details Content */}
              <View style={styles.detailsContent}>
                <View style={styles.periodBox}>
                  <Text style={styles.periodType}>{req.subType}</Text>
                  <Text style={styles.periodDates}>
                    📅 {req.startDate} s/d {req.endDate} ({req.daysCount} Hari Kerja)
                  </Text>
                </View>

                <View style={styles.reasonBox}>
                  <Text style={styles.reasonLabel}>Alasan / Keterangan Karyawan:</Text>
                  <Text style={styles.reasonText}>"{req.reason}"</Text>
                </View>

                {req.attachmentName ? (
                  <View style={styles.attachmentBox}>
                    <Paperclip size={15} color={COLORS.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.attachmentName}>{req.attachmentName}</Text>
                    <TouchableOpacity
                      style={styles.viewDocBtn}
                      onPress={() => alert(`Membuka lampiran: ${req.attachmentName}`)}
                    >
                      <Text style={styles.viewDocText}>Lihat Dokumen</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* If already reviewed */}
                {req.reviewedBy ? (
                  <View style={styles.reviewedNotice}>
                    <Text style={styles.reviewedTitle}>
                      Keputusan oleh {req.reviewedBy} pada {req.reviewedAt}:
                    </Text>
                    <Text style={styles.reviewedNote}>"{req.reviewNote}"</Text>
                  </View>
                ) : null}

                {/* Visual Progress Bar Timeline */}
                <RequestProgressBar
                  status={req.status}
                  createdAt={req.createdAt}
                  reviewedAt={req.reviewedAt}
                  reviewedBy={req.reviewedBy}
                />
              </View>

              {/* Action Buttons for Pending */}
              {req.status === 'pending' ? (
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleOpenDecisionModal(req, 'rejected')}
                    activeOpacity={0.8}
                  >
                    <XCircle size={14} color={COLORS.error} style={{ marginRight: 6 }} />
                    <Text style={styles.rejectBtnText}>Tolak Pengajuan</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleOpenDecisionModal(req, 'approved')}
                    activeOpacity={0.8}
                  >
                    <CheckCircle2 size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.approveBtnText}>Setujui Pengajuan</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {/* Modal Confirmation */}
      <Modal
        visible={showConfirmModal}
        title={decisionAction === 'approved' ? 'Setujui Pengajuan' : 'Tolak Pengajuan'}
        subtitle={`Pengajuan dari ${selectedRequest?.userName} (${selectedRequest?.subType})`}
        onClose={() => setShowConfirmModal(false)}
      >
        <View style={{ paddingTop: 6 }}>
          <View style={styles.confirmInfoBox}>
            <Text style={styles.confirmInfoText}>
              Periode: {selectedRequest?.startDate} s/d {selectedRequest?.endDate} (
              {selectedRequest?.daysCount} hari)
            </Text>
            <Text style={styles.confirmInfoReason}>"{selectedRequest?.reason}"</Text>
          </View>

          <Text style={styles.inputLabel}>Catatan / Alasan Keputusan Pimpinan</Text>
          <TextInput
            style={[styles.textInput, { height: 75, textAlignVertical: 'top' }]}
            placeholder="Tuliskan catatan persetujuan atau alasan penolakan..."
            placeholderTextColor="#94A3B8"
            value={decisionNote}
            onChangeText={setDecisionNote}
            multiline
          />

          <View style={styles.modalBtnsRow}>
            <TouchableOpacity
              style={styles.cancelModalBtn}
              onPress={() => setShowConfirmModal(false)}
            >
              <Text style={styles.cancelModalText}>Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.executeModalBtn,
                {
                  backgroundColor:
                    decisionAction === 'approved' ? COLORS.success : COLORS.error,
                },
                isSubmittingDecision && { opacity: 0.8 },
              ]}
              onPress={handleConfirmDecision}
              disabled={isSubmittingDecision}
            >
              {isSubmittingDecision ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={[styles.executeModalText, { marginLeft: 8 }]}>Menyimpan...</Text>
                </View>
              ) : (
                <Text style={styles.executeModalText}>
                  {decisionAction === 'approved' ? 'Simpan & Setujui' : 'Simpan & Tolak'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tabBtnActive: {
    backgroundColor: COLORS.lightBlue,
    borderColor: COLORS.primary,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabBtnTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  tabBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
    marginBottom: 14,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  employeeName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  employeeDept: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  submittedAt: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  detailsContent: {
    gap: 10,
  },
  periodBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  periodType: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  periodDates: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reasonBox: {
    paddingHorizontal: 2,
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  reasonText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  attachmentName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
    flex: 1,
  },
  viewDocBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.skyBlue,
  },
  viewDocText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  reviewedNotice: {
    backgroundColor: '#FAFBFD',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryDark,
  },
  reviewedTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  reviewedNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.error,
  },
  approveBtn: {
    flex: 1.5,
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  approveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  confirmInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  confirmInfoText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.softNavy,
  },
  confirmInfoReason: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
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
    padding: 12,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  modalBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelModalText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  executeModalBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  executeModalText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
