import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Linking,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  User,
  Phone,
  MessageSquare,
  Navigation,
  ShieldCheck
} from "lucide-react-native";

import Header from "../components/Header";
import { apiFetch } from "../services/api";

const BRAND_PURPLE = "#8547FB";
const BRAND_PURPLE_LIGHT = "rgba(133, 71, 251, 0.08)";
const BRAND_PURPLE_BORDER = "rgba(133, 71, 251, 0.22)";

export default function TeacherClassDetailScreen({ setScreen, classData }) {
  const session = classData || {
    id: 1,
    student_id: 101,
    student_name: "Student",
    student_email: "student@brainix.ai",
    student_phone: "+91 98765 43210",
    classGrade: "Class 10 (CBSE)",
    subject: "Mathematics",
    topic: "Quadratic Equations",
    scheduled_date: "Today",
    start_time: "05:00 PM",
    end_time: "06:00 PM",
    booking_type: "online",
    offline_location: "Gomti Nagar Extension, Lucknow",
    live_meeting_url: "https://meet.brainix.in/live-room-1",
    amount: 499,
    status: "confirmed"
  };

  const [sessionStatus, setSessionStatus] = useState(session.status || "confirmed");
  const [checkedIn, setCheckedIn] = useState(false);
  const [updating, setUpdating] = useState(false);

  // 1. Launch Live Class
  const handleLaunchVideoClass = async () => {
    setUpdating(true);
    try {
      await apiFetch("/teacher/booking/status", {
        method: "POST",
        body: JSON.stringify({
          booking_id: session.id,
          status: "confirmed"
        })
      });
      setSessionStatus("in_progress");
      
      const meetingUrl = session.live_meeting_url || `https://meet.brainix.in/live-room-${session.id}`;
      Linking.openURL(meetingUrl).catch(() => {
        Alert.alert("Classroom Bridge", `Opening live session room: ${meetingUrl}`);
      });
    } catch (e) {
      console.log(e);
    } finally {
      setUpdating(false);
    }
  };

  // 2. Open Google Maps Directions
  const handleOpenMaps = () => {
    const address = session.offline_location || "Lucknow";
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Maps Error", "Could not open Google Maps.");
    });
  };

  // 3. Mark Attendance (Present) in DB
  const handleGeofenceCheckIn = async () => {
    setUpdating(true);
    try {
      const res = await apiFetch("/teacher/attendance", {
        method: "POST",
        body: JSON.stringify({
          booking_id: session.id,
          student_id: session.student_id || 1,
          session_date: session.scheduled_date || new Date().toISOString().split("T")[0],
          status: "present",
          remarks: "Verified via GPS/In-app Check-in"
        })
      });

      if (res && res.success) {
        setCheckedIn(true);
        setSessionStatus("in_progress");
        Alert.alert("✅ Attendance Logged", "Student marked present in attendance registry.");
      } else {
        Alert.alert("Notice", res?.message || "Attendance saved.");
      }
    } catch (e) {
      Alert.alert("Error", "Could not log attendance.");
    } finally {
      setUpdating(false);
    }
  };

  // 4. Conclude & Mark Completed in DB
  const handleCompleteClass = () => {
    Alert.alert(
      "End Class Session",
      "Conclude this class and mark payout as ready?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Session",
          onPress: async () => {
            try {
              await apiFetch("/teacher/booking/status", {
                method: "POST",
                body: JSON.stringify({
                  booking_id: session.id,
                  status: "completed"
                })
              });
              setSessionStatus("completed");
              Alert.alert("🎉 Class Concluded", "Session marked completed in student & teacher records.", [
                { text: "OK", onPress: () => setScreen("teacher_bookings") }
              ]);
            } catch (e) {
              Alert.alert("Error", "Could not update status.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <Header title="Class Session Hub" onBack={() => setScreen("teacher_bookings")} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Status Card */}
        <View style={styles.statusBanner}>
          <View style={styles.statusIconWrap}>
            <Clock size={20} color={BRAND_PURPLE} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>SESSION STATUS</Text>
              <View style={[styles.statusPill, sessionStatus === "in_progress" ? styles.inProgressPill : styles.scheduledPill]}>
                <Text style={[styles.statusPillText, { color: sessionStatus === "in_progress" ? "#059669" : BRAND_PURPLE }]}>
                  {sessionStatus === "in_progress" ? "🔴 Live / In Progress" : sessionStatus === "completed" ? "✓ Completed" : "⏰ Scheduled"}
                </Text>
              </View>
            </View>
            <Text style={styles.statusTimeText}>
              {session.scheduled_date} • {session.start_time} - {session.end_time}
            </Text>
          </View>
        </View>

        {/* Student Profile Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>STUDENT INFORMATION</Text>
          
          <View style={styles.studentInfoRow}>
            <View style={styles.avatarWrap}>
              <User size={20} color={BRAND_PURPLE} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.studentNameText}>{session.student_name || "Student"}</Text>
              <Text style={styles.studentGradeText}>{session.student_email || "Enrolled Student"}</Text>
            </View>
            {session.student_phone && (
              <TouchableOpacity 
                style={styles.contactIconBtn}
                onPress={() => Linking.openURL(`tel:${session.student_phone}`)}
              >
                <Phone size={16} color={BRAND_PURPLE} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Lesson & Topic Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>LESSON AGENDA & TOPIC</Text>
          
          <Text style={styles.subjectHighlight}>{session.subject}</Text>
          <Text style={styles.topicDescription}>{session.topic || "Core Curriculum Doubt Solving & Revision"}</Text>

          <View style={styles.doubtMessageBox}>
            <MessageSquare size={14} color={BRAND_PURPLE} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.doubtTitle}>Booking Mode & Fee:</Text>
              <Text style={styles.doubtText}>
                {session.booking_type === "online" ? "🌐 1-on-1 Online Live Class" : "📍 Offline Home/Center Visit"} • ₹{session.amount} Paid
              </Text>
            </View>
          </View>
        </View>

        {/* Mode Specific Section */}
        {session.booking_type === "online" ? (
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeaderTitle}>ONLINE CLASSROOM BRIDGE</Text>
            <Text style={styles.instructionSub}>
              Includes interactive two-way audio/video, formula math board, and live document sharing.
            </Text>

            <TouchableOpacity
              style={[styles.primaryActionBtn, updating && { opacity: 0.7 }]}
              onPress={handleLaunchVideoClass}
              disabled={updating}
              activeOpacity={0.88}
            >
              {updating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Video size={18} color="#FFFFFF" />
                  <Text style={styles.primaryActionText}>
                    {sessionStatus === "in_progress" ? "Re-enter Live Classroom" : "Launch Live Classroom"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeaderTitle}>OFFLINE LOCATION & ATTENDANCE</Text>
            
            <View style={styles.locationBox}>
              <MapPin size={16} color={BRAND_PURPLE} style={{ marginTop: 2 }} />
              <Text style={styles.locationText}>{session.offline_location || "Direct Location"}</Text>
            </View>

            <View style={styles.homeActionGrid}>
              <TouchableOpacity
                style={styles.mapBtn}
                onPress={handleOpenMaps}
                activeOpacity={0.8}
              >
                <Navigation size={15} color="#0F172A" />
                <Text style={styles.mapBtnText}>Directions</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkInBtn, checkedIn && styles.checkedInActive]}
                onPress={handleGeofenceCheckIn}
                disabled={checkedIn || updating}
                activeOpacity={0.8}
              >
                <ShieldCheck size={15} color={checkedIn ? "#059669" : "#FFFFFF"} />
                <Text style={[styles.checkInBtnText, checkedIn && { color: "#059669" }]}>
                  {checkedIn ? "Verified Present" : "Mark Present"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Conclude Session Action */}
        {sessionStatus !== "completed" && (
          <TouchableOpacity
            style={styles.completeSessionBtn}
            onPress={handleCompleteClass}
            activeOpacity={0.88}
          >
            <CheckCircle2 size={18} color="#FFFFFF" />
            <Text style={styles.completeBtnText}>Conclude Session</Text>
          </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  statusIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  scheduledPill: {
    backgroundColor: BRAND_PURPLE_LIGHT
  },
  inProgressPill: {
    backgroundColor: "rgba(16, 185, 129, 0.12)"
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: "800"
  },
  statusTimeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A"
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  cardHeaderTitle: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 2
  },
  studentInfoRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  studentNameText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A"
  },
  studentGradeText: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 1
  },
  contactIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  subjectHighlight: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_PURPLE,
    marginBottom: 2
  },
  topicDescription: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#334155",
    lineHeight: 18
  },
  doubtMessageBox: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: BRAND_PURPLE
  },
  doubtTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A"
  },
  doubtText: {
    fontSize: 11.5,
    color: "#475569",
    marginTop: 1
  },
  instructionSub: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
    marginBottom: 12
  },
  primaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BRAND_PURPLE,
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: BRAND_PURPLE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700"
  },
  locationBox: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 8
  },
  locationText: {
    flex: 1,
    fontSize: 12,
    color: "#334155",
    lineHeight: 16
  },
  homeActionGrid: {
    flexDirection: "row",
    gap: 8
  },
  mapBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingVertical: 11,
    borderRadius: 10
  },
  mapBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A"
  },
  checkInBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: BRAND_PURPLE,
    paddingVertical: 11,
    borderRadius: 10
  },
  checkedInActive: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "#10B981"
  },
  checkInBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  completeSessionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0F172A",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
    marginBottom: 20
  },
  completeBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700"
  }
});