import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { CameraView } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import type { CameraScreenProps } from "../types/navigation";

export function CameraScreen({ navigation, route }: CameraScreenProps) {
  const cameraRef = useRef<CameraView>(null);
  const { lastGalleryPhoto } = route.params;
  const [zoom, setZoom] = useState(0);
  const lastDistance = useRef<number | null>(null);

  const getDistance = (touches: any[]) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: any) => {
    if (e.nativeEvent.touches.length === 2) {
      lastDistance.current = getDistance(e.nativeEvent.touches);
    }
  };

  const handleTouchMove = (e: any) => {
    if (e.nativeEvent.touches.length === 2 && lastDistance.current !== null) {
      const currentDistance = getDistance(e.nativeEvent.touches);
      const delta = (currentDistance - lastDistance.current) / 400;
      setZoom((z) => Math.min(1, Math.max(0, z + delta)));
      lastDistance.current = currentDistance;
    }
  };

  const handleTouchEnd = () => {
    lastDistance.current = null;
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (!photo?.uri) return;
      navigation.replace("Evaluating", { photoUri: photo.uri });
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]?.uri) return;
    navigation.replace("Evaluating", { photoUri: result.assets[0].uri });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        zoom={zoom}
      />
      <View
        style={styles.overlay}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <View style={styles.topSpacer}>
          {zoom > 0 && (
            <View style={styles.zoomIndicator}>
              <Text style={styles.zoomText}>
                {(1 + zoom * 9).toFixed(1)}x
              </Text>
            </View>
          )}
        </View>
        <View style={styles.captureContainer}>
          <TouchableOpacity
            style={styles.sideButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>{"←"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton} onPress={handlePickImage}>
            {lastGalleryPhoto ? (
              <Image
                source={{ uri: lastGalleryPhoto }}
                style={styles.galleryPreview}
              />
            ) : (
              <View style={styles.galleryIcon}>
                <View style={styles.galleryIconRow}>
                  <View style={styles.galleryIconSquare} />
                  <View style={styles.galleryIconSquare} />
                </View>
                <View style={styles.galleryIconRow}>
                  <View style={styles.galleryIconSquare} />
                  <View style={styles.galleryIconSquare} />
                </View>
              </View>
            )}
          </TouchableOpacity>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    justifyContent: "space-between",
  },
  topSpacer: {
    alignItems: "center",
    paddingTop: 60,
  },
  zoomIndicator: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  zoomText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  captureContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginBottom: 40,
    paddingHorizontal: 40,
    width: "100%",
  },
  sideButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "transparent",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  galleryPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  galleryIcon: {
    gap: 4,
  },
  galleryIconRow: {
    flexDirection: "row",
    gap: 4,
  },
  galleryIconSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
});
