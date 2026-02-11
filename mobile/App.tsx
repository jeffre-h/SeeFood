import { StatusBar } from 'expo-status-bar';
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

// Three food images stacked vertically
const foodImages = {
  burgers: require('./assets/images/burgers.jpg'),
  salmon: require('./assets/images/salmon.jpg'),
  pasta: require('./assets/images/pasta.jpeg'),
};

// Component for text with black outline effect
const OutlinedText = ({
  children,
  style,
  outlineColor = '#000',
  outlineWidth = 2
}: {
  children: string;
  style: any;
  outlineColor?: string;
  outlineWidth?: number;
}) => {
  return (
    <Text
      style={[
        style,
        {
          textShadowColor: outlineColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: outlineWidth * 2,
        },
      ]}
    >
      {children}
    </Text>
  );
};

// Circular dot spinner component
const DotSpinner = () => {
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
    outputRange: ['0deg', '360deg'],
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
          styles.spinnerDot,
          {
            transform: [{ translateX: x }, { translateY: y }],
            backgroundColor: isRed ? '#D32F2F' : '#FFFFFF',
            opacity: isRed ? 1 : opacity,
          },
        ]}
      />
    );
  });

  return (
    <Animated.View style={[styles.spinnerContainer, { transform: [{ rotate: rotation }] }]}>
      {dots}
    </Animated.View>
  );
};

const API_URL = 'https://jeff1709-seefood.hf.space';

type PredictionResult = {
  is_hotdog: boolean;
  confidence: number;
  cached: boolean;
};

// Navigation types
type RootStackParamList = {
  Home: undefined;
  Prompt: undefined;
  Camera: { lastGalleryPhoto: string | null };
  Evaluating: { photoUri: string };
  Result: { photoUri: string; result: PredictionResult };
};

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
type PromptScreenProps = NativeStackScreenProps<RootStackParamList, 'Prompt'>;
type CameraScreenProps = NativeStackScreenProps<RootStackParamList, 'Camera'>;
type EvaluatingScreenProps = NativeStackScreenProps<RootStackParamList, 'Evaluating'>;
type ResultScreenProps = NativeStackScreenProps<RootStackParamList, 'Result'>;

const Stack = createNativeStackNavigator<RootStackParamList>();

// Home Screen
function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Prompt')}
      >
        <OutlinedText style={styles.headerText} outlineWidth={2}>
          SEEFOOD
        </OutlinedText>
      </TouchableOpacity>
      <View style={styles.blackBorder} />

      <TouchableOpacity
        style={styles.content}
        activeOpacity={1}
        onPress={() => navigation.navigate('Prompt')}
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

