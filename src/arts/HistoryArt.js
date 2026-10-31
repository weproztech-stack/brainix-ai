
import React from "react";
import { View, Text } from "react-native";

import questions from "../data/questions";
import IconBubble from "../components/IconBubble";
import onboardingStyles from "../styles/onboardingStyles";

export default function HistoryArt() {
  return (
    <View style={onboardingStyles.artBlob}>
      <View style={onboardingStyles.historyMini}>
        <View style={onboardingStyles.historyMiniHead}>
          <Text style={onboardingStyles.historyMiniTitle}>
            History
          </Text>

          <IconBubble
            label="cal"
            size={28}
          />
        </View>

        {questions.map((q) => (
          <View
            style={onboardingStyles.historyMiniRow}
            key={q.title}
          >
            <IconBubble
              label={q.icon}
              size={30}
              color={q.color}
            />

            <View style={{ flex: 1 }}>
              <Text
                style={onboardingStyles.historyMiniQuestion}
              >
                {q.title
                  .split(" ")
                  .slice(0, 2)
                  .join(" ")}
              </Text>

              <View style={onboardingStyles.miniLine} />
            </View>

            <Text style={onboardingStyles.miniTime}>
              {q.time}
            </Text>
          </View>
        ))}
      </View>

      <View style={onboardingStyles.clockBadge}>
        <Text style={onboardingStyles.clockText}>
          HIST
        </Text>
      </View>
    </View>
  );
}
