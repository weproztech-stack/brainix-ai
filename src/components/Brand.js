
import React from "react";
import { View, Text } from "react-native";

import commonStyles from "../styles/commonStyles";

export default function Brand({ large }) {
  return (
    <View style={commonStyles.brand}>
      <Text
        style={[
          commonStyles.brandText,
          large && commonStyles.brandTextLarge
        ]}
      >
        Brainix
      </Text>

      <Text
        style={[
          commonStyles.brandAi,
          large && commonStyles.brandTextLarge
        ]}
      >
        AI
      </Text>

      <Text style={commonStyles.spark}>
        ✦✦
      </Text>
    </View>
  );
}