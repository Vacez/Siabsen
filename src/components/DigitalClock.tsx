import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export const DigitalClock: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigits = (n: number) => String(n).padStart(2, '0');
  const hours = formatDigits(time.getHours());
  const minutes = formatDigits(time.getMinutes());
  const seconds = formatDigits(time.getSeconds());

  // Indonesian date formatter
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[time.getDay()];
  const dateNum = time.getDate();
  const monthName = months[time.getMonth()];
  const year = time.getFullYear();
  const dateFormatted = `${dayName}, ${dateNum} ${monthName} ${year}`;

  return (
    <View style={styles.container}>
      <View style={styles.badgeRow}>
        <View style={styles.pulseDot} />
        <Text style={styles.zoneText}>WAKTU INDONESIA BARAT (WIB)</Text>
      </View>
      <View style={styles.clockRow}>
        <View style={styles.digitBox}>
          <Text style={styles.digitText}>{hours}</Text>
          <Text style={styles.labelSub}>JAM</Text>
        </View>
        <Text style={styles.colonText}>:</Text>
        <View style={styles.digitBox}>
          <Text style={styles.digitText}>{minutes}</Text>
          <Text style={styles.labelSub}>MENIT</Text>
        </View>
        <Text style={styles.colonText}>:</Text>
        <View style={styles.digitBox}>
          <Text style={[styles.digitText, { color: COLORS.primary }]}>{seconds}</Text>
          <Text style={styles.labelSub}>DETIK</Text>
        </View>
      </View>
      <Text style={styles.dateText}>{dateFormatted}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  zoneText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
    letterSpacing: 0.8,
  },
  clockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  digitBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 54,
  },
  digitText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.softNavy,
    fontVariant: ['tabular-nums'],
  },
  colonText: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.skyBlue,
    marginHorizontal: 4,
  },
  labelSub: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 1,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
