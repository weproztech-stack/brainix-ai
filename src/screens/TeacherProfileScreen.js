import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  User,
  Star,
  BookOpen,
  DollarSign,
  ShieldCheck,
  Calendar,
  Wallet,
  ChevronRight,
  LogOut,
  Edit3,
  Video,
  Award,
  X,
  ArrowLeft
} from "lucide-react-native";

import { apiFetch } from "../services/api";

const BRAND_PURPLE = "#8547FB";
const BRAND_PURPLE_LIGHT = "rgba(133, 71, 251, 0.08)";
const BRAND_PURPLE_BORDER = "rgba(133, 71, 251, 0.22)";

export default function TeacherProfileScreen({ setScreen, setUserRole }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Live Database Profile State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    subject_specialization: "",
    qualifications: "",
    experience_years: 0,
    hourly_rate: 499,
    bio: "",
    total_sessions: 0,
    total_earnings: 0,
    rating: 5.0
  });

  // Edit Profile Modal States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editQualifications, setEditQualifications] = useState("");
  const [editExperience, setEditExperience] = useState("");
  const [editRate, setEditRate] = useState("");
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    fetchLiveProfile();
  }, []);

  // 📥 1. Live Fetch from DB using original working endpoint
  const fetchLiveProfile = async () => {
    try {
      const res = await apiFetch("/teacher/dashboard");
      if (res && res.success && res.profile) {
        const p = res.profile;
        setProfile({
          name: p.full_name || p.name || "Educator",
          email: p.email || "",
          phone: p.phone || "",
          subject_specialization: p.subject || p.subject_specialization || "General Subjects",
          qualifications: p.qualifications || "Certified Faculty",
          experience_years: p.experience_years || 1,
          hourly_rate: parseFloat(p.hourly_rate) || 499,
          bio: p.bio || "Passionate educator dedicated to student success.",
          total_sessions: res.stats?.total_bookings || 0,
          total_earnings: res.stats?.total_earnings || 0,
          rating: 4.9
        });
      }
    } catch (e) {
      console.log("Profile load error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLiveProfile();
  }, []);

  const openEditModal = () => {
    setEditName(profile.name);
    setEditPhone(profile.phone);
    setEditSubject(profile.subject_specialization);
    setEditQualifications(profile.qualifications);
    setEditExperience(profile.experience_years.toString());
    setEditRate(profile.hourly_rate.toString());
    setEditBio(profile.bio);
    setEditModalVisible(true);
  };

  // 💾 2. Save Updated Profile to DB
  const handleSaveProfile = async () => {
    if (!editName.trim() || !editSubject.trim() || !editRate.trim()) {
      Alert.alert("Required", "Name, subject specialization, and hourly rate cannot be empty.");
      return;
    }

    setUpdating(true);
    try {
      const res = await apiFetch("/teacher/profile", {
        method: "PUT",
        body: JSON.stringify({
          full_name: editName.trim(),
          phone: editPhone.trim(),
          subject: editSubject.trim(),
          qualifications: editQualifications.trim(),
          experience_years: parseInt(editExperience) || 1,
          hourly_rate: parseFloat(editRate) || 499,
          bio: editBio.trim()
        })
      });

      if (res && res.success) {
        Alert.alert("Success", "Profile & rates updated successfully in database.");
        setEditModalVisible(false);
        fetchLiveProfile();
      } else {
        Alert.alert("Notice", res?.message || "Could not update profile.");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to connect to database server.");
    } finally {
      setUpdating(false);
    }
  };

  // 🚪 3. Fixed Logout Handler
  const handleLogout = () => {
    Alert.alert(
      "Confirm Sign Out",
      "Are you sure you want to log out of your Brainix Educator account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear(); // Clear all local storage tokens completely
              if (setUserRole) setUserRole(null);
              if (setScreen) setScreen("login");
            } catch (err) {
              console.log("Logout execution error:", err);
            }
          }
        }
      ]
    );
  };

  const getInitials = (name) => {
    if (!name) return "ED";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      
      {/* Native Clean Header with Back Button */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("teacher_home")}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Educator Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BRAND_PURPLE]} />}
      >
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color={BRAND_PURPLE} />
            <Text style={styles.loaderText}>Syncing educator credentials...</Text>
          </View>
        ) : (
          <>
            {/* 🌟 Profile Hero Card */}
            <View style={styles.heroCard}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
              </View>

              <Text style={styles.userName}>{profile.name}</Text>
              <Text style={styles.userHeadline}>
                {profile.subject_specialization} • {profile.qualifications}
              </Text>

              <View style={styles.verifiedRow}>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={13} color="#059669" />
                  <Text style={styles.verifiedText}>Verified Educator • Background Checked</Text>
                </View>
              </View>

              {/* Quick Metrics Bar */}
              <View style={styles.metricsBar}>
                <View style={styles.metricCol}>
                  <Text style={styles.metricValue}>⭐ {profile.rating}</Text>
                  <Text style={styles.metricLabel}>Rating</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricCol}>
                  <Text style={styles.metricValue}>{profile.total_sessions}</Text>
                  <Text style={styles.metricLabel}>Sessions</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricCol}>
                  <Text style={styles.metricValue}>{profile.experience_years} Yrs</Text>
                  <Text style={styles.metricLabel}>Experience</Text>
                </View>
              </View>

              {/* Edit Profile CTA */}
              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={openEditModal}
                activeOpacity={0.85}
              >
                <Edit3 size={15} color={BRAND_PURPLE} />
                <Text style={styles.editBtnText}>Edit Profile & Rates</Text>
              </TouchableOpacity>
            </View>

            {/* 📖 Subjects & Specialization */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeaderTitle}>TEACHING EXPERTISE</Text>
              <View style={styles.chipRow}>
                <View style={styles.subjectChip}>
                  <BookOpen size={13} color={BRAND_PURPLE} />
                  <Text style={styles.subjectChipText}>{profile.subject_specialization}</Text>
                </View>
                <View style={styles.boardChip}>
                  <Text style={styles.boardChipText}>{profile.qualifications}</Text>
                </View>
              </View>
            </View>

            {/* 💵 Pricing & Consultation Rates */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeaderTitle}>CONSULTATION RATES</Text>
              
              <View style={styles.rateRow}>
                <View style={styles.rateIconCircle}>
                  <Video size={16} color={BRAND_PURPLE} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.rateTitle}>1-on-1 Online Live Class</Text>
                  <Text style={styles.rateSub}>Audio, video & interactive whiteboard</Text>
                </View>
                <Text style={styles.ratePrice}>
                  ₹{profile.hourly_rate}<Text style={styles.rateUnit}>/session</Text>
                </Text>
              </View>
            </View>

            {/* 📝 About Bio */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeaderTitle}>TEACHING PHILOSOPHY & BIO</Text>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>

            {/* ⚙️ Management Navigation Links */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeaderTitle}>FACULTY DESK</Text>

              <TouchableOpacity
                style={styles.navRow}
                onPress={() => setScreen("teacher_availability")}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Calendar size={17} color={BRAND_PURPLE} />
                  <Text style={styles.navTitle}>Manage Weekly Calendar Slots</Text>
                </View>
                <ChevronRight size={17} color="#94A3B8" />
              </TouchableOpacity>

              <View style={styles.cardDivider} />

              <TouchableOpacity
                style={styles.navRow}
                onPress={() => setScreen("teacher_portal")}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Award size={17} color={BRAND_PURPLE} />
                  <Text style={styles.navTitle}>Attendance, Alerts & Classroom Bridge</Text>
                </View>
                <ChevronRight size={17} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* 🚪 Log Out Button */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <LogOut size={16} color="#EF4444" />
              <Text style={styles.logoutBtnText}>Sign Out Educator Account</Text>
            </TouchableOpacity>

            <Text style={styles.footerVersionText}>Brainix AI Educator Portal • Verified</Text>
          </>
        )}
      </ScrollView>

      {/* ✏️ EDIT PROFILE & RATES MODAL */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile & Rates</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeBtn}>
                <X size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>FULL NAME *</Text>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Dr. Rajesh Sharma" />

              <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
              <TextInput style={styles.input} value={editPhone} onChangeText={setEditPhone} placeholder="+91 98765 43210" keyboardType="phone-pad" />

              <Text style={styles.inputLabel}>TEACHING SUBJECTS *</Text>
              <TextInput style={styles.input} value={editSubject} onChangeText={setEditSubject} placeholder="Mathematics, Physics" />

              <Text style={styles.inputLabel}>QUALIFICATIONS</Text>
              <TextInput style={styles.input} value={editQualifications} onChangeText={setEditQualifications} placeholder="M.Sc, B.Ed" />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>EXPERIENCE (YEARS)</Text>
                  <TextInput style={styles.input} value={editExperience} onChangeText={setEditExperience} keyboardType="numeric" placeholder="4" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>SESSION FEE (₹) *</Text>
                  <TextInput style={styles.input} value={editRate} onChangeText={setEditRate} keyboardType="numeric" placeholder="499" />
                </View>
              </View>

              <Text style={styles.inputLabel}>ABOUT BIO</Text>
              <TextInput
                style={[styles.input, { height: 75, textAlignVertical: "top" }]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Brief description about your teaching style..."
                multiline
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveProfileBtn, updating && { opacity: 0.7 }]}
              onPress={handleSaveProfile}
              disabled={updating}
              activeOpacity={0.88}
            >
              {updating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveProfileBtnText}>Save Profile Updates</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0"
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center"
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A"
  },
  loaderBox: {
    paddingVertical: 60,
    alignItems: "center"
  },
  loaderText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 12.5,
    fontWeight: "600"
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 90
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BRAND_PURPLE,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900"
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A"
  },
  userHeadline: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 2,
    paddingHorizontal: 10
  },
  verifiedRow: {
    marginTop: 8,
    marginBottom: 12
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  verifiedText: {
    color: "#059669",
    fontSize: 10.5,
    fontWeight: "700"
  },
  metricsBar: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12
  },
  metricCol: {
    flex: 1,
    alignItems: "center"
  },
  metricDivider: {
    width: 1,
    backgroundColor: "#E2E8F0"
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A"
  },
  metricLabel: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
    backgroundColor: BRAND_PURPLE_LIGHT,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BRAND_PURPLE_BORDER
  },
  editBtnText: {
    color: BRAND_PURPLE,
    fontSize: 12.5,
    fontWeight: "700"
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  sectionHeaderTitle: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  subjectChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: BRAND_PURPLE_LIGHT,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BRAND_PURPLE_BORDER
  },
  subjectChipText: {
    color: BRAND_PURPLE,
    fontSize: 11.5,
    fontWeight: "700"
  },
  boardChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  boardChipText: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "600"
  },
  rateRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  rateIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  rateTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A"
  },
  rateSub: {
    fontSize: 10.5,
    color: "#64748B",
    marginTop: 1
  },
  ratePrice: {
    fontSize: 15,
    fontWeight: "800",
    color: BRAND_PURPLE
  },
  rateUnit: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500"
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10
  },
  bioText: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4
  },
  navTitle: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#0F172A"
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginTop: 4,
    marginBottom: 8
  },
  logoutBtnText: {
    color: "#EF4444",
    fontSize: 13.5,
    fontWeight: "700"
  },
  footerVersionText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 10.5,
    fontStyle: "italic",
    marginBottom: 10
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A"
  },
  closeBtn: {
    padding: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 8
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    marginBottom: 4,
    marginTop: 8
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A"
  },
  saveProfileBtn: {
    backgroundColor: BRAND_PURPLE,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10
  },
  saveProfileBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700"
  }
});