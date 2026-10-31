
import React from "react";
import { TouchableOpacity, Text } from "react-native";

import IconBubble from "./IconBubble";
import homeStyles from "../styles/homeStyles";

export default function FeatureButton({
  icon,
  title,
  sub,
  color,
  onPress
}) {
  return (
    <TouchableOpacity
      style={homeStyles.featureButton}
      onPress={onPress}
    >
      <IconBubble
        label={icon}
        color={color}
      />

      <Text style={homeStyles.featureTitle}>
        {title}
      </Text>

      <Text style={homeStyles.featureSub}>
        {sub}
      </Text>

      <Text style={homeStyles.featureChevron}>
        →
      </Text>
    </TouchableOpacity>
  );
}
