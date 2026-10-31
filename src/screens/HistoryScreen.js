import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import BottomTabs from "../components/BottomTabs";
import { apiFetch } from "../services/api";

const BRAND_PURPLE = "#6C4DFF";
const BRAND_PURPLE_LIGHT = "rgba(108, 77, 255, 0.08)";

export default function HistoryScreen({
  setScreen,
  setSessionId,
  setQuestion,
  setSelectedMedia,
  setSolution
}) {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState(null);
  const [activeChip, setActiveChip] = useState("All");

  useEffect(() => {
    fetchHistorySessions();
  }, []);

  const fetchHistorySessions = async () => {
    setLoading(true);
    try {
      const cached = await AsyncStorage.getItem("chatHistory");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setSessions(parsed);
          setFilteredSessions(parsed);
        }
      }

      let res = null;
      try {
        res = await apiFetch("/ai/sessions");
        if (!res || !res.success) {
          res = await apiFetch("/ai/history");
        }
      } catch (netErr) {
        console.log("Network fetch history warning:", netErr);
      }

      if (res && res.success) {
        const rawList = res.sessions || res.history || res.data || [];
        if (Array.isArray(rawList)) {
          const formatted = rawList.map((item) => {
            const displayTitle = item.title || item.question || item.first_message || "Saved Solution";
            return {
              id: String(item.id || item._id || Date.now()),
              title: String(displayTitle),
              subject: String(item.subject || "General"),
              date: String(item.created_at || item.date || "Recent")
            };
          });

          setSessions(formatted);
          setFilteredSessions(formatted);
          await AsyncStorage.setItem("chatHistory", JSON.stringify(formatted));
        }
      }
    } catch (error) {
      console.log("History Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (query, chip) => {
    let result = sessions || [];

    if (chip && chip !== "All") {
      result = result.filter((s) => 
        (s.subject && s.subject.toLowerCase() === chip.toLowerCase()) ||
        (s.title && s.title.toLowerCase().includes(chip.toLowerCase()))
      );
    }

    if (query && query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((s) =>
        s.title && s.title.toLowerCase().includes(q)
      );
    }

    setFilteredSessions(result);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(text, activeChip);
  };

  const handleChipSelect = (chip) => {
    setActiveChip(chip);
    applyFilters(searchQuery, chip);
  };

  const handleOpenSession = async (item) => {
    if (!item || !item.id) return;
    setOpeningId(item.id);
    if (setSessionId) setSessionId(item.id);
    if (setQuestion) setQuestion(item.title);
    if (setSelectedMedia) setSelectedMedia(null);

    try {
      const res = await apiFetch(`/ai/session/${item.id}`);
      if (res && res.success && Array.isArray(res.messages) && res.messages.length > 0) {
        const aiMsg = res.messages.find(m => m.sender === 'ai' || m.sender === 'bot') || res.messages[res.messages.length - 1];
        if (setSolution) {
          setSolution(aiMsg ? (aiMsg.message || aiMsg.text || aiMsg.ai_response) : "No solution text found.");
        }
      } else {
        if (setSolution) setSolution("Solution history loaded successfully.");
      }
    } catch (err) {
      console.log("Error loading session messages:", err);
    } finally {
      setOpeningId(null);
      setScreen("solution");
    }
  };

  const handleDeleteSession = async (sessionId, title) => {
    Alert.alert(
      "Delete Conversation",
      `Are you sure you want to delete "${title || "this chat"}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updated = (sessions || []).filter((s) => s.id !== sessionId);
              setSessions(updated);
              setFilteredSessions(updated);
              await AsyncStorage.setItem("chatHistory", JSON.stringify(updated));

              await apiFetch(`/ai/session/${sessionId}`, {
                method: "DELETE"
              });
            } catch (err) {
              console.log("Delete sync error:", err);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={localStyles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Custom Clean Header */}
      <View style={localStyles.customHeader}>
        <TouchableOpacity style={localStyles.backBtn} onPress={() => setScreen("home")} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={localStyles.headerTitle}>Search History</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={localStyles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Search Input Box */}
        <View style={localStyles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={localStyles.searchInput}
            placeholder="Search your past questions..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={localStyles.chipsRow}>
          {["All", "Math", "Physics", "Chemistry", "Biology"].map((chip) => (
            <TouchableOpacity 
              key={chip} 
              onPress={() => handleChipSelect(chip)}
              style={[localStyles.chip, activeChip === chip && localStyles.chipActive]}
            >
              <Text style={[localStyles.chipText, activeChip === chip && localStyles.chipTextActive]}>
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* History List */}
        {loading && (!sessions || sessions.length === 0) ? (
          <ActivityIndicator color={BRAND_PURPLE} size="large" style={{ marginVertical: 40 }} />
        ) : filteredSessions && filteredSessions.length > 0 ? (
          <View>
            <View style={localStyles.historyHead}>
              <Text style={localStyles.historyHeadText}>Saved Conversations</Text>
              <Text style={localStyles.sessionCount}>{filteredSessions.length} sessions</Text>
            </View>

            <View style={localStyles.groupCard}>
              {filteredSessions.map((item, index) => (
                <View key={item.id || index} style={localStyles.rowWrapper}>
                  <TouchableOpacity
                    style={{ flex: 1, paddingVertical: 12, paddingRight: 8 }}
                    onPress={() => handleOpenSession(item)}
                    activeOpacity={0.7}
                  >
                    {openingId === item.id ? (
                      <View style={localStyles.loadingRow}>
                        <ActivityIndicator color={BRAND_PURPLE} size="small" />
                        <Text style={localStyles.loadingText}>Loading Solution...</Text>
                      </View>
                    ) : (
                      <Text style={localStyles.sessionTitleText} numberOfLines={1}>
                        {item.title}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteSession(item.id, item.title)}
                    style={localStyles.deleteBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={localStyles.emptyContainer}>
            <View style={localStyles.emptyIconCircle}>
              <Ionicons name="document-text-outline" size={32} color={BRAND_PURPLE} />
            </View>
            <Text style={localStyles.emptyText}>
              {searchQuery ? "No matching questions found." : "No chat history found yet."}
            </Text>
            <TouchableOpacity
              style={localStyles.askBtn}
              onPress={() => setScreen("home")}
              activeOpacity={0.85}
            >
              <Text style={localStyles.askBtnText}>Ask a Question Now →</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={localStyles.privacyPill}>
          🔒 Your Brainix AI search history is private and secure.
        </Text>
      </ScrollView>

      <BottomTabs active="history" setScreen={setScreen} />
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
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
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", letterSpacing: -0.3 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 90 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1
  },
  searchInput: { flex: 1, fontSize: 14.5, color: "#0F172A", fontWeight: "500" },
  chipsRow: { marginBottom: 18, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 6
  },
  chipActive: { backgroundColor: BRAND_PURPLE, borderColor: BRAND_PURPLE },
  chipText: { fontSize: 12.5, fontWeight: "700", color: "#64748B" },
  chipTextActive: { color: "#FFFFFF" },
  historyHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4
  },
  historyHeadText: { fontSize: 14, fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: 0.3 },
  sessionCount: { fontSize: 12, color: "#94A3B8", fontWeight: "600" },
  groupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
    marginBottom: 20
  },
  rowWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 4
  },
  sessionTitleText: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  loadingRow: { paddingVertical: 4, flexDirection: "row", alignItems: "center" },
  loadingText: { color: "#94A3B8", marginLeft: 8, fontSize: 13, fontWeight: "600" },
  deleteBtn: { padding: 10, justifyContent: "center", alignItems: "center" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },
  emptyText: { color: "#64748B", fontSize: 13.5, fontStyle: "italic", marginBottom: 16, fontWeight: "500" },
  askBtn: {
    backgroundColor: BRAND_PURPLE,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: BRAND_PURPLE,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2
  },
  askBtnText: { color: "#FFFFFF", fontSize: 13.5, fontWeight: "800" },
  privacyPill: { textAlign: "center", color: "#94A3B8", fontSize: 11.5, fontWeight: "600", marginTop: 10, marginBottom: 20 }
});