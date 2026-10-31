import React from "react";
import { View, Text } from "react-native";

import IconBubble from "./IconBubble";
import { styles } from "../styles/styles";

export default function SolutionBlock({
  icon,
  title,
  body
}) {
  return (
    <View style={styles.solutionBlock}>
      <IconBubble label={icon} />

      <View style={{ flex: 1 }}>
        <Text style={styles.solutionTitle}>
          {title}
        </Text>

        <Text style={styles.solutionBody}>
          {body}
        </Text>
      </View>
    </View>
  );
}