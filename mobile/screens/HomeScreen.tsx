import {
  View,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { OutlinedText } from "../components";
import type { HomeScreenProps } from "../types/navigation";

const { height } = Dimensions.get("window");
const imageHeight = (height - 140) / 3;

const foodImages = {
  burgers: require("../assets/images/burgers.jpg"),
  salmon: require("../assets/images/salmon.jpg"),
  pasta: require("../assets/images/pasta.jpeg"),
};

export function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("Prompt")}
      >
        <OutlinedText style={styles.headerText} outlineWidth={2}>
          SEEFOOD
        </OutlinedText>
      </TouchableOpacity>
      <View style={styles.blackBorder} />

      <TouchableOpacity
        style={styles.content}
        activeOpacity={1}
        onPress={() => navigation.navigate("Prompt")}
      >
        <View style={styles.imageWrapper}>
          <Image source={foodImages.burgers} style={styles.foodImage} />
          <View style={styles.taglineBanner}>
            <Text style={styles.taglineText}>"The Shazam for Food"</Text>
          </View>
          <View style={styles.getStartedOverlay}>
            <OutlinedText style={styles.getStartedText} outlineWidth={1.5}>
              Let's Get Started
            </OutlinedText>
          </View>
        </View>
        <Image source={foodImages.salmon} style={styles.foodImage} />
        <Image source={foodImages.pasta} style={styles.foodImage} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    backgroundColor: "#D32F2F",
    paddingTop: 55,
    paddingBottom: 18,
    alignItems: "center",
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 54,
    fontWeight: "900",
    letterSpacing: 2,
    transform: [{ scaleX: 1.1 }],
  },
  blackBorder: {
    height: 4,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    backgroundColor: "#000",
  },
  imageWrapper: {
    position: "relative",
    height: imageHeight,
  },
  foodImage: {
    width: "100%",
    height: imageHeight,
    resizeMode: "cover",
  },
  taglineBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    alignItems: "center",
  },
  taglineText: {
    color: "#D32F2F",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 2,
    transform: [{ scaleX: 1.15 }],
  },
  getStartedOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 15,
    alignItems: "center",
  },
  getStartedText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "600",
    letterSpacing: 1,
    transform: [{ scaleX: 1.1 }],
  },
});
