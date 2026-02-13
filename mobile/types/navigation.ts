import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type PredictionResult = {
  is_hotdog: boolean;
  confidence: number;
  cached: boolean;
};

export type RootStackParamList = {
  Home: undefined;
  Prompt: undefined;
  Camera: { lastGalleryPhoto: string | null };
  Evaluating: { photoUri: string };
  Result: { photoUri: string; result: PredictionResult };
};

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Home"
>;
export type PromptScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Prompt"
>;
export type CameraScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Camera"
>;
export type EvaluatingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Evaluating"
>;
export type ResultScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Result"
>;
