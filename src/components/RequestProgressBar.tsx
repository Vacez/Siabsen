import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { LeaveStatus } from '../types';

interface RequestProgressBarProps {
  status: LeaveStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export const RequestProgressBar: React.FC<RequestProgressBarProps> = ({
  status,
  createdAt,
  reviewedAt,
  reviewedBy,
}) => {
  const isPending = status === 'pending';
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isCancelled = status === 'cancelled';

  // Step 1: Always done
  // Step 2: In progress if pending, done if approved/rejected/cancelled
  // Step 3: Done if approved/rejected/cancelled

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Timeline & Alur Persetujuan</Text>

      {/* Progress Track */}
      <View style={styles.trackContainer}>
        {/* Step 1 */}
        <View style={styles.stepCol}>
          <View style={[styles.stepDot, styles.stepDotDone]}>
            <Text style={styles.stepDotIcon}>✓</Text>
          </View>
          <Text style={styles.stepTitle}>Diajukan</Text>
          <Text style={styles.stepTime}>{createdAt.split(' ')[0]}</Text>
        </View>

        {/* Connector 1 */}
        <View
          style={[
            styles.lineConnector,
            !isCancelled && { backgroundColor: COLORS.primary },
          ]}
        />

        {/* Step 2 */}
        <View style={styles.stepCol}>
          <View
            style={[
              styles.stepDot,
              isPending
                ? styles.stepDotActive
                : isCancelled
                ? styles.stepDotMuted
                : styles.stepDotDone,
            ]}
          >
            <Text style={styles.stepDotIcon}>
              {isPending ? '⏳' : isCancelled ? '—' : '✓'}
            </Text>
          </View>
          <Text style={styles.stepTitle}>Peninjauan</Text>
          <Text style={styles.stepTime}>
            {isPending ? 'Proses HR' : reviewedBy ? `Oleh ${reviewedBy.split(' ')[0]}` : 'Selesai'}
          </Text>
        </View>

        {/* Connector 2 */}
        <View
          style={[
            styles.lineConnector,
            (isApproved || isRejected) && {
              backgroundColor: isApproved ? COLORS.success : COLORS.error,
            },
          ]}
        />

        {/* Step 3 */}
        <View style={styles.stepCol}>
          <View
            style={[
              styles.stepDot,
              isPending
                ? styles.stepDotWaiting
                : isApproved
                ? styles.stepDotApproved
                : isRejected
                ? styles.stepDotRejected
                : styles.stepDotMuted,
            ]}
          >
            <Text style={styles.stepDotIcon}>
              {isPending ? '⚪' : isApproved ? '✓' : isRejected ? '✕' : '—'}
            </Text>
          </View>
          <Text
            style={[
              styles.stepTitle,
              isApproved && { color: COLORS.success, fontWeight: '800' },
              isRejected && { color: COLORS.error, fontWeight: '800' },
            ]}
          >
            {isPending
              ? 'Keputusan'
              : isApproved
              ? 'Disetujui'
              : isRejected
              ? 'Ditolak'
              : 'Dibatalkan'}
          </Text>
          <Text style={styles.stepTime}>
            {reviewedAt ? reviewedAt.split(' ')[0] : isPending ? 'Menunggu' : '-'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  trackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  stepCol: {
    alignItems: 'center',
    width: 80,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  stepDotDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepDotActive: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  stepDotApproved: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  stepDotRejected: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  stepDotMuted: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1',
  },
  stepDotWaiting: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  stepDotIcon: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.softNavy,
    textAlign: 'center',
  },
  stepTime: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  lineConnector: {
    flex: 1,
    height: 3,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
    marginBottom: 16,
    borderRadius: 2,
  },
});

