import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GraduationCap, Briefcase, ChevronRight, Sparkles } from "lucide-react-native";

const BRAND_PURPLE = "#8547FB";
const BRAND_PURPLE_LIGHT = "rgba(133, 71, 251, 0.08)";
const BRAND_PURPLE_BORDER = "rgba(133, 71, 251, 0.25)";

export default function RoleSelectScreen({ setScreen, setUserRole }) {
  const [selectedRole, setSelectedRole] = useState("student");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem("userRole", selectedRole);
      if (setUserRole) setUserRole(selectedRole);

      // Check if user already has an active authenticated session
      const token = await AsyncStorage.getItem("userToken");
      const cachedRole = await AsyncStorage.getItem("userRole");

      if (token && cachedRole === selectedRole) {
        if (selectedRole === "teacher") {
          setScreen("teacher_home");
        } else {
          setScreen("home");
        }
      } else {
        // Unauthenticated -> Send to respective registration screen
        if (selectedRole === "teacher") {
          setScreen("teacher_register");
        } else {
          setScreen("register");
        }
      }
    } catch (e) {
      console.error("Role save error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.headerBox}>
          <View style={styles.badge}>
            <Sparkles size={12} color={BRAND_PURPLE} />
            <Text style={styles.badgeText}>Brainix AI Ecosystem</Text>
          </View>
          <Text style={styles.mainTitle}>Select Your Role</Text>
          <Text style={styles.subTitle}>
            Choose how you would like to get started with the platform today.
          </Text>
        </View>

        {/* Roles List */}
        <View style={styles.cardsContainer}>
          
          {/* 1. Student Card */}
          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === "student" ? styles.cardActive : styles.cardInactive
            ]}
            onPress={() => setSelectedRole("student")}
            activeOpacity={0.85}
          >
            <View style={[styles.iconBox, selectedRole === "student" && styles.iconBoxActive]}>
              <GraduationCap size={24} color={selectedRole === "student" ? "#FFFFFF" : BRAND_PURPLE} />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.roleTitle}>I am a Student / Learner</Text>
              <Text style={styles.roleDescription}>
                Solve doubts instantly with Vision AI, explore exam PYQs, and book top mentors.
              </Text>
            </View>

            <View style={[styles.radioCircle, selectedRole === "student" && styles.radioCircleActive]}>
              {selectedRole === "student" && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* 2. Teacher Card */}
          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === "teacher" ? styles.cardActive : styles.cardInactive
            ]}
            onPress={() => setSelectedRole("teacher")}
            activeOpacity={0.85}
          >
            <View style={[styles.iconBox, selectedRole === "teacher" && styles.iconBoxActive]}>
              <Briefcase size={24} color={selectedRole === "teacher" ? "#FFFFFF" : BRAND_PURPLE} />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.roleTitle}>I am a Teacher / Educator</Text>
              <Text style={styles.roleDescription}>
                Manage bookings, take 1-on-1 online/home sessions, and withdraw payouts.
              </Text>
            </View>

            <View style={[styles.radioCircle, selectedRole === "teacher" && styles.radioCircleActive]}>
              {selectedRole === "teacher" && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

        </View>

        {/* Footer CTA & Sign In Switch */}
        <View style={styles.footerBox}>
          <TouchableOpacity
            style={[styles.continueBtn, loading && { opacity: 0.7 }]}
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.btnText}>Get Started as {selectedRole === "teacher" ? "Educator" : "Student"}</Text>
                <ChevronRight size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInLink}
            onPress={() => setScreen("login")}
            activeOpacity={0.7}
          >
            <Text style={styles.signInText}>
              Already have an account? <Text style={{ color: BRAND_PURPLE, fontWeight: "700" }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    paddingVertical: 20
  },
  headerBox: {
    alignItems: "center",
    marginTop: 20
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: BRAND_PURPLE_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BRAND_PURPLE_BORDER,
    marginBottom: 10
  },
  badgeText: {
    color: BRAND_PURPLE,
    fontSize: 11,
    fontWeight: "700"
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
    marginBottom: 6
  },
  subTitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16
  },
  cardsContainer: {
    gap: 14,
    marginVertical: 20
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    backgroundColor: "#FFFFFF"
  },
  cardActive: {
    borderColor: BRAND_PURPLE,
    shadowColor: BRAND_PURPLE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  cardInactive: {
    borderColor: "#E2E8F0"
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  iconBoxActive: {
    backgroundColor: BRAND_PURPLE
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2
  },
  roleDescription: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8
  },
  radioCircleActive: {
    borderColor: BRAND_PURPLE
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND_PURPLE
  },
  footerBox: {
    marginBottom: 10,
    alignItems: "center"
  },
  continueBtn: {
    width: "100%",
    backgroundColor: BRAND_PURPLE,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: BRAND_PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700"
  },
  signInLink: {
    marginTop: 16,
    paddingVertical: 4
  },
  signInText: {
    fontSize: 13,
    color: "#64748B"
  }
});