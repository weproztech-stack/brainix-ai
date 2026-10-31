import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft, Menu, Trash2, Crown, ShieldCheck } from "lucide-react-native";

import colors from "../constants/colors";
import Brand from "./Brand";
import commonStyles from "../styles/commonStyles";

export default function Header({
  title,
  onMenu,
  onBack,
  onDelete,
  onRestore,
  setScreen,
  right = "pro"
}) {
  const [isProUser, setIsProUser] = useState(false);

  useEffect(() => {
    checkUserSubscription();
  }, []);

  const checkUserSubscription = async () => {
    try {
      const cached = await AsyncStorage.getItem("userData");
      if (cached) {
        const parsed = JSON.parse(cached);
        // Profile screen wala exact check jo 100% working hai
        const proActive = parsed?.isPro === true || parsed?.planName === "PRO MEMBER" || parsed?.is_pro === true;
        setIsProUser(proActive);
      }
    } catch (error) {
      console.log("Header Pro check error:", error);
    }
  };

  const handleUpgradePress = () => {
    if (setScreen) {
      setScreen("premium");
    }
  };

  return (
    <View style={styles.headerContainer}>
      {/* Left Action Button: Vector Back Arrow or Drawer Menu */}
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onBack ? onBack : onMenu}
        activeOpacity={0.7}
      >
        {onBack ? (
          <ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
        ) : (
          <Menu size={22} color="#0F172A" strokeWidth={2.2} />
        )}
      </TouchableOpacity>

      {/* Dynamic Screen Title or Brand Logo */}
      {title ? (
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <Brand />
      )}

      {/* Right Action Elements */}
      {right === "trash" ? (
        <TouchableOpacity 
          style={styles.iconBtn}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Trash2 size={20} color="#EF4444" strokeWidth={2} />
        </TouchableOpacity>
      ) : right === "restore" ? (
        <TouchableOpacity onPress={onRestore} activeOpacity={0.7}>
          <Text style={styles.restoreText}>
            Restore
          </Text>
        </TouchableOpacity>
      ) : (
        /* Realtime Dynamic Pro / Upgrade Badge Button */
        <TouchableOpacity 
          style={[
            styles.proPillBtn,
            isProUser && styles.proPillActive
          ]}
          onPress={handleUpgradePress}
          activeOpacity={0.8}
        >
          {isProUser ? (
            <ShieldCheck size={14} color="#059669" strokeWidth={2.5} />
          ) : (
            <Crown size={14} color="#6C4DFF" strokeWidth={2.5} />
          )}
          <Text style={[
            styles.proPillText,
            isProUser && { color: "#059669" }
          ]}>
            {isProUser ? "PRO ACTIVE" : "Upgrade"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#F8FAFC",
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 0.2,
    textAlign: "center",
    flex: 1,
    marginHorizontal: 8,
  },
  proPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(108, 77, 255, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#6C4DFF",
  },
  proPillActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#D1FAE5",
  },
  proPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6C4DFF",
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  restoreText: {
    color: "#6C4DFF",
    fontSize: 13,
    fontWeight: "700",
  }
});