// Prompt Screen
function PromptScreen({ navigation }: PromptScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [lastGalleryPhoto, setLastGalleryPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchFirstPhoto = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        const { assets } = await MediaLibrary.getAssetsAsync({
          first: 1,
          sortBy: [[MediaLibrary.SortBy.creationTime, false]],
          mediaType: 'photo',
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
    navigation.navigate('Camera', { lastGalleryPhoto });
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
            <Text style={styles.backButtonText}>{'←'}</Text>
          </TouchableOpacity>
        </View>

        <Image source={foodImages.salmon} style={styles.foodImage} />

        <View style={styles.imageWrapper}>
          <Image source={foodImages.pasta} style={styles.foodImage} />
          <View style={styles.touchPrompt}>
            <TouchableOpacity style={styles.recordButton} onPress={handleOpenCamera}>
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

// Camera Screen
function CameraScreen({ navigation, route }: CameraScreenProps) {
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
      setZoom(z => Math.min(1, Math.max(0, z + delta)));
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
      navigation.replace('Evaluating', { photoUri: photo.uri });
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]?.uri) return;
    navigation.replace('Evaluating', { photoUri: result.assets[0].uri });
  };

  return (
    <View style={styles.cameraContainer}>
      <StatusBar style="light" />
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        zoom={zoom}
      />
      <View
        style={styles.cameraOverlay}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <View style={styles.topSpacer}>
          {zoom > 0 && (
            <View style={styles.zoomIndicator}>
              <Text style={styles.zoomText}>{(1 + zoom * 9).toFixed(1)}x</Text>
            </View>
          )}
        </View>
        <View style={styles.captureContainer}>
          <TouchableOpacity
            style={styles.cameraBackButtonBottom}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cameraBackText}>{'←'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.galleryButton} onPress={handlePickImage}>
            {lastGalleryPhoto ? (
              <Image source={{ uri: lastGalleryPhoto }} style={styles.galleryPreview} />
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

// Evaluating Screen
function EvaluatingScreen({ navigation, route }: EvaluatingScreenProps) {
  const { photoUri } = route.params;

  useEffect(() => {
    const evaluateImage = async () => {
      try {
        if (!API_URL) {
          console.error('Missing EXPO_PUBLIC_API_URL');
          navigation.goBack();
          return;
        }

        const formData = new FormData();
        formData.append('image', {
          uri: photoUri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        } as any);

        const minDelay = new Promise(resolve => setTimeout(resolve, 3000));

        const apiCall = fetch(`${API_URL}/predict`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const [response] = await Promise.all([apiCall, minDelay]);
        const data = await response.json();

        if (response.ok) {
          navigation.replace('Result', { photoUri, result: data });
        } else {
          console.error('API error:', data.error);
          navigation.goBack();
        }
      } catch (error) {
        console.error('Network error:', error);
        navigation.goBack();
      }
    };

    evaluateImage();
  }, []);

  return (
    <View style={styles.evaluatingContainer}>
      <StatusBar style="light" />
      <Image source={{ uri: photoUri }} style={styles.evaluatingImage} />
      <View style={styles.evaluatingOverlay}>
        <DotSpinner />
        <OutlinedText style={styles.evaluatingText} outlineWidth={2}>
          Evaluating...
        </OutlinedText>
      </View>
    </View>
  );
}

// Result Screen
function ResultScreen({ navigation, route }: ResultScreenProps) {
  const { photoUri, result } = route.params;

  const handleTap = () => {
    navigation.popTo('Prompt');
  };

  return (
    <TouchableOpacity
      style={styles.resultContainer}
      activeOpacity={1}
      onPress={handleTap}
    >
      <StatusBar style="light" />
      <Image source={{ uri: photoUri }} style={styles.resultImage} />

      {result.is_hotdog ? (
        <View style={styles.hotdogOverlay}>
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <View style={styles.hotdogBanner}>
            <OutlinedText style={styles.hotdogText} outlineWidth={2}>
              Hotdog
            </OutlinedText>
            <View style={styles.hotdogBorderRow}>
              <View style={styles.hotdogBorderLeft} />
              <View style={styles.hotdogBorderSpacer} />
              <View style={styles.hotdogBorderRight} />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.notHotdogOverlay}>
          <View style={styles.xCircle}>
            <Text style={styles.xMark}>✕</Text>
          </View>
          <View style={styles.notHotdogBanner}>
            <View style={styles.notHotdogBorderRow}>
              <View style={styles.notHotdogBorderLeft} />
              <View style={styles.notHotdogBorderSpacer} />
              <View style={styles.notHotdogBorderRight} />
            </View>
            <OutlinedText style={styles.notHotdogText} outlineWidth={2}>
              Not hotdog
            </OutlinedText>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Main App with Navigation
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Prompt" component={PromptScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Evaluating" component={EvaluatingScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const imageHeight = (height - 140) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#D32F2F',
    paddingTop: 55,
    paddingBottom: 18,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: 2,
    transform: [{ scaleX: 1.1 }],
  },
  blackBorder: {
    height: 4,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageWrapper: {
    position: 'relative',
    height: imageHeight,
  },
  foodImage: {
    width: '100%',
    height: imageHeight,
    resizeMode: 'cover',
  },
  taglineBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    alignItems: 'center',
  },
  taglineText: {
    color: '#D32F2F',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
    transform: [{ scaleX: 1.15 }],
  },
  getStartedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 15,
    alignItems: 'center',
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: 1,
    transform: [{ scaleX: 1.1 }],
  },
  touchPrompt: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 26,
    alignItems: 'center',
  },
  touchPromptText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1.4,
    transform: [{ scaleX: 1.16 }],
    marginTop: 10,
  },
  recordButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#B71C1C',
    borderWidth: 3,
    borderColor: '#5C0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E53935',
  },
  backButton: {
    position: 'absolute',
    top: 54,
    right: 12,
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  topSpacer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  zoomIndicator: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  zoomText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  cameraBackButtonBottom: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBackText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  captureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: 40,
    paddingHorizontal: 40,
    width: '100%',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
    flexDirection: 'row',
    gap: 4,
  },
  galleryIconSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  evaluatingContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  evaluatingImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  evaluatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  spinnerDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  evaluatingText: {
    color: '#FFFFFF',
    fontSize: 46,
    fontWeight: '700',
    letterSpacing: 1,
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  resultImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  hotdogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  checkmarkCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#4CD964',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginTop: -45,
    zIndex: 0,
  },
  hotdogBanner: {
    backgroundColor: '#4CD964',
    width: '100%',
    paddingTop: 55,
    paddingBottom: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  hotdogText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 1,
  },
  hotdogBorderRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: 3,
  },
  hotdogBorderLeft: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  hotdogBorderSpacer: {
    width: 118,
  },
  hotdogBorderRight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 75,
    fontWeight: '900',
    marginBottom: -25,
  },
  notHotdogOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  xCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#C62828',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: -45,
    zIndex: 0,
  },
  notHotdogBanner: {
    backgroundColor: '#C62828',
    width: '100%',
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
    zIndex: 1,
  },
  notHotdogBorderRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: 3,
  },
  notHotdogBorderLeft: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  notHotdogBorderSpacer: {
    width: 118,
  },
  notHotdogBorderRight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  xMark: {
    color: '#FFFFFF',
    fontSize: 75,
    fontWeight: '900',
    marginTop: -25,
  },
  notHotdogText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
