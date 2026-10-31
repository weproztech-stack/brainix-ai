
import React from "react";
import { View } from "react-native";

import commonStyles from "../styles/commonStyles";

export default function Robot({ size = 132 }) {
  return (
    <View
      style={[
        commonStyles.robot,
        {
          width: size,
          height: size
        }
      ]}
    >
      <View
        style={[
          commonStyles.robotGlow,
          {
            width: size,
            height: size,
            borderRadius: size / 2
          }
        ]}
      />

      <View
        style={[
          commonStyles.robotHead,
          {
            width: size * 0.66,
            height: size * 0.54
          }
        ]}
      >
        <View style={commonStyles.robotFace}>
          <View style={commonStyles.robotEye} />
          <View style={commonStyles.robotEye} />
        </View>
      </View>

      <View style={commonStyles.robotAntenna} />
    </View>
  );
}
