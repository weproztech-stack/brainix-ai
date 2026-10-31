import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  StyleSheet,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Star, Video, MapPin, Calendar, Search, CheckCircle, AlertCircle, X, Crown, Sparkles, ShieldCheck } from "lucide-react-native";

import Header from "../components/Header";
import BottomTabs from "../components/BottomTabs";
import { apiFetch } from "../services/api";

const BRAND_PURPLE = "#6C4DFF";
const BRAND_PURPLE_LIGHT = "rgba(108, 77, 255, 0.08)";

export default function ConsultTeacherScreen({ setScreen }) {
  const [mode, setMode] = useState("online"); // 'online' | 'offline'
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");

  // Pro Subscription States
  const [isPro, setIsPro] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  // Booking & Payment Modal States
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Branded Popup Modal States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'success' });

  const showAlert = (title, message, type = 'success') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  useEffect(() => {
    checkProAndFetchTeachers();
  }, [mode, selectedSubject]);

  const checkProAndFetchTeachers = async () => {
    setLoading(true);
    try {
      let proActive = false;
      const storedUser = await AsyncStorage.getItem("userData");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.isPro === true || parsed?.planName === 'PRO MEMBER' || parsed?.is_pro === true) {
          proActive = true;
        }
      }

      const resProfile = await apiFetch("/auth/profile", { method: "GET" });
      if (resProfile && resProfile.success) {
        const profile = resProfile.user || resProfile.profile;
        if (profile && (profile.isPro === true || profile.planName === 'PRO MEMBER' || profile.plan_status === 'active' || profile.is_pro === true)) {
          proActive = true;
        }
      }

      setIsPro(proActive);
      if (!proActive) {
        setShowProModal(true);
        setLoading(false);
        return;
      }

      let endpoint = `/teacher/list?mode=${mode}`;
      if (selectedSubject && selectedSubject !== "All") {
        endpoint += `&subject=${encodeURIComponent(selectedSubject.trim())}`;
      }

      const res = await apiFetch(endpoint);
      if (res && res.success) {
        setTeachers(res.teachers || res.data || []);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStudentFee = (teacher) => {
    const baseRate = mode === "offline" 
      ? (teacher.offline_rate || teacher.hourly_rate || 499) 
      : (teacher.online_rate || teacher.hourly_rate || 499);
    return Math.round(baseRate * 1.30);
  };

  const filteredTeachers = teachers.filter((t) => {
    const nameMatch = t.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const subjectMatch = t.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || subjectMatch;
  });

  const handleOpenBookingModal = (teacher) => {
    if (!isPro) {
      setShowProModal(true);
      return;
    }
    setSelectedTeacher(teacher);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedTeacher) return;
    const studentFee = calculateStudentFee(selectedTeacher);

    setBookingLoading(true);
    try {
      const orderRes = await apiFetch("/payment/create-order", {
        method: "POST",
        body: JSON.stringify({
          teacher_id: selectedTeacher.id,
          plan_amount: studentFee,
          booking_type: mode,
          subject: selectedTeacher.subject
        })
      });

      if (orderRes && orderRes.success) {
        const orderId = orderRes.order_id || `order_${Date.now()}`;
        await confirmBookingInDatabase(orderId);
      } else {
        setBookingLoading(false);
        showAlert("Payment Failed", orderRes?.message || "Could not initialize gateway session.", "error");
      }
    } catch (error) {
      setBookingLoading(false);
      console.error("Booking error:", error);
      showAlert("Connection Error", "Failed to connect to secure payment gateway.", "error");
    }
  };

  const confirmBookingInDatabase = async (orderId) => {
    try {
      const studentFee = calculateStudentFee(selectedTeacher);
      const confirmRes = await apiFetch("/teacher/booking/confirm", {
        method: "POST",
        body: JSON.stringify({
          teacher_id: selectedTeacher.id,
          booking_type: mode,
          scheduled_date: new Date().toISOString().split('T')[0],
          start_time: "17:00:00",
          end_time: "18:00:00",
          amount: studentFee,
          subject: selectedTeacher.subject || "General",
          topic: "1-on-1 Consultation & Doubt Solving",
          order_id: orderId
        })
      });

      setShowBookingModal(false);
      setBookingLoading(false);

      if (confirmRes && confirmRes.success) {
        showAlert(
          "🎉 Booking Confirmed!",
          `Your session with ${selectedTeacher.name} has been successfully booked.\nBooking Code: ${confirmRes.booking_code}\nThe teacher has been notified.`,
          "success"
        );
      } else {
        showAlert("Notice", confirmRes?.message || "Payment processed but booking registration failed.", "error");
      }
    } catch (err) {
      setBookingLoading(false);
      setShowBookingModal(false);
      showAlert("Error", "Failed to register booking in database.", "error");
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <Header 
        title="Consult Expert Teacher" 
        onBack={() => setScreen("home")} 
        setScreen={setScreen}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Search size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by teacher name or subject..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Mode Selector Toggle: Online vs Offline */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === "online" && styles.activeToggleBtn]}
            onPress={() => setMode("online")}
            activeOpacity={0.8}
          >
            <Video size={16} color={mode === "online" ? "#FFFFFF" : "#64748B"} style={{ marginRight: 6 }} />
            <Text style={[styles.toggleText, mode === "online" && styles.activeToggleText]}>
              1-on-1 Online Class
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, mode === "offline" && styles.activeToggleBtn]}
            onPress={() => setMode("offline")}
            activeOpacity={0.8}
          >
            <MapPin size={16} color={mode === "offline" ? "#FFFFFF" : "#64748B"} style={{ marginRight: 6 }} />
            <Text style={[styles.toggleText, mode === "offline" && styles.activeToggleText]}>
              Offline / Home Tutor
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Categories Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {["All", "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"].map((subj) => (
            <TouchableOpacity
              key={subj}
              style={[styles.filterChip, selectedSubject === subj && styles.activeFilterChip]}
              onPress={() => setSelectedSubject(subj)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, selectedSubject === subj && styles.activeFilterChipText]}>
                {subj}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionHeaderTitle}>AVAILABLE VERIFIED EDUCATORS ({filteredTeachers.length})</Text>

        {/* Teachers Cards List or Loading / Empty State */}
        {loading ? (
          <ActivityIndicator size="large" color={BRAND_PURPLE} style={{ marginVertical: 40 }} />
        ) : filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => {
            const displayFee = calculateStudentFee(teacher);
            return (
              <View key={teacher.id || teacher._id} style={styles.teacherCard}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image 
                    source={{ uri: teacher.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" }} 
                    style={styles.teacherAvatar} 
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.teacherName}>{teacher.name}</Text>
                    <Text style={styles.teacherSubject}>{teacher.subject || "Expert Educator"}</Text>
                    
                    <View style={styles.metaRow}>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.ratingText}>{teacher.rating || "4.8"} ({teacher.reviews || "120"})</Text>
                      <Text style={styles.dotSeparator}>•</Text>
                      <Text style={styles.expText}>{teacher.experience_years ? `${teacher.experience_years}+ Years Exp.` : "Experienced"}</Text>
                    </View>

                    {teacher.location && (
                      <Text style={styles.locationText}>📍 {teacher.location}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.feeLabel}>Student Fee ({mode === "offline" ? "Offline" : "Online"})</Text>
                    <Text style={styles.feeValue}>₹{displayFee} <Text style={styles.feeUnit}>/ session</Text></Text>
                  </View>

                  <TouchableOpacity
                    style={styles.bookBtn}
                    onPress={() => handleOpenBookingModal(teacher)}
                    activeOpacity={0.8}
                  >
                    <Calendar size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.bookBtnText}>Book Slot</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No verified educators available for this filter right now.</Text>
          </View>
        )}

        <Text style={styles.footnote}>Verified expert tutors available 24/7 on Brainix AI</Text>
      </ScrollView>

      {/* Booking Confirmation Bottom Sheet / Modal */}
      <Modal visible={showBookingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>Confirm Consultation</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedTeacher && (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubText}>
                  You are booking a session with <Text style={{ fontWeight: "800", color: "#0F172A" }}>{selectedTeacher.name}</Text>.
                </Text>
                
                <View style={styles.summaryBox}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subject</Text>
                    <Text style={styles.summaryVal}>{selectedTeacher.subject || "General"}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Mode</Text>
                    <Text style={styles.summaryVal}>{mode === "online" ? "Online Live Class" : "Offline Home Visit"}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Payable</Text>
                    <Text style={[styles.summaryVal, { color: BRAND_PURPLE, fontWeight: "800" }]}>
                      ₹{calculateStudentFee(selectedTeacher)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.confirmPayBtn, bookingLoading && { opacity: 0.7 }]}
                  onPress={handleConfirmBooking}
                  disabled={bookingLoading}
                  activeOpacity={0.85}
                >
                  {bookingLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.confirmPayText}>
                      Pay ₹{calculateStudentFee(selectedTeacher)} via Cashfree
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Professional Branded Popup Modal */}
      <Modal transparent visible={alertVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.alertCard}>
            <View style={[styles.iconCircle, { backgroundColor: alertConfig.type === 'error' ? '#FEF2F2' : '#ECFDF5' }]}>
              {alertConfig.type === 'error' ? (
                <AlertCircle size={30} color="#EF4444" />
              ) : (
                <CheckCircle size={30} color="#059669" />
              )}
            </View>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <TouchableOpacity 
              style={styles.alertBtn} 
              onPress={() => {
                setAlertVisible(false);
                if (alertConfig.title.includes("Booking Confirmed")) {
                  setScreen("history");
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.alertBtnText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🌟 PRO UPGRADE MODAL */}
      <Modal visible={showProModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.proModalCard}>
            <TouchableOpacity 
              style={styles.modalCloseBtn} 
              onPress={() => {
                setShowProModal(false);
                setScreen("home");
              }}
              activeOpacity={0.7}
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.crownCircle}>
              <Crown size={28} color={BRAND_PURPLE} strokeWidth={2.5} />
            </View>

            <Text style={styles.proModalTitle}>Pro Membership Required</Text>
            <Text style={styles.proModalDesc}>
              Access to Expert Teacher Consultations and 1-on-1 tutoring sessions is exclusive to <Text style={{ fontWeight: "800", color: "#0F172A" }}>Brainix PRO</Text> members.
            </Text>

            <TouchableOpacity
              style={styles.proUpgradeActionBtn}
              onPress={() => {
                setShowProModal(false);
                setScreen("premium");
              }}
              activeOpacity={0.85}
            >
              <Sparkles size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.proUpgradeActionText}>Upgrade to PRO Now</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                setShowProModal(false);
                setScreen("home");
              }}
              style={{ marginTop: 12, paddingVertical: 6 }}
            >
              <Text style={{ fontSize: 12.5, fontWeight: "600", color: "#64748B" }}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomTabs active="consult" setScreen={setScreen} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 12, height: 46, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 13, color: "#0F172A", fontWeight: "600" },
  toggleContainer: { flexDirection: "row", backgroundColor: "#E2E8F0", borderRadius: 14, padding: 4, marginBottom: 12 },
  toggleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 10 },
  activeToggleBtn: { backgroundColor: BRAND_PURPLE },
  toggleText: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  activeToggleText: { color: "#FFFFFF", fontWeight: "700" },
  filterScroll: { marginBottom: 14 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0", marginRight: 8 },
  activeFilterChip: { backgroundColor: BRAND_PURPLE, borderColor: BRAND_PURPLE },
  filterChipText: { fontSize: 11.5, fontWeight: "700", color: "#64748B" },
  activeFilterChipText: { color: "#FFFFFF" },
  sectionHeaderTitle: { color: "#94A3B8", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 10 },
  teacherCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#E2E8F0", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  teacherAvatar: { width: 60, height: 60, borderRadius: 30 },
  teacherName: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  teacherSubject: { fontSize: 12, color: BRAND_PURPLE, fontWeight: "600", marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: { fontSize: 11, fontWeight: "700", color: "#0F172A", marginLeft: 4 },
  dotSeparator: { marginHorizontal: 6, color: "#94A3B8" },
  expText: { fontSize: 11, color: "#64748B" },
  locationText: { fontSize: 11, color: "#64748B", marginTop: 2 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderColor: "#F1F5F9" },
  feeLabel: { fontSize: 10, color: "#94A3B8" },
  feeValue: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
  feeUnit: { fontSize: 10, color: "#64748B", fontWeight: "500" },
  bookBtn: { flexDirection: "row", alignItems: "center", backgroundColor: BRAND_PURPLE, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  bookBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  emptyBox: { padding: 30, alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0" },
  emptyText: { fontSize: 12.5, color: "#64748B", textAlign: "center" },
  footnote: { textAlign: "center", color: "#94A3B8", fontSize: 11, fontStyle: "italic", marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { width: "100%", maxWidth: 340, backgroundColor: "#FFFFFF", borderRadius: 22, padding: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalHeading: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  modalBody: { marginTop: 4 },
  modalSubText: { fontSize: 13, color: "#64748B", marginBottom: 14, lineHeight: 18 },
  summaryBox: { backgroundColor: "#F8FAFC", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 16, gap: 8 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  summaryVal: { fontSize: 13, color: "#0F172A", fontWeight: "700" },
  confirmPayBtn: { backgroundColor: BRAND_PURPLE, borderRadius: 14, paddingVertical: 14, alignItems: "center", shadowColor: BRAND_PURPLE, shadowOpacity: 0.3, shadowRadius: 8, elevation: 2 },
  confirmPayText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  alertCard: { width: "100%", maxWidth: 320, backgroundColor: "#FFFFFF", borderRadius: 24, padding: 24, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  alertTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A", textAlign: "center", marginBottom: 8 },
  alertMessage: { fontSize: 13.5, color: "#64748B", textAlign: "center", marginBottom: 20, lineHeight: 20 },
  alertBtn: { width: "100%", backgroundColor: BRAND_PURPLE, borderRadius: 14, paddingVertical: 14, alignItems: "center", shadowColor: BRAND_PURPLE, shadowOpacity: 0.3, shadowRadius: 8, elevation: 2 },
  alertBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  // Pro Modal Styles
  proModalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8
  },
  modalCloseBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center"
  },
  crownCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(108, 77, 255, 0.2)"
  },
  proModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center"
  },
  proModalDesc: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20
  },
  proUpgradeActionBtn: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: BRAND_PURPLE,
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BRAND_PURPLE,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3
  },
  proUpgradeActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3
  }
});