import { View, Image, TouchableOpacity, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { OutlinedText } from "../components";
import type { ResultScreenProps } from "../types/navigation";

export function ResultScreen({ navigation, route }: ResultScreenProps) {
  const { photoUri, result } = route.params;

  const handleTap = () => {
    navigation.popTo("Prompt");
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={handleTap}
    >
      <StatusBar style="light" />
      <Image
        source={{ uri: photoUri }}
        style={styles.resultImage}
        resizeMode="cover"
      />

      {result.is_hotdog ? (
        <View style={styles.hotdogOverlay}>
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <View style={styles.hotdogBanner}>
            <OutlinedText style={styles.resultText} outlineWidth={2}>
              Hotdog
            </OutlinedText>
            <View style={styles.borderRow}>
              <View style={styles.borderLeft} />
              <View style={styles.borderSpacer} />
              <View style={styles.borderRight} />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.notHotdogOverlay}>
          <View style={styles.xCircle}>
            <Text style={styles.xMark}>✕</Text>
          </View>
          <View style={styles.notHotdogBanner}>
            <View style={styles.borderRowTop}>
              <View style={styles.borderLeft} />
              <View style={styles.borderSpacer} />
              <View style={styles.borderRight} />
            </View>
            <OutlinedText style={styles.resultText} outlineWidth={2}>
              Not hotdog
            </OutlinedText>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  resultImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  hotdogOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    flexDirection: "column-reverse",
  },
  checkmarkCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#4CD964",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    marginTop: -45,
    zIndex: 0,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 75,
    fontWeight: "900",
    marginBottom: -25,
  },
  hotdogBanner: {
    backgroundColor: "#4CD964",
    width: "100%",
    paddingTop: 55,
    paddingBottom: 20,
    alignItems: "center",
    zIndex: 1,
  },
  notHotdogOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  xCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#C62828",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    marginBottom: -45,
    zIndex: 0,
  },
  xMark: {
    color: "#FFFFFF",
    fontSize: 75,
    fontWeight: "900",
    marginTop: -25,
  },
  notHotdogBanner: {
    backgroundColor: "#C62828",
    width: "100%",
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
    zIndex: 1,
  },
  resultText: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 1,
  },
  borderRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    height: 3,
  },
  borderRowTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    height: 3,
  },
  borderLeft: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  borderSpacer: {
    width: 118,
  },
  borderRight: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
