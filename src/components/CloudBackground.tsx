import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../constants/theme';

export const CloudBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop1 = Animated.loop(
      Animated.timing(anim1, {
        toValue: 1,
        duration: 35000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const loop2 = Animated.loop(
      Animated.timing(anim2, {
        toValue: 1,
        duration: 48000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const loop3 = Animated.loop(
      Animated.timing(anim3, {
        toValue: 1,
        duration: 40000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    loop1.start();
    loop2.start();
    loop3.start();

    return () => {
      loop1.stop();
      loop2.stop();
      loop3.stop();
    };
  }, []);

  const transX1 = anim1.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, Dimensions.get('window').width + 100],
  });

  const transX2 = anim2.interpolate({
    inputRange: [0, 1],
    outputRange: [Dimensions.get('window').width + 100, -200],
  });

  const transX3 = anim3.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, Dimensions.get('window').width + 150],
  });

  return (
    <View style={styles.container}>
      {/* Background Gradient Shapes */}
      <View style={styles.skyGlowTop} />
      <View style={styles.skyGlowCenter} />

      {/* Floating Cloud 1 */}
      <Animated.View style={[styles.cloudLayer, { top: 40, transform: [{ translateX: transX1 }] }]}>
        <Svg width="160" height="90" viewBox="0 0 100 60" fill="none">
          <Path
            d="M20 45 A15 15 0 0 1 45 35 A22 22 0 0 1 80 40 A15 15 0 0 1 85 52 L15 52 Z"
            fill="rgba(255, 255, 255, 0.45)"
          />
        </Svg>
      </Animated.View>

      {/* Floating Cloud 2 */}
      <Animated.View style={[styles.cloudLayer, { top: 180, transform: [{ translateX: transX2 }] }]}>
        <Svg width="220" height="110" viewBox="0 0 100 60" fill="none">
          <Path
            d="M15 48 A18 18 0 0 1 40 32 A25 25 0 0 1 82 38 A16 16 0 0 1 90 52 L10 52 Z"
            fill="rgba(255, 255, 255, 0.35)"
          />
        </Svg>
      </Animated.View>

      {/* Floating Cloud 3 */}
      <Animated.View style={[styles.cloudLayer, { top: 380, transform: [{ translateX: transX3 }] }]}>
        <Svg width="190" height="100" viewBox="0 0 100 60" fill="none">
          <Path
            d="M25 45 A14 14 0 0 1 50 34 A20 20 0 0 1 80 42 A14 14 0 0 1 85 52 L15 52 Z"
            fill="rgba(234, 246, 255, 0.55)"
          />
        </Svg>
      </Animated.View>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    position: 'relative',
    overflow: 'hidden',
  },
  skyGlowTop: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(124, 203, 255, 0.18)',
  },
  skyGlowCenter: {
    position: 'absolute',
    top: 250,
    left: -150,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: 'rgba(234, 246, 255, 0.7)',
  },
  cloudLayer: {
    position: 'absolute',
    zIndex: 0,
    pointerEvents: 'none',
  },
});
