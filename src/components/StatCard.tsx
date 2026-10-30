import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  iconText: string;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  iconText,
  accentColor = COLORS.primary,
}) => {
  const [displayValue, setDisplayValue] = useState<string | number>(
    typeof value === 'number' ? 0 : value
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    // Fade and slide-up micro-interaction
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    // Number counter animation if value is numeric
    const numericTarget = typeof value === 'number' ? value : parseInt(String(value), 10);
    if (!isNaN(numericTarget) && String(numericTarget) === String(value).trim()) {
      let current = 0;
      const stepTime = Math.max(15, Math.floor(600 / Math.max(numericTarget, 1)));
      const timer = setInterval(() => {
        current += 1;
        if (current >= numericTarget) {
          setDisplayValue(numericTarget);
          clearInterval(timer);
        } else {
          setDisplayValue(current);
        }
      }, stepTime);
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: `${accentColor}18` }]}>
          <Text style={styles.icon}>{iconText}</Text>
        </View>
        <View style={styles.valueWrap}>
          <Text style={styles.value}>{displayValue}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: COLORS.softNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    minWidth: 140,
    flex: 1,
    margin: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  valueWrap: {
    flex: 1,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 6,
  },
});
