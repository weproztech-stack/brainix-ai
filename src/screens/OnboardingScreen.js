import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity
} from "react-native";

import onboarding from "../data/onboarding";

import ScanArt from "../arts/ScanArt";
import SolutionArt from "../arts/SolutionArt";
import HistoryArt from "../arts/HistoryArt";

import onboardingStyles from "../styles/onboardingStyles";

export default function OnboardingScreen({
  onDone
}) {
  const [index, setIndex] = useState(0);

  // Fallback to prevent crash if onboarding array is empty or undefined
  const slides = onboarding || [];
  const slide = slides[index] || {};
  const isLastSlide = index === slides.length - 1;

  const next = () => {
    if (isLastSlide) {
      if (onDone) onDone();
    } else {
      setIndex((prevIndex) => prevIndex + 1);
    }
  };

  return (
    <SafeAreaView style={onboardingStyles.onboardSafe}>
      
      {/* Skip Button */}
      <TouchableOpacity
        style={onboardingStyles.skip}
        onPress={onDone}
        activeOpacity={0.7}
      >
        <Text style={onboardingStyles.skipText}>
          Skip
        </Text>
      </TouchableOpacity>

      {/* Illustration Art */}
      <View style={onboardingStyles.onboardArt}>
        {slide.art === "scan" && <ScanArt />}
        {slide.art === "solution" && <SolutionArt />}
        {slide.art === "history" && <HistoryArt />}
      </View>

      {/* Title */}
      <Text style={onboardingStyles.onboardTitle}>
        <Text style={onboardingStyles.onboardAccent}>
          {slide.titleA || ""}
        </Text>
        {slide.titleB || ""}
      </Text>

      {/* Subtitle / Body */}
      <Text style={onboardingStyles.onboardBody}>
        {slide.body || ""}
      </Text>

      {/* Pagination Dots */}
      <View style={onboardingStyles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              onboardingStyles.dot,
              i === index && onboardingStyles.dotActive
            ]}
          />
        ))}
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={onboardingStyles.nextButton}
        onPress={next}
        activeOpacity={0.8}
      >
        <Text style={onboardingStyles.nextText}>
          {isLastSlide ? "Get Started" : "Next"}
        </Text>

        <Text style={onboardingStyles.nextArrow}>
          →
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}