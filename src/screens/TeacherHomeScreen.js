import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Video,
  ChevronRight,
  TrendingUp,
  UserCheck
} from "lucide-react-native";

import { apiFetch } from "../services/api";

const BRAND_PURPLE = "#8547FB";
const BRAND_PURPLE_LIGHT = "rgba(133, 71, 251, 0.08)";
const BRAND_PURPLE_BORDER = "rgba(133, 71, 251, 0.22)";

export default function TeacherHomeScreen({ setScreen }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Educator Profile & Online Switch States
  const [teacherName, setTeacherName] = useState("Faculty Member");
  const [isAvailableOnline, setIsAvailableOnline] = useState(false);

  // Live Database Metrics
  const [stats, setStats] = useState({
    today_classes: 0,
    pending_requests: 0,
    month_earnings: 0,
    rating: 4.9
  });

  // Live Lists from Database
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchTeacherHomeData();
  }, []);

  // 📥 Live Data Fetcher strictly from Database
  const fetchTeacherHomeData = async () => {
    try {
      // 1. Fetch Teacher Stats & Profile from DB
      const dashRes = await apiFetch("/teacher/dashboard");
      if (dashRes && dashRes.success) {
        if (dashRes.profile) {
          setTeacherName(dashRes.profile.full_name || dashRes.profile.name || "Faculty Member");
          setIsAvailableOnline(Boolean(dashRes.profile.available_online));
        }

        if (dashRes.stats) {
          setStats({
            today_classes: dashRes.stats.total_bookings || 0,
            pending_requests: dashRes.stats.pending_requests || 0,
            month_earnings: parseFloat(dashRes.stats.total_earnings) || 0,
            rating: parseFloat(dashRes.stats.rating) || 4.9
          });
        }
      }

      // 2. Fetch All Bookings & Requests from DB
      const bookingsRes = await apiFetch("/teacher/bookings");
      if (bookingsRes && bookingsRes.success && Array.isArray(bookingsRes.bookings)) {
        const all = bookingsRes.bookings;

        // Pending Bookings
        const pending = all.filter((b) => b.status === "pending");
        setPendingRequests(pending);

        // Confirmed / Upcoming Sessions
        const confirmed = all.filter((b) => b.status === "confirmed");
        setUpcomingClasses(confirmed);
      } else {
        setPendingRequests([]);
        setUpcomingClasses([]);
      }
    } catch (error) {
      console.error("Teacher Home Load Error:", error);
      setPendingRequests([]);
      setUpcomingClasses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTeacherHomeData();
  }, []);

  // 🔄 Toggle Online Availability in Database
  const handleToggleOnline = async (val) => {
    setIsAvailableOnline(val);
    try {
      await apiFetch("/teacher/profile", {
        method: "PUT",
        body: JSON.stringify({ available_online: val ? 1 : 0 })
      });
    } catch (e) {
      console.log("Toggle status sync error:", e);
    }
  };

  // ✅ Accept Booking Request in Database
  const handleAcceptRequest = async (reqId) => {
    try {
      const res = await apiFetch("/teacher/booking/status", {
        method: "POST",
        body: JSON.stringify({
          booking_id: reqId,
          status: "confirmed"
        })
      });

      if (res && res.success) {
        Alert.alert("🎉 Request Accepted", "The session has been added to your schedule.");
        fetchTeacherHomeData();
      } else {
        Alert.alert("Notice", res?.message || "Could not accept booking.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update booking status.");
    }
  };

  // ❌ Decline Booking Request in Database
  const handleDeclineRequest = async (reqId) => {
    try {
      const res = await apiFetch("/teacher/booking/status", {
        method: "POST",
        body: JSON.stringify({
          booking_id: reqId,
          status: "cancelled"
        })
      });

      if (res && res.success) {
        Alert.alert("Request Declined", "The inquiry has been removed.");
        fetchTeacherHomeData();
      } else {
        Alert.alert("Notice", res?.message || "Could not decline booking.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to decline booking.");
    }
  };

  const getInitials = (name) => {
    if (!name) return "ED";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      
      {/* Top Clean Educator Header (No Upgrade Button / No Student Banner) */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greetingTitle}>Educator Portal 👋</Text>
          <Text style={styles.teacherName}>{teacherName}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileAvatar}
          onPress={() => setScreen("teacher_profile")}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarLetter}>{getInitials(teacherName)}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BRAND_PURPLE]} />}
      >
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={BRAND_PURPLE} />
            <Text style={styles.loaderText}>Syncing live faculty dashboard records...</Text>
          </View>
        ) : (
          <>
            {/* Instant Availability Toggle Card */}
            <View style={styles.availabilityCard}>
              <View style={{ flex: 1 }}>
                <View style={styles.statusDotRow}>
                  <View style={[styles.statusDot, { backgroundColor: isAvailableOnline ? "#10B981" : "#94A3B8" }]} />
                  <Text style={styles.availTitle}>
                    {isAvailableOnline ? "Available for Instant Doubts" : "Currently Offline"}
                  </Text>
                </View>
                <Text style={styles.availSub}>
                  {isAvailableOnline 
                    ? "Students can discover your profile and book live sessions." 
                    : "Turn on switch to start receiving student bookings."}
                </Text>
              </View>
              <Switch
                value={isAvailableOnline}
                onValueChange={handleToggleOnline}
                trackColor={{ false: "#E2E8F0", true: BRAND_PURPLE }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* 📊 Key Stats Metrics Grid */}
            <View style={styles.statsGrid}>
              <TouchableOpacity 
                style={styles.statBox} 
                onPress={() => setScreen("teacher_wallet")}
                activeOpacity={0.8}
              >
                <View style={styles.statIconBox}>
                  <Wallet size={16} color={BRAND_PURPLE} />
                </View>
                <Text style={styles.statValue}>₹{stats.month_earnings.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Total Payout</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.statBox}
                onPress={() => setScreen("teacher_bookings")}
                activeOpacity={0.8}
              >
                <View style={styles.statIconBox}>
                  <Calendar size={16} color={BRAND_PURPLE} />
                </View>
                <Text style={styles.statValue}>{upcomingClasses.length}</Text>
                <Text style={styles.statLabel}>Active Classes</Text>
              </TouchableOpacity>

              <View style={styles.statBox}>
                <View style={styles.statIconBox}>
                  <TrendingUp size={16} color={BRAND_PURPLE} />
                </View>
                <Text style={styles.statValue}>⭐ {stats.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>

            {/* 🔔 Live Pending Student Requests from Database */}
            {pendingRequests.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    New Booking Requests ({pendingRequests.length})
                  </Text>
                </View>

                {pendingRequests.map((req) => (
                  <View key={req.id} style={styles.requestCard}>
                    <View style={styles.reqTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reqStudentName}>{req.student_name || "Student"}</Text>
                        <Text style={styles.reqGrade}>₹{req.amount || 499} • {req.booking_code || "Online Booking"}</Text>
                      </View>
                      <View style={styles.modeBadge}>
                        <Text style={styles.modeBadgeText}>
                          {req.booking_type === "online" ? "🌐 Online" : "📍 Offline"}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.reqSubject}>{req.subject} {req.topic ? `• ${req.topic}` : ""}</Text>
                    <Text style={styles.reqTime}>⏰ Date: {req.scheduled_date} ({req.start_time})</Text>

                    {/* Accept / Decline Action Buttons */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => handleAcceptRequest(req.id)}
                        activeOpacity={0.85}
                      >
                        <CheckCircle2 size={15} color="#FFFFFF" strokeWidth={2.2} />
                        <Text style={styles.acceptBtnText}>Accept Session</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.declineBtn}
                        onPress={() => handleDeclineRequest(req.id)}
                        activeOpacity={0.85}
                      >
                        <XCircle size={15} color="#EF4444" strokeWidth={2.2} />
                        <Text style={styles.declineBtnText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 📅 Confirmed / Scheduled Classes from Database */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Scheduled Classes ({upcomingClasses.length})</Text>
                <TouchableOpacity onPress={() => setScreen("teacher_bookings")}>
                  <Text style={styles.seeAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              {upcomingClasses.length > 0 ? (
                upcomingClasses.map((item) => (
                  <View key={item.id} style={styles.classCard}>
                    <View style={styles.classTimeCircle}>
                      <Clock size={16} color={BRAND_PURPLE} />
                    </View>

                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                      <Text style={styles.classStudent}>{item.student_name || "Student"}</Text>
                      <Text style={styles.classSubject} numberOfLines={1}>{item.subject} {item.topic ? `• ${item.topic}` : ""}</Text>
                      
                      <View style={styles.classMetaRow}>
                        <Text style={styles.classTimeText}>{item.scheduled_date} ({item.start_time})</Text>
                        <Text style={styles.metaDivider}>•</Text>
                        <Text style={styles.classModeText}>
                          {item.booking_type === "online" ? "Virtual Live" : (item.offline_location || "Offline Tuition")}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.launchBtn,
                        item.booking_type === "online" ? { backgroundColor: BRAND_PURPLE } : { backgroundColor: "#0F172A" }
                      ]}
                      onPress={() => {
                        if (item.booking_type === "online") {
                          Alert.alert("Launch Class", `Connecting to classroom for ${item.student_name || "Student"}...`);
                        } else {
                          Alert.alert("Offline Location", item.offline_location || "Home Visit Scheduled");
                        }
                      }}
                      activeOpacity={0.85}
                    >
                      {item.booking_type === "online" ? (
                        <Video size={16} color="#FFFFFF" />
                      ) : (
                        <MapPin size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No confirmed classes scheduled right now.</Text>
                </View>
              )}
            </View>

            {/* Quick Management Links */}
            <View style={styles.quickNavContainer}>
              <TouchableOpacity 
                style={styles.navRow} 
                onPress={() => setScreen("teacher_portal")}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Clock size={16} color={BRAND_PURPLE} />
                  <Text style={styles.navRowTitle}>Live Attendance & Faculty Tools</Text>
                </View>
                <ChevronRight size={16} color="#94A3B8" />
              </TouchableOpacity>

              <View style={styles.navDivider} />

              <TouchableOpacity 
                style={styles.navRow} 
                onPress={() => setScreen("teacher_profile")}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <UserCheck size={16} color={BRAND_PURPLE} />
                  <Text style={styles.navRowTitle}>Public Profile & Subjects Rate Editor</Text>
                </View>
                <ChevronRight size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },
  loaderContainer: {
    paddingVertical: 60,
    alignItems: "center"
  },
  loaderText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 12.5,
    fontWeight: "600"
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0"
  },
  greetingTitle: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "600"
  },
  teacherName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND_PURPLE,
    justifyContent: "center",
    alignItems: "center"
  },
  avatarLetter: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12.5
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90
  },
  availabilityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  statusDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  availTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A"
  },
  availSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  statIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4
  },
  statValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 1
  },
  statLabel: {
    fontSize: 9.5,
    color: "#64748B",
    fontWeight: "600"
  },
  sectionContainer: {
    marginBottom: 14
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 2
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A"
  },
  seeAllText: {
    color: BRAND_PURPLE,
    fontSize: 11.5,
    fontWeight: "700"
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: BRAND_PURPLE_BORDER,
    marginBottom: 8
  },
  reqTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4
  },
  reqStudentName: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A"
  },
  reqGrade: {
    fontSize: 10.5,
    color: "#64748B"
  },
  modeBadge: {
    backgroundColor: BRAND_PURPLE_LIGHT,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6
  },
  modeBadgeText: {
    color: BRAND_PURPLE,
    fontSize: 10,
    fontWeight: "700"
  },
  reqSubject: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 3
  },
  reqTime: {
    fontSize: 10.5,
    color: "#64748B",
    marginBottom: 9
  },
  actionRow: {
    flexDirection: "row",
    gap: 8
  },
  acceptBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: BRAND_PURPLE,
    paddingVertical: 8,
    borderRadius: 9
  },
  acceptBtnText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "700"
  },
  declineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    backgroundColor: "#FEF2F2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#FCA5A5"
  },
  declineBtnText: {
    color: "#EF4444",
    fontSize: 11.5,
    fontWeight: "600"
  },
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 11,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  classTimeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  classStudent: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A"
  },
  classSubject: {
    fontSize: 11,
    color: "#334155"
  },
  classMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2
  },
  classTimeText: {
    fontSize: 10,
    color: BRAND_PURPLE,
    fontWeight: "600"
  },
  metaDivider: {
    fontSize: 9,
    color: "#94A3B8",
    marginHorizontal: 3
  },
  classModeText: {
    fontSize: 10,
    color: "#64748B"
  },
  launchBtn: {
    padding: 9,
    borderRadius: 9
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 11.5,
    fontStyle: "italic"
  },
  quickNavContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 4
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14
  },
  navRowTitle: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#0F172A"
  },
  navDivider: {
    height: 1,
    backgroundColor: "#F1F5F9"
  }
});