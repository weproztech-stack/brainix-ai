
import React from "react";
import { View, Text } from "react-native";

import Robot from "../components/Robot";
import onboardingStyles from "../styles/onboardingStyles";

export default function SolutionArt() {
  return (
    <View style={onboardingStyles.artBlob}>
      <View style={onboardingStyles.chatTop}>
        <Text style={onboardingStyles.chatTopText}>
          Explain Newton's{"\n"}
          Second Law
        </Text>
      </View>

      <View style={onboardingStyles.solutionCardMini}>
        <Robot size={54} />

        <View style={onboardingStyles.lineLong} />

        <View style={onboardingStyles.lineShort} />

        <Text style={onboardingStyles.formulaPill}>
          F = ma
        </Text>

        <View style={onboardingStyles.lineLong} />
      </View>
    </View>
  );
}
