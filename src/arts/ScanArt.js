import React from "react";
import { View, Text } from "react-native";

import onboardingStyles from "../styles/onboardingStyles";

export default function ScanArt() {
  return (
    <View style={onboardingStyles.artBlob}>
      <View style={onboardingStyles.paper}>
        <Text style={onboardingStyles.formula}>
          x² + y² = z²
        </Text>

        <View style={onboardingStyles.lineLong} />

        <View style={onboardingStyles.lineShort} />

        <View style={onboardingStyles.triangle} />
      </View>

      <View style={onboardingStyles.cameraBadge}>
        <Text style={onboardingStyles.cameraText}>
          📷
        </Text>
      </View>
    </View>
  );
}
