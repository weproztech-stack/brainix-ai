import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  Modal,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Markdown from "react-native-markdown-display";
import { Volume2, Square, CheckCircle2, ListOrdered, ArrowLeft, ShieldCheck, Crown, Sparkles, X } from "lucide-react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Composer from "../components/Composer";
import UploadSheet from "../modals/UploadSheet";

import { apiFetch } from "../services/api";
import { speakAIResponse, stopSpeaking } from "../utils/voiceAssistant";

const BRAND_PURPLE = "#6C4DFF";
const BRAND_PURPLE_LIGHT = "rgba(108, 77, 255, 0.08)";

// Math & clean string formatter
const formatAIResponse = (rawText) => {
  if (!rawText || typeof rawText !== "string") return "";
  return rawText
    .replace(/\\boxed\{([^}]+)\}/g, "**$1**")
    .split("$$").join("")
    .split("$").join("")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1/$2)")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)");
};

// Parser to split raw response into Steps and Final Answer Cards
const parseStructuredResponse = (text) => {
  if (!text) return { intro: "", steps: [], finalAnswer: "" };

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const steps = [];
  let intro = "";
  let finalAnswer = "";

  const stepRegex = /^(step\s*\d+[:.-]?|\d+[\.)]|•|-)\s*(.*)/i;
  const answerRegex = /^(final\s*(answer|result|conclusion|understanding|value|equation)|conclusion|therefore|chemical\s*equation)[:.-]?\s*(.*)/i;

  let isCapturingSteps = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const stepMatch = line.match(stepRegex);
    const answerMatch = line.match(answerRegex);

    if (answerMatch) {
      finalAnswer = answerMatch[3] || lines.slice(i + 1).join(" ");
      break;
    } else if (stepMatch) {
      isCapturingSteps = true;
      steps.push(stepMatch[2] || line);
    } else if (!isCapturingSteps && steps.length === 0) {
      intro += (intro ? "\n" : "") + line;
    } else if (isCapturingSteps) {
      steps[steps.length - 1] += " " + line;
    }
  }

  if (steps.length > 1 && !finalAnswer) {
    finalAnswer = steps.pop();
  }

  return { intro, steps, finalAnswer };
};

