import { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";

export function DotSpinner() {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2700,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, []);

  const rotation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const dots = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const radius = 55;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const opacity = 0.3 + (i / 12) * 0.7;
    const isRed = i >= 8;

    return (
      <View
        key={i}
        style={[
          styles.dot,
          {
            transform: [{ translateX: x }, { translateY: y }],
            backgroundColor: isRed ? "#D32F2F" : "#FFFFFF",
            opacity: isRed ? 1 : opacity,
          },
        ]}
      />
    );
  });

  return (
    <Animated.View
      style={[styles.container, { transform: [{ rotate: rotation }] }]}
    >
      {dots}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  dot: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
