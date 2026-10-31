
import React from "react";
import {
  TouchableOpacity,
  View,
  Text
} from "react-native";

import IconBubble from "./IconBubble";
import homeStyles from "../styles/homeStyles";

export default function QuestionRow({
  item,
  onPress,
  compact
}) {
  return (
    <TouchableOpacity
      style={[
        homeStyles.questionRow,
        compact &&
          homeStyles.questionRowCompact
      ]}
      onPress={onPress}
    >
      <IconBubble
        label={item.icon}
        color={item.color}
      />

      <View style={homeStyles.questionText}>
        <Text
          style={homeStyles.questionTitle}
          numberOfLines={
            compact ? 1 : 2
          }
        >
          {item.title}
        </Text>

        <Text style={homeStyles.questionMeta}>
          {item.meta}
        </Text>
      </View>

      <Text style={homeStyles.questionTime}>
        {item.time}
      </Text>

      <Text style={homeStyles.rowArrow}>
        →
      </Text>
    </TouchableOpacity>
  );
}
