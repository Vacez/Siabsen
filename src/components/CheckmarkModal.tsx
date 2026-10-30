import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS, SHADOWS } from '../constants/theme';

interface CheckmarkModalProps {
  visible: boolean;
  title?: string;
  time?: string;
  statusText?: string;
  isLate?: boolean;
  workType?: 'WFO' | 'WFH';
  onClose: () => void;
}

export const CheckmarkModal: React.FC<CheckmarkModalProps> = ({
  visible,
  title = 'Presensi Berhasil Dicatat! ☁️',
  time,
  statusText = 'Tepat Waktu',
  isLate = false,
  workType = 'WFO',
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      checkAnim.setValue(0);

      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(checkAnim, {
          toValue: 1,
          duration: 400,
          delay: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <RNModal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.modalCard,
            SHADOWS.modal,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Top Decorative Cloud Icon */}
          <View style={styles.cloudBadge}>
            <Text style={{ fontSize: 24 }}>☁️</Text>
          </View>

          {/* Animated Success Checkmark Ring */}
          <View style={styles.circleRing}>
            <Svg width="80" height="80" viewBox="0 0 80 80">
              <Circle
                cx="40"
                cy="40"
                r="36"
                fill={COLORS.lightBlue}
                stroke={isLate ? COLORS.warning : COLORS.success}
                strokeWidth="4"
              />
              <Path
                d="M24 40 L34 50 L56 28"
                fill="none"
                stroke={isLate ? COLORS.warning : COLORS.success}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          {/* Heading and Tagline */}
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.taglineText}>"Hadir Tepat, Kerja Hebat."</Text>

          {/* Detail Info Card */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Waktu Absensi:</Text>
              <Text style={styles.infoValue}>{time || 'Real-time WIB'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status Kehadiran:</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: isLate ? COLORS.warning : COLORS.success, fontWeight: '800' },
                ]}
              >
                {statusText}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mode Kerja:</Text>
              <Text style={styles.infoValue}>{workType === 'WFO' ? 'Office (WFO)' : 'Remote (WFH)'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lokasi GPS:</Text>
              <Text style={[styles.infoValue, { color: COLORS.primary }]}>Terverifikasi Valid 📍</Text>
            </View>
          </View>

          {/* Action button */}
          <TouchableOpacity style={styles.btnAction} onPress={onClose}>
            <Text style={styles.btnActionText}>Lanjutkan ke Dashboard</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 28,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cloudBadge: {
    position: 'absolute',
    top: -18,
    backgroundColor: COLORS.lightBlue,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.skyBlue,
  },
  circleRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.softNavy,
    textAlign: 'center',
    marginBottom: 4,
  },
  taglineText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 20,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.softNavy,
    fontWeight: '700',
  },
  btnAction: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  btnActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

