import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  StyleSheet
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  FileText,
  GraduationCap,
  HelpCircle,
  LogOut,
  Plus,
  Crown,
  ChevronRight,
  BookOpen,
  UserCheck
} from "lucide-react-native";

import { apiFetch } from "../services/api";

function DrawerLink({ label, Icon, onPress, isDanger, isHighlight }) {
  return (
    <TouchableOpacity
      style={[
        styles.drawerLink,
        isDanger && styles.dangerDrawerLink,
        isHighlight && styles.highlightDrawerLink
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.linkIconBox}>
        <Icon
          size={17}
          color={isDanger ? "#EF4444" : isHighlight ? "#10B981" : "#6C4DFF"}
          strokeWidth={2}
        />
      </View>
      <Text
        style={[
          styles.drawerLinkText,
          isDanger && styles.dangerLinkText,
          isHighlight && styles.highlightLinkText
        ]}
      >
        {label}
      </Text>
      <ChevronRight
        size={15}
        color={isDanger ? "#EF4444" : isHighlight ? "#10B981" : "#94A3B8"}
      />
    </TouchableOpacity>
  );
}

export default function SideDrawer({ setScreen, onClose, setQuestion, setSessionId }) {
  const [userData, setUserData] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [recentHistory, setRecentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadDrawerRealtimeData();
  }, []);

  const loadDrawerRealtimeData = async () => {
    try {
      // 1. Local Cache User Data
      const storedUser = await AsyncStorage.getItem("userData");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserData(parsed);
        setIsPro(Boolean(parsed?.is_pro === true || parsed?.is_pro === 1 || parsed?.subscription_status === "active"));
      }

      // Profile Fresh Fetch
      const profileRes = await apiFetch("/auth/profile");
      if (profileRes && profileRes.success && profileRes.user) {
        setUserData(profileRes.user);
        setIsPro(Boolean(profileRes.user.is_pro === true || profileRes.user.is_pro === 1 || profileRes.user.subscription_status === "active"));
        await AsyncStorage.setItem("userData", JSON.stringify(profileRes.user));
      }

      // Usage/Plan Status
      const usageRes = await apiFetch("/ai/usage-status");
      if (usageRes && usageRes.success) {
        setIsPro(Boolean(usageRes.is_pro));
      }

      // 2. Fetch History (Limit to top 3)
      setLoadingHistory(true);

      const cachedHistory = await AsyncStorage.getItem("chatHistory");
      if (cachedHistory) {
        const parsedCached = JSON.parse(cachedHistory);
        if (Array.isArray(parsedCached) && parsedCached.length > 0) {
          const normalizedCache = parsedCached.map((item) => {
            const displayTitle = item.title || item.question || item.first_message || "Saved Solution";
            return {
              id: item.id || item._id,
              title: displayTitle
            };
          });
          setRecentHistory(normalizedCache.slice(0, 3));
        }
      }

      let historyRes = await apiFetch("/ai/history");
      if (!historyRes || !historyRes.success) {
        historyRes = await apiFetch("/ai/sessions");
      }

      if (historyRes && historyRes.success) {
        const list = historyRes.history || historyRes.sessions || historyRes.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const formattedList = list.map((item) => {
            const displayTitle = item.title || item.question || item.first_message || "Saved Solution";
            return {
              id: item.id || item._id,
              title: displayTitle
            };
          });

          setRecentHistory(formattedList.slice(0, 3)); // Max 3 items
          await AsyncStorage.setItem("chatHistory", JSON.stringify(formattedList));
        }
      }

    } catch (error) {
      console.log("Drawer Realtime Fetch Error:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const go = (screen) => {
    onClose();
    if (screen && setScreen) {
      setScreen(screen);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    onClose();
    Alert.alert(
      "Logout Confirmation",
      "Are you sure you want to log out of Brainix AI?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          press: async () => {},
          onPress: async () => {
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userData");
            await AsyncStorage.removeItem("chatHistory");
            if (setScreen) setScreen("login");
          }
        }
      ]
    );
  };

  const getInitials = (name) => {
    if (!name) return "AT";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const userName = userData?.name || "Student User";

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlayWrapper}>
        <View style={styles.drawerContainer}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

            {/* Profile Header */}
            <TouchableOpacity 
              style={styles.profileCard}
              onPress={() => go("profile")}
              activeOpacity={0.8}
            >
              <View style={[styles.avatarBorder, isPro && { backgroundColor: "#D1FAE5" }]}>
                <View style={[styles.avatarInner, isPro && { backgroundColor: "#10B981" }]}>
                  <Text style={styles.avatarText}>
                    {getInitials(userName)}
                  </Text>
                </View>
              </View>

              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {userName}
                </Text>

                <View style={[styles.badgePill, isPro ? styles.proBadge : styles.freeBadge]}>
                  <Text style={[styles.badgeText, { color: isPro ? "#059669" : "#6C4DFF" }]}>
                    {isPro ? "👑 Pro Student" : "⚡ Free Plan"}
                  </Text>
                </View>
              </View>

              <ChevronRight size={16} color="#94A3B8" />
            </TouchableOpacity>

            {/* Ask New Question Button */}
            <TouchableOpacity
              style={styles.newQuestionBtn}
              onPress={() => go("home")}
              activeOpacity={0.85}
            >
              <View style={styles.plusIconCircle}>
                <Plus size={14} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={styles.newQuestionText}>Ask New Question</Text>
            </TouchableOpacity>

            {/* Recent Searches Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeadingTitle}>RECENT SEARCHES</Text>
              <TouchableOpacity onPress={() => go("history")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {/* 3 Compact History Items */}
            {loadingHistory && recentHistory.length === 0 ? (
              <ActivityIndicator color="#6C4DFF" size="small" style={{ marginVertical: 10 }} />
            ) : recentHistory.length > 0 ? (
              recentHistory.map((item, idx) => (
                <TouchableOpacity
                  key={item.id || idx}
                  style={styles.compactHistoryRow}
                  onPress={() => {
                    if (setQuestion) setQuestion(item.title);
                    if (setSessionId) setSessionId(item.id);
                    go("solution");
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.historyDot}>•</Text>
                  <Text style={styles.compactHistoryText} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <ChevronRight size={14} color="#CBD5E1" />
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                style={styles.emptyCompactRow}
                onPress={() => go("history")}
                activeOpacity={0.7}
              >
                <Text style={styles.emptyCompactText}>No recent searches • View history</Text>
              </TouchableOpacity>
            )}

            {/* Upgrade Pro Card (Only if free) */}
            {!isPro && (
              <TouchableOpacity
                style={styles.upgradeCard}
                onPress={() => go("premium")}
                activeOpacity={0.85}
              >
                <View style={styles.proCrownBadge}>
                  <Crown size={16} color="#6C4DFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                  <Text style={styles.upgradeSub}>Unlimited doubts & instant answers</Text>
                </View>
                <ChevronRight size={15} color="#6C4DFF" />
              </TouchableOpacity>
            )}

            <View style={styles.divider} />
            <Text style={styles.sectionHeadingTitle}>PREFERENCES & ACCOUNT</Text>

            {/* Navigation Links */}
            <DrawerLink
              label="Book Teacher / Consult"
              Icon={UserCheck}
              isHighlight
              onPress={() => go("consultation")}
            />

            <DrawerLink
              label="AI e-Library"
              Icon={BookOpen}
              onPress={() => go("elibrary")}
            />

            <DrawerLink
              label="Search History"
              Icon={FileText}
              onPress={() => go("history")}
            />

            <DrawerLink
              label="Exam Preparation"
              Icon={GraduationCap}
              onPress={() => go("examprep")}
            />

            <DrawerLink
              label="Help & Support"
              Icon={HelpCircle}
              onPress={() => go("help")}
            />

            <DrawerLink
              label="Sign Out Account"
              Icon={LogOut}
              isDanger
              onPress={handleLogout}
            />

            <Text style={styles.appVersionText}>Brainix AI v1.0.4 • Glass Light</Text>
          </ScrollView>
        </View>

        {/* Outside Backdrop */}
        <TouchableOpacity
          style={styles.backdropRest}
          onPress={onClose}
          activeOpacity={1}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayWrapper: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.4)",
  },
  backdropRest: {
    flex: 1,
  },
  drawerContainer: {
    width: "78%",
    maxWidth: 300,
    backgroundColor: "#F8FAFC",
    height: "100%",
    paddingTop: 45,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },

  /* Profile Header */
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatarBorder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 2,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6C4DFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  profileName: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  proBadge: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  freeBadge: {
    backgroundColor: "rgba(108, 77, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(108, 77, 255, 0.2)",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
  },

  /* Ask New Question Button */
  newQuestionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C4DFF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  plusIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  newQuestionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  sectionHeadingTitle: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  seeAllText: {
    color: "#6C4DFF",
    fontSize: 11,
    fontWeight: "700",
  },

  /* Compact History Item */
  compactHistoryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 2.5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  historyDot: {
    color: "#6C4DFF",
    fontSize: 16,
    fontWeight: "900",
    marginRight: 8,
    lineHeight: 18,
  },
  compactHistoryText: {
    flex: 1,
    color: "#334155",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyCompactRow: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  emptyCompactText: {
    color: "#94A3B8",
    fontSize: 11,
    fontStyle: "italic",
  },

  /* Upgrade Card */
  upgradeCard: {
    backgroundColor: "rgba(108, 77, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(108, 77, 255, 0.2)",
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  proCrownBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(108, 77, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  upgradeTitle: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "700",
  },
  upgradeSub: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 1,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 10,
  },

  /* Drawer Navigation Links */
  drawerLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 10,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  highlightDrawerLink: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  dangerDrawerLink: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
  linkIconBox: {
    marginRight: 8,
    width: 20,
    alignItems: "center",
  },
  drawerLinkText: {
    flex: 1,
    color: "#0F172A",
    fontSize: 12.5,
    fontWeight: "600",
  },
  highlightLinkText: {
    color: "#059669",
    fontWeight: "700",
  },
  dangerLinkText: {
    color: "#EF4444",
  },
  appVersionText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 10,
    fontStyle: "italic",
    marginTop: 14,
  }
});