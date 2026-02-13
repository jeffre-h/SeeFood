import { useState, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { OutlinedText } from "../components";
import type { PromptScreenProps } from "../types/navigation";

const { height } = Dimensions.get("window");
const imageHeight = (height - 140) / 3;

const foodImages = {
  burgers: require("../assets/images/burgers.jpg"),
  salmon: require("../assets/images/salmon.jpg"),
  pasta: require("../assets/images/pasta.jpeg"),
};

export function PromptScreen({ navigation }: PromptScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [lastGalleryPhoto, setLastGalleryPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchFirstPhoto = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        const { assets } = await MediaLibrary.getAssetsAsync({
          first: 1,
          sortBy: [[MediaLibrary.SortBy.creationTime, false]],
          mediaType: "photo",
        });
        if (assets.length > 0) {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(assets[0]);
          setLastGalleryPhoto(assetInfo.localUri || assets[0].uri);
        }
      }
    };
    fetchFirstPhoto();
  }, []);

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        return;
      }
    }
    navigation.navigate("Camera", { lastGalleryPhoto });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <OutlinedText style={styles.headerText} outlineWidth={2}>
          SEEFOOD
        </OutlinedText>
      </View>
      <View style={styles.blackBorder} />

      <View style={styles.content}>
        <View style={styles.imageWrapper}>
          <Image source={foodImages.burgers} style={styles.foodImage} />
          <View style={styles.taglineBanner}>
            <Text style={styles.taglineText}>"The Shazam for Food"</Text>
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{"←"}</Text>
          </TouchableOpacity>
        </View>

        <Image source={foodImages.salmon} style={styles.foodImage} />

        <View style={styles.imageWrapper}>
          <Image source={foodImages.pasta} style={styles.foodImage} />
          <View style={styles.touchPrompt}>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={handleOpenCamera}
            >
              <View style={styles.recordButtonInner} />
            </TouchableOpacity>
            <OutlinedText style={styles.touchPromptText} outlineWidth={1.5}>
              Touch to SEEFOOD
            </OutlinedText>
          </View>
        </View>
      </View>
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
  backButton: {
    position: "absolute",
    top: 54,
    right: 12,
    backgroundColor: "transparent",
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  touchPrompt: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 26,
    alignItems: "center",
  },
  touchPromptText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 1.4,
    transform: [{ scaleX: 1.16 }],
    marginTop: 10,
  },
  recordButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#B71C1C",
    borderWidth: 3,
    borderColor: "#5C0A0A",
    alignItems: "center",
    justifyContent: "center",
  },
  recordButtonInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E53935",
  },
});
