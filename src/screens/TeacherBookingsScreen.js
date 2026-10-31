import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  XCircle,
  ChevronRight,
  FileText,
  ArrowLeft
} from "lucide-react-native";

import { apiFetch } from "../services/api";

const BRAND_PURPLE = "#8547FB";
const BRAND_PURPLE_LIGHT = "rgba(133, 71, 251, 0.08)";
const BRAND_PURPLE_BORDER = "rgba(133, 71, 251, 0.22)";

export default function TeacherBookingsScreen({ setScreen }) {
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, requests, completed
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Live Lists from Database
  const [upcomingList, setUpcomingList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [completedList, setCompletedList] = useState([]);

  useEffect(() => {
    fetchBookingsFromDb();
  }, []);

  // 📥 1. Fetch All Bookings from DB
  const fetchBookingsFromDb = async () => {
    try {
      const res = await apiFetch("/teacher/bookings");
      if (res && res.success && Array.isArray(res.bookings)) {
        const all = res.bookings;

        // Upcoming (Confirmed)
        setUpcomingList(all.filter((b) => b.status === "confirmed"));

        // Requests (Pending)
        setRequestsList(all.filter((b) => b.status === "pending"));

        // Completed
        setCompletedList(all.filter((b) => b.status === "completed"));
      }
    } catch (error) {
      console.error("Fetch Bookings Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookingsFromDb();
  }, []);

  // ✅ 2. Accept Booking Request
  const handleAcceptRequest = async (id) => {
    try {
      const res = await apiFetch("/teacher/booking/status", {
        method: "POST",
        body: JSON.stringify({
          booking_id: id,
          status: "confirmed"
        })
      });

      if (res && res.success) {
        Alert.alert("🎉 Request Accepted", "The session has been added to your upcoming calendar.");
        fetchBookingsFromDb();
      } else {
        Alert.alert("Notice", res?.message || "Could not accept booking.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update booking status.");
    }
  };

  // ❌ 3. Decline Booking Request
  const handleDeclineRequest = async (id) => {
    try {
      const res = await apiFetch("/teacher/booking/status", {
        method: "POST",
        body: JSON.stringify({
          booking_id: id,
          status: "cancelled"
        })
      });

      if (res && res.success) {
        Alert.alert("Request Declined", "The student has been notified.");
        fetchBookingsFromDb();
      } else {
        Alert.alert("Notice", res?.message || "Could not decline booking.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to decline booking.");
    }
  };

  // 🚫 4. Cancel Scheduled Class
  const handleCancelSession = (id) => {
    Alert.alert(
      "Cancel Session",
      "Are you sure you want to cancel this scheduled class? The fee will be refunded to the student.",
      [
        { text: "No, Keep Class", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await apiFetch("/teacher/booking/status", {
                method: "POST",
                body: JSON.stringify({
                  booking_id: id,
                  status: "cancelled"
                })
              });

              if (res && res.success) {
                Alert.alert("Session Cancelled", "The slot has been reopened in your calendar.");
                fetchBookingsFromDb();
              }
            } catch (error) {
              Alert.alert("Error", "Failed to cancel session.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      
      {/* Native Clean Header with Back Button */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("teacher_home")}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consultation Bookings</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Segmented Filter Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "upcoming" && styles.tabBtnActive]}
          onPress={() => setActiveTab("upcoming")}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === "upcoming" && styles.tabTextActive]}>
            Upcoming ({upcomingList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "requests" && styles.tabBtnActive]}
          onPress={() => setActiveTab("requests")}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === "requests" && styles.tabTextActive]}>
            Requests ({requestsList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "completed" && styles.tabBtnActive]}
          onPress={() => setActiveTab("completed")}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === "completed" && styles.tabTextActive]}>
            Completed ({completedList.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BRAND_PURPLE]} />}
      >
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color={BRAND_PURPLE} />
            <Text style={styles.loaderText}>Syncing consultation bookings...</Text>
          </View>
        ) : (
          <>
            {/* TAB 1: UPCOMING SESSIONS */}
            {activeTab === "upcoming" && (
              <>
                {upcomingList.length > 0 ? (
                  upcomingList.map((item) => (
                    <View key={item.id} style={styles.bookingCard}>
                      <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.studentName}>{item.student_name || "Student"}</Text>
                          <Text style={styles.classGrade}>Booking: {item.booking_code || "Confirmed"}</Text>
                        </View>
                        <View style={styles.modeBadge}>
                          <Text style={styles.modeBadgeText}>
                            {item.booking_type === "online" ? "🌐 1-on-1 Online" : "📍 Offline"}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.subjectText}>{item.subject} {item.topic ? `• ${item.topic}` : ""}</Text>

                      {/* Date & Time */}
                      <View style={styles.metaRow}>
                        <Clock size={13} color={BRAND_PURPLE} />
                        <Text style={styles.metaText}>
                          Date: {item.scheduled_date} • {item.start_time} - {item.end_time}
                        </Text>
                      </View>

                      {item.booking_type !== "online" && (
                        <View style={styles.metaRow}>
                          <MapPin size={13} color="#64748B" />
                          <Text style={styles.metaText} numberOfLines={1}>
                            {item.offline_location || "Home Visit Scheduled"}
                          </Text>
                        </View>
                      )}

                      <View style={styles.divider} />

                      {/* Primary Action Buttons */}
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={[
                            styles.launchPrimaryBtn,
                            item.booking_type === "online" ? { backgroundColor: BRAND_PURPLE } : { backgroundColor: "#0F172A" }
                          ]}
                          onPress={() => {
                            if (item.booking_type === "online") {
                              Alert.alert("Live Class", `Launching live session bridge for ${item.student_name || "Student"}...`);
                            } else {
                              Alert.alert("Tuition Location", item.offline_location || "Direct Offline Location");
                            }
                          }}
                          activeOpacity={0.88}
                        >
                          {item.booking_type === "online" ? (
                            <>
                              <Video size={15} color="#FFFFFF" />
                              <Text style={styles.launchBtnText}>Launch Live Class</Text>
                            </>
                          ) : (
                            <>
                              <MapPin size={15} color="#FFFFFF" />
                              <Text style={styles.launchBtnText}>Open Location</Text>
                            </>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => handleCancelSession(item.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyStateCard}>
                    <Calendar size={36} color="#CBD5E1" />
                    <Text style={styles.emptyTitle}>No Upcoming Classes</Text>
                    <Text style={styles.emptySub}>Your schedule is currently clear for upcoming dates.</Text>
                  </View>
                )}
              </>
            )}

            {/* TAB 2: INCOMING REQUESTS */}
            {activeTab === "requests" && (
              <>
                {requestsList.length > 0 ? (
                  requestsList.map((req) => (
                    <View key={req.id} style={[styles.bookingCard, { borderColor: BRAND_PURPLE_BORDER }]}>
                      <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.studentName}>{req.student_name || "Student"}</Text>
                          <Text style={styles.classGrade}>₹{req.amount} • {req.booking_code || "Inquiry"}</Text>
                        </View>
                        <View style={styles.modeBadge}>
                          <Text style={styles.modeBadgeText}>
                            {req.booking_type === "online" ? "🌐 Online" : "📍 Offline"}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.subjectText}>{req.subject} {req.topic ? `• ${req.topic}` : ""}</Text>

                      <View style={styles.metaRow}>
                        <Clock size={13} color={BRAND_PURPLE} />
                        <Text style={styles.metaText}>
                          Requested Date: {req.scheduled_date} ({req.start_time})
                        </Text>
                      </View>

                      {req.topic && (
                        <View style={styles.noteBox}>
                          <Text style={styles.noteText}>"{req.topic}"</Text>
                        </View>
                      )}

                      <View style={styles.divider} />

                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={styles.acceptPrimaryBtn}
                          onPress={() => handleAcceptRequest(req.id)}
                          activeOpacity={0.88}
                        >
                          <CheckCircle2 size={15} color="#FFFFFF" />
                          <Text style={styles.acceptBtnText}>Accept Booking</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.declineSecondaryBtn}
                          onPress={() => handleDeclineRequest(req.id)}
                          activeOpacity={0.7}
                        >
                          <XCircle size={15} color="#EF4444" />
                          <Text style={styles.declineBtnText}>Decline</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyStateCard}>
                    <CheckCircle2 size={36} color="#CBD5E1" />
                    <Text style={styles.emptyTitle}>All Caught Up!</Text>
                    <Text style={styles.emptySub}>No pending booking requests right now.</Text>
                  </View>
                )}
              </>
            )}

            {/* TAB 3: COMPLETED SESSIONS */}
            {activeTab === "completed" && (
              <>
                {completedList.length > 0 ? (
                  completedList.map((comp) => (
                    <View key={comp.id} style={styles.completedCard}>
                      <View style={styles.completedHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.studentName}>{comp.student_name || "Student"}</Text>
                          <Text style={styles.classGrade}>Session Date: {comp.scheduled_date}</Text>
                        </View>
                        <View style={styles.feeCreditedBadge}>
                          <Text style={styles.feeCreditedText}>+ ₹{comp.amount} Credited</Text>
                        </View>
                      </View>

                      <Text style={styles.subjectText}>{comp.subject}</Text>

                      <View style={styles.completedBottomRow}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <CheckCircle2 size={13} color="#10B981" />
                          <Text style={styles.completedStatus}>100% Completed</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.viewNotesBtn}
                          onPress={() => Alert.alert("Session Record", `Booking Code: ${comp.booking_code}\nPayment: Settled`)}
                        >
                          <FileText size={13} color={BRAND_PURPLE} />
                          <Text style={styles.viewNotesText}>Details</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyStateCard}>
                    <FileText size={36} color="#CBD5E1" />
                    <Text style={styles.emptyTitle}>No Completed Sessions</Text>
                    <Text style={styles.emptySub}>Past session history and settled payouts will appear here.</Text>
                  </View>
                )}
              </>
            )}
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  tabBtnActive: {
    backgroundColor: BRAND_PURPLE,
    borderColor: BRAND_PURPLE
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B"
  },
  tabTextActive: {
    color: "#FFFFFF"
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6
  },
  studentName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A"
  },
  classGrade: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1
  },
  modeBadge: {
    backgroundColor: BRAND_PURPLE_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7
  },
  modeBadgeText: {
    color: BRAND_PURPLE,
    fontSize: 10.5,
    fontWeight: "700"
  },
  subjectText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginVertical: 2
  },
  metaText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500"
  },
  noteBox: {
    backgroundColor: "#F8FAFC",
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: BRAND_PURPLE
  },
  noteText: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#475569"
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center"
  },
  launchPrimaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10
  },
  launchBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700"
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  cancelBtnText: {
    color: "#EF4444",
    fontSize: 11.5,
    fontWeight: "600"
  },
  acceptPrimaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: BRAND_PURPLE,
    paddingVertical: 9,
    borderRadius: 10
  },
  acceptBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700"
  },
  declineSecondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5"
  },
  declineBtnText: {
    color: "#EF4444",
    fontSize: 11.5,
    fontWeight: "600"
  },
  completedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  completedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4
  },
  feeCreditedBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  feeCreditedText: {
    color: "#059669",
    fontSize: 11,
    fontWeight: "800"
  },
  completedBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6
  },
  completedStatus: {
    fontSize: 10.5,
    color: "#059669",
    fontWeight: "700"
  },
  viewNotesBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: BRAND_PURPLE_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  viewNotesText: {
    fontSize: 11,
    color: BRAND_PURPLE,
    fontWeight: "700"
  },
  emptyStateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 20
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 10
  },
  emptySub: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4
  }
});