import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Home, Clock, UserCheck, GraduationCap, User } from "lucide-react-native";

export default function BottomTabs({ active, setScreen }) {
  const tabs = [
    { id: "home", label: "Home", screen: "home", Icon: Home },
    { id: "history", label: "History", screen: "history", Icon: Clock },
    // 👨‍🏫 Premium/Upgrade replaced with Consult Teacher
    { id: "consult", label: "Consult", screen: "consult", Icon: UserCheck },
    { id: "examprep", label: "Exam Prep", screen: "examprep", Icon: GraduationCap },
    { id: "profile", label: "Profile", screen: "profile", Icon: User },
  ];

  return (
    <View style={styles.container}>
      {tabs.map(({ id, label, screen, Icon }) => {
        const isActive =
          active?.toLowerCase() === id.toLowerCase() ||
          active?.toLowerCase() === label.toLowerCase() ||
          active?.toLowerCase() === screen.toLowerCase();

        const activeColor = "#6C4DFF";
        const inactiveColor = "#94A3B8";

        return (
          <TouchableOpacity
            key={id}
            style={styles.tabItem}
            onPress={() => setScreen(screen)}
            activeOpacity={0.7}
          >
            <Icon
              size={22}
              color={isActive ? activeColor : inactiveColor}
              strokeWidth={isActive ? 2.5 : 1.8}
            />

            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? activeColor : inactiveColor },
                isActive && styles.activeTabLabel,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 4,
  },
  activeTabLabel: {
    fontWeight: "700",
  },
});