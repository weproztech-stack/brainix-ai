import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Crown, Sparkles, X, BookOpen, Layers } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "../services/api";

const BRAND_PURPLE = "#6C4DFF";
const BRAND_PURPLE_LIGHT = "rgba(108, 77, 255, 0.08)";

export default function ExamPrepScreen({ setScreen, setSelectedQuestion }) {
  const [isPro, setIsPro] = useState(false);
  const [loadingPro, setLoadingPro] = useState(true);
  const [showProModal, setShowProModal] = useState(false);
  
  const [classesList] = useState([
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"
  ]);
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [questions, setQuestions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    checkUserProStatus();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchQuestionsFromDB(selectedClass);
    }
  }, [selectedClass]);

  const checkUserProStatus = async () => {
    setLoadingPro(true);
    try {
      const cached = await AsyncStorage.getItem("userData");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.isPro === true || parsed?.planName === 'PRO MEMBER' || parsed?.is_pro === true) {
          setIsPro(true);
        }
      }
      const res = await apiFetch("/auth/profile", { method: "GET" });
      if (res && res.success) {
        const user = res.user || res.profile;
        if (user && (user.isPro === true || user.planName === 'PRO MEMBER' || user.plan_status === 'active' || user.is_pro === true)) {
          setIsPro(true);
        }
      }
    } catch (e) {
      console.log("Pro status check error:", e);
    } finally {
      setLoadingPro(false);
    }
  };

  const fetchQuestionsFromDB = async (className) => {
    setLoadingData(true);
    try {
      const res = await apiFetch("/ai/history", { method: "GET" });
      if (res && res.success) {
        const allQuestions = res.history || res.questions || [];
        setQuestions(allQuestions);
      }
    } catch (e) {
      console.log("Failed to fetch questions:", e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleQuestionPress = (item) => {
    if (loadingPro) return;

    if (!isPro) {
      setShowProModal(true);
    } else {
      if (setSelectedQuestion) setSelectedQuestion(item);
      setScreen("solution");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top", "left", "right"]}>
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("home")} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Exam Preparation</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Class Selector Horizontal Bar */}
      <View style={styles.classBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, alignItems: "center" }}>
          {classesList.map((cls) => {
            const isSelected = selectedClass === cls;
            return (
              <TouchableOpacity
                key={cls}
                style={[styles.classChip, isSelected && styles.classChipSelected]}
                onPress={() => setSelectedClass(cls)}
                activeOpacity={0.8}
              >
                <Text style={[styles.classChipText, isSelected && styles.classChipTextSelected]}>{cls}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Questions List Container */}
      {loadingData ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={BRAND_PURPLE} />
          <Text style={{ marginTop: 10, color: "#64748B", fontSize: 13 }}>Loading questions from database...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {questions.length > 0 ? (
            questions.map((item, idx) => (
              <TouchableOpacity key={item.id || idx} style={styles.questionCard} activeOpacity={0.8} onPress={() => handleQuestionPress(item)}>
                <View style={styles.cardIconBox}>
                  <BookOpen size={22} color={BRAND_PURPLE} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.cardTitle}>{item.question_text || item.title || "Practice Question"}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{item.ai_response || item.description || "Tap to view detailed step-by-step solution."}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ padding: 30, alignItems: "center" }}>
              <Layers size={40} color="#CBD5E1" style={{ marginBottom: 12 }} />
              <Text style={{ color: "#64748B", fontSize: 14, textAlign: "center" }}>No questions available in the database right now.</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Pro Membership Required Modal */}
      <Modal visible={showProModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.proModalCard}>
            <TouchableOpacity 
              style={styles.modalCloseBtn} 
              onPress={() => setShowProModal(false)}
              activeOpacity={0.7}
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.crownCircle}>
              <Crown size={28} color={BRAND_PURPLE} strokeWidth={2.5} />
            </View>

            <Text style={styles.proModalTitle}>Pro Membership Required</Text>
            <Text style={styles.proModalDesc}>
              Access to AI Exam Preparation and question banks is exclusive to <Text style={{ fontWeight: "800", color: "#0F172A" }}>Brainix PRO</Text> members.
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
              onPress={() => setShowProModal(false)}
              style={{ marginTop: 12, paddingVertical: 6 }}
            >
              <Text style={{ fontSize: 12.5, fontWeight: "600", color: "#64748B" }}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3
  },
  classBarContainer: {
    height: 60,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    justifyContent: "center"
  },
  classChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  classChipSelected: {
    backgroundColor: BRAND_PURPLE,
    borderColor: BRAND_PURPLE
  },
  classChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B"
  },
  classChipTextSelected: {
    color: "#FFFFFF"
  },
  questionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4
  },
  cardDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
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