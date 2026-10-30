import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'muted';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', size = 'md' }) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: '#E8FBF2', text: '#15803D', border: '#B4F2D6' };
      case 'warning':
        return { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' };
      case 'error':
        return { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' };
      case 'info':
        return { bg: COLORS.lightBlue, text: COLORS.primaryDark, border: COLORS.skyBlue };
      case 'muted':
        return { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' };
      case 'primary':
      default:
        return { bg: '#EFF6FF', text: COLORS.primary, border: '#BFDBFE' };
    }
  };

  const c = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: c.bg,
          borderColor: c.border,
          paddingVertical: size === 'sm' ? 2 : 4,
          paddingHorizontal: size === 'sm' ? 8 : 10,
        },
      ]}
    >
      <Text style={[styles.badgeText, { color: c.text, fontSize: size === 'sm' ? 11 : 12 }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontWeight: '700',
  },
});