export default function SolutionScreen({
  setScreen,
  question: initialQuestion = "",
  sessionId,
  setSessionId,
  selectedMedia = null,
  setSelectedMedia = null
}) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState(selectedMedia);
  const [isPro, setIsPro] = useState(false);
  const [loadingPro, setLoadingPro] = useState(true); // Pro status load hone tak flag
  const [showProModal, setShowProModal] = useState(false);

  // Voice & Audio States
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState(null);

  const scrollViewRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 250);
  };

  useEffect(() => {
    checkUserProStatus();
    const kShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      scrollToBottom
    );
    return () => {
      kShow.remove();
      stopSpeaking();
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

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

  useEffect(() => {
    if (selectedMedia) setAttachedMedia(selectedMedia);
  }, [selectedMedia]);

  useEffect(() => {
    if (sessionId) {
      loadSessionMessages(sessionId);
    } else if (initialQuestion || selectedMedia) {
      askAI(initialQuestion, selectedMedia);
    }
  }, [sessionId]);

  const loadSessionMessages = async (sId) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/ai/session/${sId}`);
      if (data && data.success && Array.isArray(data.messages)) {
        const formatted = data.messages.map((m) => {
          const cleanText = m.sender === "user" ? m.message : formatAIResponse(m.message);
          return {
            id: (m.id || Math.random()).toString(),
            type: m.sender === "user" ? "question" : "answer",
            text: cleanText,
            parsed: m.sender === "user" ? null : parseStructuredResponse(cleanText),
            imageUri: m.image_url || null
          };
        });
        setMessages(formatted);
        scrollToBottom();
      }
    } catch (err) {
      console.log("Load session error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    // 🌟 STRICT CHECK: Only apply free limit if user is NOT pro
    if (!loadingPro && !isPro) {
      try {
        const freeCountStr = await AsyncStorage.getItem("free_questions_count") || "0";
        const freeCount = parseInt(freeCountStr, 10);
        if (freeCount >= 3) {
          setShowProModal(true);
          return;
        }
      } catch (err) {}
    }

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
      console.error("Recording Start Error:", err);
    }
  };

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
      console.error("Recording Stop Error:", error);
    }
  };

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
        const spokenText = res.text.trim();
        askAI(spokenText);
      }
    } catch (e) {
      console.error("Transcription Error:", e);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleToggleSpeech = (msgId, textToRead) => {
    if (activeSpeakingId === msgId) {
      stopSpeaking();
      setActiveSpeakingId(null);
    } else {
      setActiveSpeakingId(msgId);
      speakAIResponse(
        textToRead,
        () => setActiveSpeakingId(msgId),
        () => setActiveSpeakingId(null)
      );
    }
  };

  const askAI = async (queryToAsk, overrideMedia) => {
    if (loadingPro) return; // Wait until pro check completes
    const targetQuestion = queryToAsk !== undefined ? queryToAsk : question;
    const currentMedia = overrideMedia !== undefined ? overrideMedia : attachedMedia;

    if (!targetQuestion.trim() && !currentMedia) return;

    // 🌟 STRICT CHECK: Only non-pro users get limited to 3 free questions
    if (!isPro) {
      try {
        const freeCountStr = await AsyncStorage.getItem("free_questions_count") || "0";
        let freeCount = parseInt(freeCountStr, 10);
        if (freeCount >= 3) {
          setShowProModal(true);
          return;
        }
        freeCount += 1;
        await AsyncStorage.setItem("free_questions_count", freeCount.toString());
      } catch (err) {
        console.log("Free limit check error:", err);
      }
    }

    let finalBase64 = currentMedia?.base64 || null;
    if (currentMedia?.uri && !finalBase64) {
      try {
        finalBase64 = await FileSystem.readAsStringAsync(currentMedia.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (e) {
        console.log("Failed to convert image URI to base64:", e);
      }
    }

    const cleanQuestion = targetQuestion.trim();
    const userMsg = {
      id: Date.now().toString(),
      type: "question",
      text: cleanQuestion || "📷 [Attached Image Query]",
      imageUri: currentMedia?.type === "image" ? currentMedia.uri : null
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setAttachedMedia(null);
    if (setSelectedMedia) setSelectedMedia(null);
    setLoading(true);
    scrollToBottom();

    try {
      const data = await apiFetch("/ai/ask", {
        method: "POST",
        body: JSON.stringify({
          question: cleanQuestion || "Explain and solve this problem step-by-step.",
          image_base64: finalBase64,
          session_id: sessionId || null
        })
      });

      let responseText = data?.success
        ? formatAIResponse(data.answer)
        : data?.message || "Failed to fetch response.";

      if (data?.session_id && setSessionId) {
        setSessionId(data.session_id);
      }

      const answerMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: answerMsgId,
          type: "answer",
          text: responseText,
          parsed: parseStructuredResponse(responseText)
        }
      ]);
    } catch (error) {
      const errorText = "Network Error: " + error.message;
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "answer",
          text: errorText,
          parsed: { intro: errorText, steps: [], finalAnswer: "" }
        }
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top", "left", "right"]}>
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("home")} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Solution</Text>

        {isPro ? (
          <View style={styles.proActiveBadge}>
            <ShieldCheck size={13} color="#059669" style={{ marginRight: 4 }} />
            <Text style={styles.proActiveText}>PRO ACTIVE</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.upgradeBtn} 
            activeOpacity={0.8}
            onPress={() => setScreen("premium")}
          >
            <Text style={styles.upgradeText}>PRO</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToBottom}
        >
          {messages.map((item) => (
            <View
              key={item.id}
              style={{
                alignSelf: item.type === "question" ? "flex-end" : "flex-start",
                width: item.type === "question" ? "auto" : "100%",
                maxWidth: item.type === "question" ? "88%" : "100%",
                marginVertical: 8
              }}
            >
              <View
                style={{
                  backgroundColor: item.type === "question" ? BRAND_PURPLE : "#FFFFFF",
                  borderRadius: 18,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderWidth: item.type === "question" ? 0 : 1,
                  borderColor: "#E2E8F0",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: item.type === "question" ? 0.15 : 0.04,
                  shadowRadius: 6,
                  elevation: 2
                }}
              >
                <View style={styles.cardHeaderRow}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "800",
                      color: item.type === "question" ? "#E0D7FF" : BRAND_PURPLE
                    }}
                  >
                    {item.type === "question" ? "You" : "✨ Brainix Socratic Solution"}
                  </Text>

                  {item.type === "answer" && (
                    <TouchableOpacity
                      style={styles.speakerBtn}
                      onPress={() => handleToggleSpeech(item.id, item.text)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {activeSpeakingId === item.id ? (
                        <View style={styles.speakerActivePill}>
                          <Square size={11} color="#FFFFFF" fill="#FFFFFF" />
                          <Text style={styles.speakerActiveText}>Stop</Text>
                        </View>
                      ) : (
                        <View style={styles.speakerIdlePill}>
                          <Volume2 size={13} color={BRAND_PURPLE} />
                          <Text style={styles.speakerIdleText}>Listen</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                {item.imageUri && (
                  <Image
                    source={{ uri: item.imageUri }}
                    style={{ width: 220, height: 140, borderRadius: 10, marginBottom: 8, marginTop: 6 }}
                    resizeMode="cover"
                  />
                )}

                {item.type === "question" ? (
                  <Text style={{ fontSize: 15, color: "#FFFFFF", lineHeight: 22, fontWeight: "500" }}>
                    {item.text}
                  </Text>
                ) : (
                  <View style={{ marginTop: 6 }}>
                    {item.parsed?.intro ? (
                      <View style={styles.introBox}>
                        <Markdown style={markdownStyles}>{item.parsed.intro}</Markdown>
                      </View>
                    ) : null}

                    {item.parsed?.steps && item.parsed.steps.length > 0 ? (
                      <View style={{ marginTop: 6, marginBottom: 8 }}>
                        <View style={styles.stepsHeaderRow}>
                          <ListOrdered size={14} color="#64748B" />
                          <Text style={styles.stepsHeaderText}>Step-by-Step Breakdown</Text>
                        </View>

                        {item.parsed.steps.map((stepText, idx) => (
                          <View key={idx} style={styles.stepCard}>
                            <View style={styles.stepBadge}>
                              <Text style={styles.stepNumber}>{idx + 1}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Markdown style={markdownStyles}>{stepText}</Markdown>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : (
                      !item.parsed?.intro && (
                        <Markdown style={markdownStyles}>{item.text}</Markdown>
                      )
                    )}

                    {item.parsed?.finalAnswer ? (
                      <View style={styles.finalAnswerCard}>
                        <View style={styles.finalAnswerHeader}>
                          <CheckCircle2 size={15} color="#075E54" />
                          <Text style={styles.finalAnswerTitle}>Final Result</Text>
                        </View>
                        <Text style={styles.finalAnswerBody}>{item.parsed.finalAnswer}</Text>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
            </View>
          ))}

          {loading && (
            <View style={{ alignSelf: "flex-start", marginVertical: 6, width: "100%" }}>
              <View style={styles.loadingCard}>
                <Text style={{ fontSize: 11, fontWeight: "800", color: BRAND_PURPLE }}>✨ Brainix AI</Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                  <ActivityIndicator size="small" color={BRAND_PURPLE} style={{ marginRight: 8 }} />
                  <Text style={{ color: "#64748B", fontSize: 13, fontWeight: "500" }}>
                    Analyzing problem & deriving steps...
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* 📷 Attached Image Preview Bar */}
        {attachedMedia && (
          <View style={styles.attachedMediaBar}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              {attachedMedia.type === "image" && attachedMedia.uri && (
                <Image
                  source={{ uri: attachedMedia.uri }}
                  style={{ width: 42, height: 42, borderRadius: 8, marginRight: 10 }}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12.5, fontWeight: "700", color: "#0F172A" }}>Attached Photo</Text>
                <Text style={{ fontSize: 11, color: "#64748B" }}>Ready to send with your message</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setAttachedMedia(null)} style={styles.removeMediaBtn}>
              <X size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}

        <Composer
          placeholder={isRecording ? "Listening..." : loading ? "Solving..." : "Ask a follow-up doubt or add text..."}
          value={question}
          onChangeText={setQuestion}
          onUpload={() => {
            if (loadingPro) return;
            if (!isPro) {
              AsyncStorage.getItem("free_questions_count").then((val) => {
                if (parseInt(val || "0", 10) >= 3) {
                  setShowProModal(true);
                  return;
                }
                setShowSheet(true);
              });
            } else {
              setShowSheet(true);
            }
          }}
          onSend={() => askAI(question)}
          onVoice={isRecording ? stopRecording : startRecording}
          onMicPress={isRecording ? stopRecording : startRecording}
          isRecording={isRecording}
          isTranscribing={isTranscribing}
        />
      </KeyboardAvoidingView>

      {showSheet && (
        <UploadSheet
          onClose={() => setShowSheet(false)}
          onSelectMedia={(media) => {
            setAttachedMedia(media);
            setShowSheet(false);
          }}
        />
      )}

      {/* 🌟 Professional Clean Pro Limit Modal */}
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

            <Text style={styles.proModalTitle}>Free Limit Reached</Text>
            <Text style={styles.proModalDesc}>
              You have used your 3 free AI solutions. Upgrade to <Text style={{ fontWeight: "800", color: "#0F172A" }}>Brainix PRO</Text> to unlock unlimited questions, expert teacher consultations, and step-by-step problem solvers.
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
  upgradeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: BRAND_PURPLE_LIGHT,
    borderWidth: 1,
    borderColor: "rgba(108, 77, 255, 0.2)"
  },
  upgradeText: {
    color: BRAND_PURPLE,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  proActiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#D1FAE5"
  },
  proActiveText: {
    color: "#059669",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  speakerBtn: {
    paddingLeft: 8
  },
  speakerIdlePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BRAND_PURPLE_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4
  },
  speakerIdleText: {
    color: BRAND_PURPLE,
    fontSize: 11,
    fontWeight: "700"
  },
  speakerActivePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4
  },
  speakerActiveText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700"
  },
  introBox: {
    marginBottom: 8
  },
  stepsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    marginTop: 4
  },
  stepsHeaderText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  stepCard: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BRAND_PURPLE,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 2
  },
  stepNumber: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800"
  },
  finalAnswerCard: {
    backgroundColor: "#DCF8C6",
    borderColor: "#B4E4A0",
    borderWidth: 1,
    padding: 12,
    borderRadius: 14,
    marginTop: 6
  },
  finalAnswerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4
  },
  finalAnswerTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#075E54",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  finalAnswerBody: {
    fontSize: 14,
    color: "#111B21",
    lineHeight: 20,
    fontWeight: "700"
  },
  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  attachedMediaBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 6,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  removeMediaBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center"
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

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: "#0F172A"
  },
  strong: {
    fontWeight: "700",
    color: "#0F172A"
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 4
  }
});