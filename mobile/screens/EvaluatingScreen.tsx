import { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { OutlinedText, DotSpinner } from "../components";
import type { EvaluatingScreenProps } from "../types/navigation";

const API_URL = "https://jeff1709-seefood.hf.space";

export function EvaluatingScreen({ navigation, route }: EvaluatingScreenProps) {
  const { photoUri } = route.params;

  useEffect(() => {
    const evaluateImage = async () => {
      try {
        const formData = new FormData();
        formData.append("image", {
          uri: photoUri,
          type: "image/jpeg",
          name: "photo.jpg",
        } as any);

        const minDelay = new Promise((resolve) => setTimeout(resolve, 3000));

        const apiCall = fetch(`${API_URL}/predict`, {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const [response] = await Promise.all([apiCall, minDelay]);
        const data = await response.json();

        if (response.ok) {
          navigation.replace("Result", { photoUri, result: data });
        } else {
          console.error("API error:", data.error);
          navigation.goBack();
        }
      } catch (error) {
        console.error("Network error:", error);
        navigation.goBack();
      }
    };

    evaluateImage();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        source={{ uri: photoUri }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <DotSpinner />
        <OutlinedText style={styles.evaluatingText} outlineWidth={2}>
          Evaluating...
        </OutlinedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  evaluatingText: {
    color: "#FFFFFF",
    fontSize: 46,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
