import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "../services/api";

const BRAND_PURPLE = "#6C4DFF";
const BRAND_PURPLE_LIGHT = "rgba(108, 77, 255, 0.08)";

export default function ProfileScreen({ setScreen, setUserRole }) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const cached = await AsyncStorage.getItem("userData");
      if (cached) {
        setUserData(JSON.parse(cached));
      }

      const res = await apiFetch("/auth/profile", { method: "GET" });
      if (res && res.success) {
        const fetchedUser = res.user || res.profile;
        if (fetchedUser) {
          setUserData(fetchedUser);
          await AsyncStorage.setItem("userData", JSON.stringify(fetchedUser));
        }
      }
    } catch (error) {
      console.log("Profile fetch warning:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const executeLogout = async () => {
      try {
        await AsyncStorage.multiRemove(["userToken", "userData", "userRole", "chatHistory"]);
      } catch (err) {
        console.log("Storage clear error:", err);
      }
      if (setUserRole) setUserRole(null);
      if (setScreen) setScreen("login");
    };

    if (typeof window !== "undefined" && window.confirm) {
      if (window.confirm("Are you sure you want to sign out?")) {
        await executeLogout();
      }
    } else {
      Alert.alert(
        "Sign Out",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            style: "destructive",
            onPress: executeLogout
          }
        ]
      );
    }
  };

  const displayName = userData?.name || "Student";
  const displayEmail = userData?.email || "No email provided";
  const displayClass = userData?.class_grade || userData?.grade || "Not specified";
  const isPro = userData?.isPro === true || userData?.planName === "PRO MEMBER";

  const handleUpgradeNavigation = () => {
    if (setScreen) {
      setScreen("premium");
    }
  };

  const handleSettingsPress = () => {
    try {
      if (setScreen) {
        // Yahan ensure karein ki aapke main router mein 'settings' screen configured ho
        setScreen("settings");
      }
    } catch (err) {
      console.log("Settings navigation error:", err);
      Alert.alert("Notice", "Settings screen is currently being configured.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Modern Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("home")} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Profile</Text>
        
        {isPro ? (
          <View style={styles.proActiveBadgeHeader}>
            <Ionicons name="shield-checkmark" size={13} color="#059669" style={{ marginRight: 4 }} />
            <Text style={styles.proActiveHeaderText}>PRO ACTIVE</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.upgradeBtn} 
            activeOpacity={0.8}
            onPress={handleUpgradeNavigation}
          >
            <Ionicons name="sparkles" size={13} color={BRAND_PURPLE} style={{ marginRight: 4 }} />
            <Text style={styles.upgradeText}>UPGRADE</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading && !userData ? (
          <ActivityIndicator color={BRAND_PURPLE} size="large" style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* Sleek Hero Profile Card */}
            <View style={styles.heroCard}>
              <View style={styles.avatarGlow}>
                <Text style={styles.avatarText}>
                  {displayName.substring(0, 2).toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.heroInfo}>
                <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>{displayEmail}</Text>
                
                <View style={styles.badgeRow}>
                  <View style={[styles.tierBadge, isPro && { backgroundColor: "#ECFDF5", borderColor: "#D1FAE5" }]}>
                    <Ionicons name={isPro ? "star" : "flash"} size={11} color={isPro ? "#059669" : BRAND_PURPLE} />
                    <Text style={[styles.tierText, isPro && { color: "#059669" }]}>
                      {isPro ? "PRO PLAN ACTIVE" : "FREE TIER"}
                    </Text>
                  </View>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={11} color="#10B981" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Elegant Stats Grid */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Inquiries</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber} numberOfLines={1}>{displayClass}</Text>
                <Text style={styles.statLabel}>Grade</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: "#10B981" }]}>Active</Text>
                <Text style={styles.statLabel}>Status</Text>
              </View>
            </View>

            {/* Account Credentials Section */}
            <Text style={styles.sectionTitle}>Account Credentials</Text>
            <View style={styles.modernCard}>
              <View style={styles.detailRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="person-outline" size={16} color={BRAND_PURPLE} />
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={styles.detailLabel}>Full Name</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>{displayName}</Text>
                </View>
              </View>

              <View style={styles.separator} />

              <View style={styles.detailRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="mail-outline" size={16} color={BRAND_PURPLE} />
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={styles.detailLabel}>Email Address</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>{displayEmail}</Text>
                </View>
              </View>

              <View style={styles.separator} />

              <View style={styles.detailRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="school-outline" size={16} color={BRAND_PURPLE} />
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={styles.detailLabel}>Class / Standard</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>{displayClass}</Text>
                </View>
              </View>
            </View>

            {/* Activity & Settings Section */}
            <Text style={styles.sectionTitle}>Preferences & Support</Text>
            
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={() => setScreen("history")}>
              <View style={styles.actionIconBox}>
                <Ionicons name="time-outline" size={18} color={BRAND_PURPLE} />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={styles.actionTitle}>Question History</Text>
                <Text style={styles.actionSub}>View past AI sessions & queries</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={handleSettingsPress}>
              <View style={styles.actionIconBox}>
                <Ionicons name="settings-outline" size={18} color={BRAND_PURPLE} />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={styles.actionTitle}>Settings</Text>
                <Text style={styles.actionSub}>App preferences, theme & support</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Logout Action */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              <Text style={styles.logoutText}>Sign Out of Account</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC", 
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0 
  },
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 14, 
    backgroundColor: "#F8FAFC", 
    justifyContent: "center", 
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#0F172A", letterSpacing: -0.3 },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: BRAND_PURPLE_LIGHT,
    borderWidth: 1,
    borderColor: "rgba(108, 77, 255, 0.2)"
  },
  upgradeText: { color: BRAND_PURPLE, fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  proActiveBadgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#D1FAE5"
  },
  proActiveHeaderText: { color: "#059669", fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
    shadowColor: "#64748B",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  avatarGlow: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(108, 77, 255, 0.2)"
  },
  avatarText: { fontSize: 22, fontWeight: "900", color: BRAND_PURPLE, letterSpacing: 0.5 },
  heroInfo: { flex: 1, marginLeft: 16 },
  userName: { fontSize: 18, fontWeight: "800", color: "#0F172A", letterSpacing: -0.3 },
  userEmail: { fontSize: 12.5, color: "#64748B", marginTop: 2, fontWeight: "500" },
  badgeRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BRAND_PURPLE_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(108, 77, 255, 0.15)"
  },
  tierText: { fontSize: 9.5, fontWeight: "800", color: BRAND_PURPLE, marginLeft: 3 },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: "#D1FAE5"
  },
  verifiedText: { fontSize: 9.5, fontWeight: "700", color: "#059669", marginLeft: 3 },

  statsRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 24,
    shadowColor: "#64748B",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1
  },
  statBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  statNumber: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  statLabel: { fontSize: 11, color: "#64748B", marginTop: 3, fontWeight: "600" },
  statDivider: { width: 1, height: 26, backgroundColor: "#E2E8F0" },

  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#475569", marginBottom: 10, marginLeft: 4, letterSpacing: 0.3, textTransform: "uppercase" },
  modernCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 24,
    shadowColor: "#64748B",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  detailLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  detailValue: { fontSize: 14, fontWeight: "700", color: "#0F172A", marginTop: 2 },
  separator: { height: 1, backgroundColor: "#F1F5F9" },

  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
    shadowColor: "#64748B",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  actionTitle: { fontSize: 14.5, fontWeight: "700", color: "#0F172A" },
  actionSub: { fontSize: 11.5, color: "#64748B", marginTop: 2 },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    shadowColor: "#EF4444",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    marginTop: 10
  },
  logoutText: { color: "#EF4444", fontSize: 14, fontWeight: "700", marginLeft: 8 }
});