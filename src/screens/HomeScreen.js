import React, { useState, useRef, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

import SideDrawer from "../modals/SideDrawer";
import BottomTabs from "../components/BottomTabs";

import { apiFetch } from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { stopSpeaking } from "../utils/voiceAssistant";

const BRAND_PURPLE = "#6C4DFF";
const BRAND_PURPLE_LIGHT = "rgba(108, 77, 255, 0.1)";

const QuickAction = ({ icon, title, onPress }) => {
  return (
    <TouchableOpacity style={styles.quickAction} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={19} color={BRAND_PURPLE} />
      </View>
      <Text style={styles.quickText}>{title}</Text>
    </TouchableOpacity>
  );
};

const FeatureCard = ({ icon, title, onPress }) => {
  return (
    <TouchableOpacity style={styles.featureCard} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={21} color={BRAND_PURPLE} />
      </View>
      <Text style={styles.featureText}>{title}</Text>
      <View style={styles.decorCircle} />
    </TouchableOpacity>
  );
};

export default function HomeScreen({
  setScreen,
  setQuestion,
  setAnswer,
  setSessionId,
  setSelectedMedia,
  onPractice,
  onNotes,
  onPreviousPapers,
  onTabPress
}) {
  const theme = useTheme();

  const [drawer, setDrawer] = useState(false);

  // Backend States with Safe Fallbacks
  const [user, setUser] = useState({ name: "Mohammad Atif", grade: "10-A" });
  const [schoolStats, setSchoolStats] = useState({ attendance: "94%", latest_result: "A+", subject: "Mathematics" });
  const [recentSessions, setRecentSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // 🎙 Voice & Recording States
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    fetchHomeScreenData();
    return () => {
      stopSpeaking();
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const fetchHomeScreenData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      }

      const cachedHistory = await AsyncStorage.getItem("chatHistory");
      if (cachedHistory) {
        setRecentSessions(JSON.parse(cachedHistory).slice(0, 4));
      }

      // Live Profile Fetch
      const profileRes = await apiFetch("/auth/profile");
      if (profileRes && profileRes.success) {
        const fetchedUser = profileRes.user || profileRes.profile || profileRes;
        if (fetchedUser) {
          setUser(fetchedUser);
          await AsyncStorage.setItem("userData", JSON.stringify(fetchedUser));
        }
        if (profileRes.school_stats) {
          setSchoolStats(profileRes.school_stats);
        }
      }

      setLoadingSessions(true);
      let sessionsData = await apiFetch("/ai/sessions");
      if (!sessionsData || !sessionsData.success) {
        sessionsData = await apiFetch("/ai/history");
      }

      if (sessionsData && sessionsData.success) {
        const rawList = sessionsData.sessions || sessionsData.history || sessionsData.data || [];
        if (Array.isArray(rawList) && rawList.length > 0) {
          const formattedSessions = rawList.map((item) => ({
            id: item.id || item._id || Date.now().toString(),
            title: item.title || item.question || item.first_message || "Saved Question",
            date: item.created_at || item.date || "Recent"
          }));

          setRecentSessions(formattedSessions.slice(0, 4));
          await AsyncStorage.setItem("chatHistory", JSON.stringify(formattedSessions));
        }
      }

    } catch (error) {
      console.error("HomeScreen Data Load Error:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  // 📷 DIRECT CAMERA LAUNCH FOR SCAN
  const handleDirectScan = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.status !== "granted") {
        Alert.alert("Permission Required", "Camera access is required to scan questions and documents.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const mediaData = {
          type: "image",
          uri: asset.uri,
          base64: asset.base64 || null
        };
        
        if (setSessionId) setSessionId(null);
        if (setAnswer) setAnswer("");
        if (setQuestion) setQuestion("");
        if (setSelectedMedia) setSelectedMedia(mediaData);
        setScreen("solution");
      }
    } catch (err) {
      console.log("Camera launch error:", err);
      Alert.alert("Error", "Could not open camera.");
    }
  };

  // 🖼️ DIRECT GALLERY LAUNCH FOR UPLOAD
  const handleDirectUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== "granted") {
        Alert.alert("Permission Required", "Gallery access is required to upload documents.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const mediaData = {
          type: "image",
          uri: asset.uri,
          base64: asset.base64 || null
        };

        if (setSessionId) setSessionId(null);
        if (setAnswer) setAnswer("");
        if (setQuestion) setQuestion("");
        if (setSelectedMedia) setSelectedMedia(mediaData);
        setScreen("solution");
      }
    } catch (err) {
      console.log("Gallery launch error:", err);
      Alert.alert("Error", "Could not open photo gallery.");
    }
  };

  // 🎙️ Start Audio Recording with Permission Checks
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission Required", "Microphone access is required for voice queries.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
      Alert.alert("Error", "Could not start audio recording.");
    }
  };

  // 🎙️ Stop Audio Recording & Process Automatically
  const stopRecording = async () => {
    setIsRecording(false);
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        handleTranscribeAndSubmit(uri);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  // ⚡ Silent Conversion & Immediate Submission
  const handleTranscribeAndSubmit = async (audioUri) => {
    setIsTranscribing(true);
    try {
      let base64Audio = "";

      if (FileSystem.readAsStringAsync) {
        base64Audio = await FileSystem.readAsStringAsync(audioUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        const response = await fetch(audioUri);
        const blob = await response.blob();
        base64Audio = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      if (!base64Audio) return;

      const res = await apiFetch("/ai/transcribe", {
        method: "POST",
        body: JSON.stringify({ audio_base64: base64Audio }),
      });

      if (res && res.success && res.text && res.text.trim().length > 0) {
        const transcribedText = res.text.trim();

        const newSessionEntry = {
          id: Date.now().toString(),
          title: transcribedText,
          date: "Just now"
        };
        const updatedSessions = [newSessionEntry, ...recentSessions];
        setRecentSessions(updatedSessions.slice(0, 4));
        await AsyncStorage.setItem("chatHistory", JSON.stringify(updatedSessions));

        if (setSessionId) setSessionId(null);
        if (setSelectedMedia) setSelectedMedia(null);
        if (setQuestion) setQuestion(transcribedText);
        if (setAnswer) setAnswer("");

        setScreen("solution");
      }
    } catch (e) {
      console.error("Silent Audio Transcription Error:", e);
    } finally {
      setIsTranscribing(false);
    }
  };

  // 🚀 Robust Navigation Handler for All Tabs & Buttons (Crash-proof)
  const handleNavigation = (destination) => {
    try {
      if (destination === "home") {
        setScreen("home");
      } else if (destination === "practice") {
        if (onPractice) onPractice();
        else setScreen("practice");
      } else if (destination === "notes") {
        if (onNotes) onNotes();
        else setScreen("notes");
      } else if (destination === "previous_papers") {
        if (onPreviousPapers) onPreviousPapers();
        else setScreen("previous_papers");
      } else if (destination === "teacher_consult") {
        setScreen("teacher_consult");
      } else if (destination === "profile") {
        setScreen("profile");
      } else if (destination === "school") {
        setScreen("school");
      } else if (destination === "notifications") {
        setScreen("notifications");
      } else if (onTabPress) {
        onTabPress(destination);
      } else {
        setScreen(destination);
      }
    } catch (err) {
      console.log("Navigation error:", err);
      setScreen("home");
    }
  };

  // Dynamic Class & Name Display with clean fallbacks
  let rawClass = user?.class_grade || user?.class_name || user?.class || user?.grade || "10-A";
  let formattedClass = String(rawClass).trim();
  if (/^\d+$/.test(formattedClass)) {
    formattedClass = `Class ${formattedClass}`;
  }
  const userClassDisplay = formattedClass;
  const userNameDisplay = user?.name ? user.name.split(" ")[0] : "Mohammad Atif";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7} onPress={() => setDrawer(true)}>
            <Ionicons name="menu" size={25} color="#0F172A" />
          </TouchableOpacity>

          <Text style={styles.schoolName}>Brainix AI</Text>

          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.notification} 
              activeOpacity={0.7}
              onPress={() => handleNavigation("notifications")}
            >
              <Ionicons name="notifications-outline" size={22} color="#0F172A" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileCircle}
              activeOpacity={0.7}
              onPress={() => handleNavigation("profile")}
            >
              <Ionicons name="person" size={19} color="#6C4DFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= CLASS & REAL DB USERNAME ================= */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.classText}>{userClassDisplay}</Text>
          <Text style={styles.welcomeText}>Welcome, {userNameDisplay} 👋</Text>
        </View>

        {/* ================= AI QUESTION BOX ================= */}
        <View style={styles.questionCard}>
          <Text style={styles.questionTitle}>
            What would you like to learn{"\n"}today?
          </Text>

          <TouchableOpacity
            style={styles.searchBox}
            activeOpacity={0.8}
            onPress={() => {
              if (setSessionId) setSessionId(null);
              if (setSelectedMedia) setSelectedMedia(null);
              if (setQuestion) setQuestion("");
              setScreen("solution");
            }}
          >
            <Ionicons name="search-outline" size={21} color="#64748B" />
            <Text style={styles.searchPlaceholder}>
              {isRecording ? "Listening to your voice..." : "Ask a question or upload an image"}
            </Text>
            <View style={styles.sendButton}>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* ================= QUICK ACTIONS (Direct Camera & Gallery Trigger) ================= */}
          <View style={styles.quickActions}>
            <QuickAction icon="keypad-outline" title="Type" onPress={() => { if (setSessionId) setSessionId(null); setScreen("solution"); }} />
            <QuickAction icon="scan-outline" title="Scan" onPress={handleDirectScan} />
            <QuickAction icon="document-outline" title="Upload" onPress={handleDirectUpload} />
            <QuickAction icon={isRecording ? "stop-outline" : "mic-outline"} title={isRecording ? "Stop" : "Voice"} onPress={isRecording ? stopRecording : startRecording} />
          </View>
        </View>

        {/* ================= FEATURES ================= */}
        <View style={styles.featureGrid}>
          <FeatureCard icon="create-outline" title="Practice" onPress={() => handleNavigation("practice")} />
          <FeatureCard icon="document-text-outline" title="Notes" onPress={() => handleNavigation("notes")} />
          <FeatureCard icon="library-outline" title="Previous Papers" onPress={() => handleNavigation("previous_papers")} />
        </View>

        {/* ================= RECENT INQUIRIES / SESSIONS ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Inquiries</Text>
          <TouchableOpacity onPress={() => setScreen("history")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {loadingSessions && recentSessions.length === 0 ? (
          <ActivityIndicator color={BRAND_PURPLE} size="small" style={{ marginVertical: 15 }} />
        ) : recentSessions.length > 0 ? (
          recentSessions.map((session, index) => (
            <TouchableOpacity
              key={session.id || index}
              style={styles.historyCard}
              onPress={() => {
                if (setSessionId) setSessionId(session.id);
                if (setQuestion) setQuestion(session.title);
                if (setAnswer) setAnswer("");
                if (setSelectedMedia) setSelectedMedia(null);
                setScreen("solution");
              }}
              activeOpacity={0.7}
            >
              <View style={styles.historyIconCircle}>
                <Ionicons name="chatbubble-outline" size={15} color={BRAND_PURPLE} />
              </View>

              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={styles.historyTitleText} numberOfLines={1}>{session.title}</Text>
                <Text style={styles.historyDateText}>{session.date}</Text>
              </View>

              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.noDataText}>No questions asked yet. Tap above to start learning!</Text>
          </View>
        )}
      </ScrollView>

      {/* ================= BOTTOM TABS COMPONENT ================= */}
      <BottomTabs active="Home" setScreen={handleNavigation} />

      {/* Side Navigation Drawer */}
      {drawer && (
        <SideDrawer
          setScreen={setScreen}
          onClose={() => setDrawer(false)}
          setQuestion={setQuestion}
          setSessionId={setSessionId}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === "android" ? 28 : 0,
    paddingHorizontal: 18,
    paddingBottom: 90,
  },
  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    width: 38,
    height: 48,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  schoolName: {
    fontSize: 22,
    color: "#0F172A",
    fontFamily: "serif",
    fontWeight: "800",
    letterSpacing: -0.5,
    marginLeft: 2,
  },
  headerRight: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
  },
  notification: {
    width: 42,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 12,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
  },
  profileCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
    borderWidth: 1,
    borderColor: "rgba(108, 77, 255, 0.2)",
  },
  welcomeContainer: {
    marginTop: 6,
    marginBottom: 4,
  },
  classText: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  welcomeText: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  questionCard: {
    marginTop: 16,
    padding: 16,
    paddingTop: 18,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  questionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: "serif",
    fontWeight: "700",
    color: "#0F172A",
  },
  searchBox: {
    height: 52,
    marginTop: 18,
    paddingLeft: 14,
    paddingRight: 6,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: "#64748B",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BRAND_PURPLE,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  quickActions: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  quickAction: {
    alignItems: "center",
    width: "23%",
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(108, 77, 255, 0.2)",
    backgroundColor: BRAND_PURPLE_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  quickText: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: "600",
    color: "#334155",
  },
  featureGrid: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: "31.5%",
    height: 76,
    marginBottom: 12,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#64748B",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  featureIcon: {
    zIndex: 2,
  },
  featureText: {
    position: "absolute",
    bottom: 12,
    left: 12,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: "#0F172A",
    zIndex: 2,
  },
  decorCircle: {
    position: "absolute",
    width: 85,
    height: 85,
    borderRadius: 45,
    backgroundColor: BRAND_PURPLE_LIGHT,
    right: -20,
    top: -28,
    opacity: 0.6,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "serif",
    fontWeight: "700",
    color: "#0F172A",
  },
  seeAllText: {
    color: BRAND_PURPLE,
    fontSize: 13,
    fontWeight: "700",
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    shadowColor: "#64748B",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  historyIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  historyTitleText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  historyDateText: {
    fontSize: 11,
    color: "#64748B",
  },
  emptyCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    marginBottom: 10,
  },
  noDataText: {
    fontSize: 12.5,
    fontStyle: "italic",
    color: "#64748B",
    textAlign: "center",
  }
});