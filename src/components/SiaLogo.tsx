import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Rect, Text as SvgText, Defs, LinearGradient, Stop, Filter, FeDropShadow } from 'react-native-svg';

interface SiaLogoProps {
  size?: number;
  rounded?: number;
}

export const SiaLogo: React.FC<SiaLogoProps> = ({ size = 40, rounded }) => {
  const rx = rounded !== undefined ? rounded : Math.round(size * 0.28);
  const fontSize = Math.round(size * 0.44);
  const letterSpacing = Math.round(size * 0.02);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          {/* Dominant Light Blue Gradient */}
          <LinearGradient id="siaSkyGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#99DEFF" />
            <Stop offset="50%" stopColor="#7CCBFF" />
            <Stop offset="100%" stopColor="#38BDF8" />
          </LinearGradient>
          <LinearGradient id="siaBorderGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
          </LinearGradient>
        </Defs>

        {/* Squircle base with dominant light blue */}
        <Rect
          x="3"
          y="3"
          width="94"
          height="94"
          rx="26"
          fill="url(#siaSkyGrad)"
          stroke="url(#siaBorderGrad)"
          strokeWidth="3"
        />

        {/* Text: SIA only */}
        <SvgText
          x="50"
          y="63"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="40"
          fontWeight="900"
          fontFamily="System"
          letterSpacing="2"
        >
          SIA
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
});

