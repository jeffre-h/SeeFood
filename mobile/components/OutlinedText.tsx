import { Text, TextStyle, StyleProp } from "react-native";

type OutlinedTextProps = {
  children: string;
  style?: StyleProp<TextStyle>;
  outlineColor?: string;
  outlineWidth?: number;
};

export function OutlinedText({
  children,
  style,
  outlineColor = "#000",
  outlineWidth = 2,
}: OutlinedTextProps) {
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
}
