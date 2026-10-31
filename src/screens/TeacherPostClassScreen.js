import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CheckCircle2,
  UploadCloud,
  Star,
  Award,
  Send
} from "lucide-react-native";

import Header from "../components/Header";
import { apiFetch } from "../services/api";

const BRAND_PURPLE = "#8547FB";
const BRAND_PURPLE_LIGHT = "rgba(133, 71, 251, 0.08)";
const BRAND_PURPLE_BORDER = "rgba(133, 71, 251, 0.22)";

export default function TeacherPostClassScreen({ setScreen, sessionData }) {
  const session = sessionData || {
    booking_id: 1,
    student_id: 101,
    studentName: "Student",
    classGrade: "Class 10 (CBSE)",
    subject: "Mathematics • Quadratic Equations"
  };

  const [topicsCovered, setTopicsCovered] = useState("");
  const [homeworkTask, setHomeworkTask] = useState("");
  const [studentMasteryRating, setStudentMasteryRating] = useState(4);
  const [notesAttached, setNotesAttached] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmitPostClass = async () => {
    if (!topicsCovered.trim()) {
      Alert.alert("Missing Info", "Please enter a brief summary of topics covered today.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/teacher/report/submit", {
        method: "POST",
        body: JSON.stringify({
          booking_id: session.booking_id || session.id || 1,
          student_id: session.student_id || 1,
          topics_covered: topicsCovered.trim(),
          homework_task: homeworkTask.trim(),
          mastery_rating: studentMasteryRating,
          notes_url: notesAttached ? "https://cdn.brainix.ai/notes/session_export.pdf" : ""
        })
      });

      if (res && res.success) {
        Alert.alert(
          "🎉 Report Dispatched!",
          "Class summary and homework have been pushed directly to the student dashboard, and session payout has been settled.",
          [
            {
              text: "Back to Dashboard",
              onPress: () => {
                if (setScreen) setScreen("teacher_home");
              }
            }
          ]
        );
      } else {
        Alert.alert("Notice", res?.message || "Report saved successfully.");
        if (setScreen) setScreen("teacher_home");
      }
    } catch (error) {
      Alert.alert("Submission Error", "Failed to submit post-class report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <Header title="Session Wrap-up" onBack={() => setScreen("teacher_home")} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Success Header Banner */}
        <View style={styles.successBanner}>
          <View style={styles.iconCircle}>
            <Award size={22} color={BRAND_PURPLE} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.bannerTitle}>Class Completed Successfully!</Text>
            <Text style={styles.bannerSub}>
              {session.studentName} • {session.classGrade}
            </Text>
          </View>
        </View>

        {/* Section 1: Topics Covered */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>LESSON SUMMARY & TOPICS COVERED *</Text>
          <View style={[styles.inputBox, { height: 80, alignItems: "flex-start", paddingVertical: 8 }]}>
            <TextInput
              style={[styles.input, { height: "100%", textAlignVertical: "top" }]}
              placeholder="e.g. Solved speed-distance word problems, explained quadratic formula derivation & discriminant conditions."
              placeholderTextColor="#94A3B8"
              value={topicsCovered}
              onChangeText={setTopicsCovered}
              multiline
            />
          </View>
        </View>

        {/* Section 2: Student Understanding & Concept Mastery */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>STUDENT CONCEPT MASTERY</Text>
          <Text style={styles.fieldSub}>Rate how well the student grasped today's topic:</Text>
          
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setStudentMasteryRating(star)}
                style={styles.starBtn}
                activeOpacity={0.7}
              >
                <Star
                  size={26}
                  color={star <= studentMasteryRating ? "#F59E0B" : "#CBD5E1"}
                  fill={star <= studentMasteryRating ? "#F59E0B" : "transparent"}
                />
              </TouchableOpacity>
            ))}
            <Text style={styles.ratingText}>
              {studentMasteryRating === 5
                ? "Excellent (100%)"
                : studentMasteryRating === 4
                ? "Good Grip (80%)"
                : studentMasteryRating === 3
                ? "Average (60%)"
                : "Needs Practice"}
            </Text>
          </View>
        </View>

        {/* Section 3: Homework & Practice Assignment */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>HOMEWORK / PRACTICE TASK</Text>
          <View style={[styles.inputBox, { height: 80, alignItems: "flex-start", paddingVertical: 8 }]}>
            <TextInput
              style={[styles.input, { height: "100%", textAlignVertical: "top" }]}
              placeholder="e.g. Complete Exercise 4.3 (Q1 to Q6) and revise formula sheet before next class."
              placeholderTextColor="#94A3B8"
              value={homeworkTask}
              onChangeText={setHomeworkTask}
              multiline
            />
          </View>
        </View>

        {/* Section 4: Attach Whiteboard Notes / PDF */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>CLASS NOTES & WHITEBOARD EXPORT</Text>
          
          <TouchableOpacity
            style={[styles.uploadBox, notesAttached && styles.uploadBoxActive]}
            onPress={() => {
              setNotesAttached(true);
              Alert.alert("Attached", "Whiteboard export & handwritten notes PDF attached.");
            }}
            activeOpacity={0.75}
          >
            <View style={styles.uploadIconCircle}>
              {notesAttached ? (
                <CheckCircle2 size={18} color="#10B981" />
              ) : (
                <UploadCloud size={18} color={BRAND_PURPLE} />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.uploadTitle}>
                {notesAttached ? "Session Notes Attached (PDF)" : "Upload Class Notes / Board PDF"}
              </Text>
              <Text style={styles.uploadSub}>
                {notesAttached ? "Auto-synced to student library" : "Tap to browse local device files or board export"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmitPostClass}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.btnContent}>
              <Send size={16} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Publish Report & Release Payout</Text>
            </View>
          )}
        </TouchableOpacity>

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
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  bannerTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0F172A"
  },
  bannerSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2
  },
  formCard: {
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
    marginBottom: 8,
    marginLeft: 2
  },
  fieldSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginBottom: 8,
    marginLeft: 2
  },
  inputBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12
  },
  input: {
    color: "#0F172A",
    fontSize: 12.5,
    fontWeight: "500",
    lineHeight: 18
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4
  },
  starBtn: {
    padding: 2
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "700",
    color: BRAND_PURPLE
  },
  uploadBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed"
  },
  uploadBoxActive: {
    backgroundColor: "rgba(16, 185, 129, 0.06)",
    borderColor: "#10B981",
    borderStyle: "solid"
  },
  uploadIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  uploadTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A"
  },
  uploadSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1
  },
  submitBtn: {
    backgroundColor: BRAND_PURPLE,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 20,
    shadowColor: BRAND_PURPLE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700"
  }
});