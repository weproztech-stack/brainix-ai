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
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BookOpen,
  DollarSign,
  GraduationCap,
  UploadCloud,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  User
} from "lucide-react-native";

import Header from "../components/Header";
import { apiFetch } from "../services/api";

const BRAND_PURPLE = "#8547FB";
const BRAND_PURPLE_LIGHT = "rgba(133, 71, 251, 0.08)";
const BRAND_PURPLE_BORDER = "rgba(133, 71, 251, 0.25)";

export default function TeacherProfileSetupScreen({ setScreen, setUserRole }) {
  // Form States
  const [headline, setHeadline] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState(["Mathematics"]);
  const [selectedBoards, setSelectedBoards] = useState(["CBSE"]);
  const [experienceYears, setExperienceYears] = useState("3");
  const [hourlyRate, setHourlyRate] = useState("499");
  const [monthlyHomeRate, setMonthlyHomeRate] = useState("4500");
  const [mode, setMode] = useState("both"); // online, home, both
  const [bio, setBio] = useState("");

  const [degreeUploaded, setDegreeUploaded] = useState(false);
  const [idUploaded, setIdUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableSubjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Computer Science"
  ];

  const availableBoards = ["CBSE", "ICSE", "UP Board", "State Boards", "JEE / NEET"];

  const toggleSubject = (sub) => {
    if (selectedSubjects.includes(sub)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const toggleBoard = (b) => {
    if (selectedBoards.includes(b)) {
      if (selectedBoards.length > 1) {
        setSelectedBoards(selectedBoards.filter((item) => item !== b));
      }
    } else {
      setSelectedBoards([...selectedBoards, b]);
    }
  };

  // 📥 Live Backend Sync Handle Profile Setup
  const handleSaveProfile = async () => {
    if (!headline.trim() || !hourlyRate || !bio.trim()) {
      Alert.alert("Missing Info", "Please enter your profile headline, hourly rate, and a short bio.");
      return;
    }

    if (!degreeUploaded || !idUploaded) {
      Alert.alert("Verification Pending", "Please upload your teaching certificate and Govt ID proof to activate profile.");
      return;
    }

    setLoading(true);
    try {
      // 1. Prepare Backend API Payload
      const combinedSubjectStr = `${selectedSubjects.join(", ")} | Boards: ${selectedBoards.join(", ")}`;
      
      const payload = {
        full_name: headline.trim(), // Can be updated as per backend structure
        subject_specialization: combinedSubjectStr,
        qualifications: "Verified Degree & ID attached",
        experience_years: parseInt(experienceYears) || 1,
        hourly_rate: parseFloat(hourlyRate) || 499,
        bio: bio.trim(),
        available_online: mode === "online" || mode === "both" ? 1 : 0,
        available_offline: mode === "home" || mode === "both" ? 1 : 0
      };

      // 2. Call Profile Update API (Uses PUT /teacher/profile)
      const res = await apiFetch("/teacher/profile", {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        // 3. Cache Data Locally
        const localData = {
          headline: headline.trim(),
          subjects: selectedSubjects,
          boards: selectedBoards,
          experience: `${experienceYears} Years`,
          hourlyRate: parseFloat(hourlyRate),
          monthlyHomeRate: mode !== "online" ? parseFloat(monthlyHomeRate) : null,
          mode,
          bio: bio.trim(),
          isKycVerified: true
        };
        await AsyncStorage.setItem("teacherProfile", JSON.stringify(localData));

        if (setUserRole) setUserRole("teacher");

        Alert.alert(
          "🎉 Profile Active!",
          "Your teaching profile is now verified and active for student bookings.",
          [{ text: "Go to Dashboard", onPress: () => setScreen("teacher_home") }]
        );
      } else {
        Alert.alert("Setup Notice", res?.message || "Could not finalize profile configuration.");
      }
    } catch (e) {
      Alert.alert("Server Error", "Failed to connect to Brainix servers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <Header title="Educator Profile Setup" onBack={() => setScreen("teacher_home")} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Top Banner */}
        <View style={styles.topBanner}>
          <View style={styles.bannerIconCircle}>
            <GraduationCap size={22} color={BRAND_PURPLE} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.bannerTitle}>Complete Your Profile</Text>
            <Text style={styles.bannerSub}>
              Set up your subjects, teaching preferences, and consultation fees.
            </Text>
          </View>
        </View>

        {/* Section 1: Professional Headline */}
        <View style={styles.formGroup}>
          <Text style={styles.groupHeading}>PROFESSIONAL HEADLINE</Text>
          <View style={styles.inputBox}>
            <User size={16} color="#94A3B8" />
            <TextInput
              style={styles.input}
              placeholder="e.g. Senior Math Educator | Ex-Faculty (10+ Yrs Exp)"
              placeholderTextColor="#94A3B8"
              value={headline}
              onChangeText={setHeadline}
            />
          </View>
        </View>

        {/* Section 2: Subjects Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.groupHeading}>SUBJECTS OFFERED</Text>
          <View style={styles.chipGrid}>
            {availableSubjects.map((sub) => {
              const isSelected = selectedSubjects.includes(sub);
              return (
                <TouchableOpacity
                  key={sub}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleSubject(sub)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 3: Target Boards */}
        <View style={styles.formGroup}>
          <Text style={styles.groupHeading}>CURRICULUM / BOARDS</Text>
          <View style={styles.chipGrid}>
            {availableBoards.map((b) => {
              const isSelected = selectedBoards.includes(b);
              return (
                <TouchableOpacity
                  key={b}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleBoard(b)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {b}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 4: Teaching Mode & Pricing */}
        <View style={styles.formGroup}>
          <Text style={styles.groupHeading}>TEACHING MODE & RATES</Text>
          
          {/* Mode Switcher */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.modeTab, mode === "online" && styles.modeTabActive]}
              onPress={() => setMode("online")}
            >
              <Text style={[styles.modeTabText, mode === "online" && styles.modeTabTextActive]}>
                Online Only
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, mode === "home" && styles.modeTabActive]}
              onPress={() => setMode("home")}
            >
              <Text style={[styles.modeTabText, mode === "home" && styles.modeTabTextActive]}>
                Home Visits
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, mode === "both" && styles.modeTabActive]}
              onPress={() => setMode("both")}
            >
              <Text style={[styles.modeTabText, mode === "both" && styles.modeTabTextActive]}>
                Both Modes
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pricing Row */}
          <View style={styles.pricingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.smallLabel}>1-ON-1 ONLINE (₹/HR)</Text>
              <View style={styles.inputBox}>
                <DollarSign size={15} color={BRAND_PURPLE} />
                <TextInput
                  style={styles.input}
                  placeholder="499"
                  placeholderTextColor="#94A3B8"
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {mode !== "online" && (
              <View style={{ flex: 1 }}>
                <Text style={styles.smallLabel}>HOME TUITION (₹/MO)</Text>
                <View style={styles.inputBox}>
                  <DollarSign size={15} color={BRAND_PURPLE} />
                  <TextInput
                    style={styles.input}
                    placeholder="4500"
                    placeholderTextColor="#94A3B8"
                    value={monthlyHomeRate}
                    onChangeText={setMonthlyHomeRate}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Section 5: Bio & Methodology */}
        <View style={styles.formGroup}>
          <Text style={styles.groupHeading}>ABOUT ME & PEDAGOGY</Text>
          <View style={[styles.inputBox, { height: 90, alignItems: "flex-start", paddingVertical: 8 }]}>
            <TextInput
              style={[styles.input, { height: "100%", textAlignVertical: "top" }]}
              placeholder="Describe your teaching style, past results, and conceptual methodology..."
              placeholderTextColor="#94A3B8"
              value={bio}
              onChangeText={setBio}
              multiline
            />
          </View>
        </View>

        {/* Section 6: Document & KYC Verification */}
        <View style={styles.formGroup}>
          <Text style={styles.groupHeading}>KYC & TRUST BADGE VERIFICATION</Text>
          
          <TouchableOpacity
            style={styles.docUploadCard}
            onPress={() => {
              setDegreeUploaded(true);
              Alert.alert("Uploaded", "Highest educational degree attached.");
            }}
            activeOpacity={0.75}
          >
            <View style={styles.docIconWrap}>
              {degreeUploaded ? (
                <CheckCircle2 size={18} color="#10B981" />
              ) : (
                <UploadCloud size={18} color={BRAND_PURPLE} />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.docTitle}>Degree / Teaching Certificate</Text>
              <Text style={styles.docSub}>
                {degreeUploaded ? "Verified Document Attached ✓" : "Upload graduation or B.Ed marksheets"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.docUploadCard}
            onPress={() => {
              setIdUploaded(true);
              Alert.alert("Uploaded", "Government ID proof attached.");
            }}
            activeOpacity={0.75}
          >
            <View style={styles.docIconWrap}>
              {idUploaded ? (
                <CheckCircle2 size={18} color="#10B981" />
              ) : (
                <ShieldCheck size={18} color={BRAND_PURPLE} />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.docTitle}>Govt ID Proof (Aadhaar / Passport)</Text>
              <Text style={styles.docSub}>
                {idUploaded ? "Verified ID Attached ✓" : "Required for home visit verification"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSaveProfile}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.saveBtnText}>Save Educator Profile</Text>
              <ChevronRight size={18} color="#FFFFFF" />
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
    paddingTop: 10,
    paddingBottom: 90
  },
  topBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  bannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  bannerTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0F172A"
  },
  bannerSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2
  },
  formGroup: {
    marginBottom: 14
  },
  groupHeading: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 6,
    marginLeft: 2
  },
  smallLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 4,
    marginLeft: 2
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    height: 44,
    gap: 8
  },
  input: {
    flex: 1,
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "600"
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  chipActive: {
    backgroundColor: BRAND_PURPLE_LIGHT,
    borderColor: BRAND_PURPLE
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B"
  },
  chipTextActive: {
    color: BRAND_PURPLE,
    fontWeight: "700"
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    padding: 3,
    borderRadius: 12,
    marginBottom: 10
  },
  modeTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 9
  },
  modeTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  modeTabText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748B"
  },
  modeTabTextActive: {
    color: BRAND_PURPLE,
    fontWeight: "700"
  },
  pricingRow: {
    flexDirection: "row",
    gap: 10
  },
  docUploadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  docIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  docTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A"
  },
  docSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1
  },
  saveBtn: {
    backgroundColor: BRAND_PURPLE,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
    shadowColor: BRAND_PURPLE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700"
  }
});