import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  X,
  ArrowLeft
} from "lucide-react-native";

import { apiFetch } from "../services/api";

const BRAND_PURPLE = "#8547FB";
const BRAND_PURPLE_LIGHT = "rgba(133, 71, 251, 0.08)";
const BRAND_PURPLE_BORDER = "rgba(133, 71, 251, 0.22)";

export default function TeacherAvailabilityScreen({ setScreen }) {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [selectedDay, setSelectedDay] = useState("Mon");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Slots mapped strictly from database
  const [weeklySlots, setWeeklySlots] = useState({
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
    Sun: []
  });

  // Custom Add Slot Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState("05:00 PM - 06:00 PM");
  const [newSlotMode, setNewSlotMode] = useState("online"); // online, home, both

  useEffect(() => {
    fetchSlotsFromDb();
  }, []);

  // 📥 1. Fetch Real Slots from Database
  const fetchSlotsFromDb = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/teacher/slots");
      const grouped = {
        Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
      };

      if (res && res.success && Array.isArray(res.slots)) {
        res.slots.forEach(slot => {
          if (grouped[slot.day_of_week]) {
            grouped[slot.day_of_week].push({
              id: slot.id.toString(),
              time: slot.slot_time,
              mode: slot.teaching_mode,
              active: Boolean(slot.is_active)
            });
          }
        });
      }
      setWeeklySlots(grouped);
    } catch (e) {
      console.log("Slots load error:", e);
      setWeeklySlots({ Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] });
    } finally {
      setLoading(false);
    }
  };

  const currentDaySlots = weeklySlots[selectedDay] || [];

  const toggleSlotStatus = (slotId) => {
    const updated = currentDaySlots.map((s) =>
      s.id === slotId ? { ...s, active: !s.active } : s
    );
    setWeeklySlots({ ...weeklySlots, [selectedDay]: updated });
  };

  const deleteSlot = (slotId) => {
    const updated = currentDaySlots.filter((s) => s.id !== slotId);
    setWeeklySlots({ ...weeklySlots, [selectedDay]: updated });
  };

  const handleCreateSlot = () => {
    if (!newSlotTime.trim()) {
      Alert.alert("Required", "Please specify a slot time range.");
      return;
    }

    const newSlot = {
      id: Date.now().toString(),
      time: newSlotTime.trim(),
      active: true,
      mode: newSlotMode
    };

    setWeeklySlots({
      ...weeklySlots,
      [selectedDay]: [...currentDaySlots, newSlot]
    });

    setModalVisible(false);
    setNewSlotTime("06:00 PM - 07:00 PM");
  };

  // 💾 2. Save Slots Strictly to Database
  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      const payloadSlots = [];

      Object.keys(weeklySlots).forEach(day => {
        weeklySlots[day].forEach(s => {
          payloadSlots.push({
            day_of_week: day,
            slot_time: s.time,
            teaching_mode: s.mode || 'both',
            is_active: s.active ? 1 : 0
          });
        });
      });

      const res = await apiFetch("/teacher/slots/save", {
        method: "POST",
        body: JSON.stringify({ slots: payloadSlots })
      });

      if (res && res.success) {
        Alert.alert("Saved Successfully", "Your consultation calendar is securely saved in the database and live for students.");
        fetchSlotsFromDb(); // Re-sync with DB
      } else {
        Alert.alert("Notice", res?.message || "Could not save to database.");
      }
    } catch (e) {
      Alert.alert("Error", "Could not reach database server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      
      {/* Native Clean Header with Back Button */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("teacher_home")}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Availability & Slots</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconBox}>
            <Calendar size={20} color={BRAND_PURPLE} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.infoTitle}>Weekly Teaching Schedule</Text>
            <Text style={styles.infoSub}>
              Students can book 1-on-1 sessions only during your active available hours.
            </Text>
          </View>
        </View>

        {/* Day Selector Chips */}
        <Text style={styles.sectionHeading}>SELECT DAY OF WEEK</Text>
        <View style={styles.daysRow}>
          {daysOfWeek.map((day) => {
            const isSelected = selectedDay === day;
            const hasSlots = (weeklySlots[day] || []).some((s) => s.active);
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayChip,
                  isSelected && styles.dayChipActive
                ]}
                onPress={() => setSelectedDay(day)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>
                  {day}
                </Text>
                {hasSlots && (
                  <View style={[styles.dayDot, isSelected && { backgroundColor: "#FFFFFF" }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Slots List for Selected Day */}
        <View style={styles.slotListHeader}>
          <Text style={styles.sectionHeading}>TIME SLOTS FOR {selectedDay.toUpperCase()}</Text>
          <TouchableOpacity 
            style={styles.addSlotMiniBtn} 
            onPress={() => setModalVisible(true)}
            activeOpacity={0.75}
          >
            <Plus size={13} color={BRAND_PURPLE} strokeWidth={2.5} />
            <Text style={styles.addSlotMiniText}>Add Slot</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator color={BRAND_PURPLE} size="large" />
            <Text style={{ marginTop: 10, color: "#64748B", fontSize: 12 }}>Fetching live slots from database...</Text>
          </View>
        ) : currentDaySlots.length > 0 ? (
          currentDaySlots.map((slot) => (
            <View 
              key={slot.id} 
              style={[
                styles.slotCard, 
                !slot.active && styles.slotCardInactive
              ]}
            >
              <TouchableOpacity 
                style={styles.checkArea}
                onPress={() => toggleSlotStatus(slot.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.statusIconBox, slot.active && styles.statusIconBoxActive]}>
                  <Clock size={15} color={slot.active ? BRAND_PURPLE : "#94A3B8"} />
                </View>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.slotTime, !slot.active && styles.slotTimeInactive]}>
                    {slot.time}
                  </Text>
                  <Text style={styles.slotModeTag}>
                    {slot.mode === "online" ? "🌐 1-on-1 Online" : slot.mode === "home" ? "📍 Home Visit" : "🌐 Online & 📍 Home"}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.slotActionRow}>
                <TouchableOpacity 
                  style={[styles.toggleBtn, slot.active ? styles.toggleBtnActive : styles.toggleBtnInactive]}
                  onPress={() => toggleSlotStatus(slot.id)}
                >
                  <Text style={[styles.toggleBtnText, slot.active ? styles.toggleBtnTextActive : styles.toggleBtnTextInactive]}>
                    {slot.active ? "Open" : "Blocked"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.deleteBtn}
                  onPress={() => deleteSlot(slot.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={15} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptySlotCard}>
            <Text style={styles.emptySlotText}>No active slots configured for {selectedDay}.</Text>
            <TouchableOpacity style={styles.addEmptyBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.addEmptyBtnText}>+ Add First Slot</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Instant Doubt Policy Card */}
        <View style={styles.instantRuleCard}>
          <Sparkles size={18} color={BRAND_PURPLE} style={{ marginTop: 2 }} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.ruleTitle}>Auto-Buffer Timing</Text>
            <Text style={styles.ruleSub}>
              A 15-minute gap is automatically added between consecutive student bookings to avoid schedule overlaps.
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
          onPress={handleSaveSchedule}
          disabled={saving}
          activeOpacity={0.88}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Save Consultation Calendar</Text>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* ➕ ADD CUSTOM SLOT MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Slot for {selectedDay}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>TIME RANGE</Text>
            <TextInput
              style={styles.timeInput}
              value={newSlotTime}
              onChangeText={setNewSlotTime}
              placeholder="e.g. 05:00 PM - 06:00 PM"
            />

            <Text style={styles.inputLabel}>TEACHING MODE</Text>
            <View style={styles.modeRow}>
              {[
                { key: "online", label: "Online" },
                { key: "home", label: "Home Visit" },
                { key: "both", label: "Both" }
              ].map(m => (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.modeChip, newSlotMode === m.key && styles.modeChipActive]}
                  onPress={() => setNewSlotMode(m.key)}
                >
                  <Text style={[styles.modeChipText, newSlotMode === m.key && styles.modeChipTextActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.createSlotBtn} onPress={handleCreateSlot}>
              <Text style={styles.createSlotBtnText}>Add to {selectedDay}</Text>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 90
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  infoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  infoTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A"
  },
  infoSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1
  },
  sectionHeading: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16
  },
  dayChip: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 10,
    marginHorizontal: 2.5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  dayChipActive: {
    backgroundColor: BRAND_PURPLE,
    borderColor: BRAND_PURPLE
  },
  dayText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#334155"
  },
  dayTextActive: {
    color: "#FFFFFF"
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: BRAND_PURPLE,
    marginTop: 4
  },
  slotListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 2
  },
  addSlotMiniBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: BRAND_PURPLE_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  addSlotMiniText: {
    fontSize: 11,
    fontWeight: "700",
    color: BRAND_PURPLE
  },
  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  slotCardInactive: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    opacity: 0.75
  },
  checkArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  statusIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center"
  },
  statusIconBoxActive: {
    backgroundColor: BRAND_PURPLE_LIGHT
  },
  slotTime: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A"
  },
  slotTimeInactive: {
    color: "#94A3B8",
    textDecorationLine: "line-through"
  },
  slotModeTag: {
    fontSize: 10.5,
    color: "#64748B",
    marginTop: 1
  },
  slotActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7
  },
  toggleBtnActive: {
    backgroundColor: "rgba(16, 185, 129, 0.12)"
  },
  toggleBtnInactive: {
    backgroundColor: "rgba(239, 68, 68, 0.1)"
  },
  toggleBtnText: {
    fontSize: 10.5,
    fontWeight: "800"
  },
  toggleBtnTextActive: {
    color: "#059669"
  },
  toggleBtnTextInactive: {
    color: "#EF4444"
  },
  deleteBtn: {
    padding: 4
  },
  emptySlotCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8
  },
  emptySlotText: {
    fontSize: 12,
    color: "#94A3B8",
    fontStyle: "italic",
    marginBottom: 8
  },
  addEmptyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: BRAND_PURPLE_LIGHT,
    borderRadius: 8
  },
  addEmptyBtnText: {
    color: BRAND_PURPLE,
    fontSize: 11.5,
    fontWeight: "700"
  },
  instantRuleCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: BRAND_PURPLE_LIGHT,
    borderRadius: 13,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BRAND_PURPLE_BORDER
  },
  ruleTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: BRAND_PURPLE
  },
  ruleSub: {
    fontSize: 11,
    color: "#475569",
    marginTop: 2,
    lineHeight: 15
  },
  saveBtn: {
    backgroundColor: BRAND_PURPLE,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: BRAND_PURPLE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700"
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
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A"
  },
  closeBtn: {
    padding: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 8
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#94A3B8",
    marginBottom: 6
  },
  timeInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 14
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18
  },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC"
  },
  modeChipActive: {
    borderColor: BRAND_PURPLE,
    backgroundColor: BRAND_PURPLE_LIGHT
  },
  modeChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B"
  },
  modeChipTextActive: {
    color: BRAND_PURPLE,
    fontWeight: "700"
  },
  createSlotBtn: {
    backgroundColor: BRAND_PURPLE,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center"
  },
  createSlotBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800"
  }
});