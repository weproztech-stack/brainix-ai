import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Briefcase,
  Mail,
  Lock,
  User,
  Phone,
  BookOpen,
  ChevronRight,
  KeyRound,
  Award,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react-native";

import { apiFetch } from "../services/api";

const BRAND_PURPLE = "#8547FB";
const BRAND_PURPLE_LIGHT = "rgba(133, 71, 251, 0.08)";
const BRAND_PURPLE_BORDER = "rgba(133, 71, 251, 0.25)";

export default function TeacherRegisterScreen({ setScreen, setUserRole, setUser }) {
  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [subject, setSubject] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [experience, setExperience] = useState("");
  const [hourlyRate, setHourlyRate] = useState("499");
  const [teachingMode, setTeachingMode] = useState("both"); // online, home, both

  // OTP Verification States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [timer, setTimer] = useState(0);

  // Loading States
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Custom In-App Alert State
  const [customAlert, setCustomAlert] = useState({ visible: false, type: "success", title: "", message: "" });

  const showAlert = (type, title, message) => {
    setCustomAlert({ visible: true, type, title, message });
  };

  const hideAlert = () => {
    setCustomAlert({ visible: false, type: "success", title: "", message: "" });
  };

  // Resend Timer Countdown Hook
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // 1. Send OTP to Educator Email
  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes("@")) {
      showAlert("error", "Invalid Email", "Please enter a valid educator email address to receive your OTP.");
      return;
    }

    setSendingOtp(true);
    try {
      const data = await apiFetch("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      if (data && data.success) {
        setIsOtpSent(true);
        setTimer(60);
        showAlert("success", "OTP Dispatched 📬", "A 6-digit verification code has been sent to your email.");
      } else {
        showAlert("error", "Notice", data?.message || "Failed to send OTP. Please check email address.");
      }
    } catch (error) {
      showAlert("error", "Network Error", "Unable to reach server. Please check internet connection.");
    } finally {
      setSendingOtp(false);
    }
  };

  // 2. Verify Entered OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.trim().length < 6) {
      showAlert("error", "Invalid Code", "Please enter the full 6-digit OTP code.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const data = await apiFetch("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim()
        })
      });

      if (data && data.success) {
        setIsOtpVerified(true);
        showAlert("success", "Verified! ✅", "Email successfully verified. Complete your teaching credentials below.");
      } else {
        showAlert("error", "Verification Failed", data?.message || "Invalid or expired OTP code.");
      }
    } catch (error) {
      showAlert("error", "Error", "Could not verify code. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // 3. Complete Educator Registration
  const handleTeacherRegister = async () => {
    if (!isOtpVerified) {
      showAlert("error", "Verify Email", "Please verify your email via OTP before completing registration.");
      return;
    }

    if (!name.trim() || !phone.trim() || !password || !subject.trim() || !hourlyRate) {
      showAlert("error", "Missing Details", "Please fill in your name, mobile number, password, subject, and hourly rate.");
      return;
    }

    setRegistering(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        phone: phone.trim(),
        subject: subject.trim(),
        qualifications: qualifications.trim() || "Certified Educator",
        experience_years: parseInt(experience) || 2,
        hourly_rate: parseFloat(hourlyRate) || 499,
        available_online: teachingMode === "online" || teachingMode === "both" ? 1 : 0,
        available_offline: teachingMode === "home" || teachingMode === "both" ? 1 : 0
      };

      const res = await apiFetch("/teacher/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (res && res.success && res.token) {
        await AsyncStorage.setItem("userToken", res.token);
        await AsyncStorage.setItem("userData", JSON.stringify(res.user));
        await AsyncStorage.setItem("userRole", "teacher");

        if (setUser) setUser(res.user);
        if (setUserRole) setUserRole("teacher");

        showAlert("success", "🎉 Educator Profile Active!", "Welcome to Brainix Educator Network. Your faculty desk is ready.");
        setTimeout(() => setScreen("teacher_home"), 1200);
      } else {
        showAlert("error", "Registration Notice", res?.message || "Could not complete registration.");
      }
    } catch (error) {
      showAlert("error", "Registration Error", error.message || "Failed to connect to registration server.");
    } finally {
      setRegistering(false);
    }
  };

  // 4. Google Sign-In Handler for Educators
  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const res = await apiFetch("/auth/google", {
        method: "POST",
        body: JSON.stringify({ role: "teacher" })
      });

      if (res && res.success && res.token) {
        await AsyncStorage.setItem("userToken", res.token);
        await AsyncStorage.setItem("userData", JSON.stringify(res.user));
        await AsyncStorage.setItem("userRole", "teacher");

        if (setUser) setUser(res.user);
        if (setUserRole) setUserRole("teacher");

        showAlert("success", "Google Sign-In Successful! 🎉", "Welcome to Brainix Educator Network.");
        setTimeout(() => setScreen("teacher_home"), 1200);
      } else {
        setTimeout(() => {
          setGoogleLoading(false);
          showAlert("success", "Google Auth Simulated", "Google Authentication initialized. Please complete profile details.");
          setIsOtpVerified(true);
        }, 1000);
      }
    } catch (error) {
      setGoogleLoading(false);
      showAlert("error", "Google Sign-In", "Google Authentication endpoint is currently syncing. Please use email registration.");
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      {/* Custom In-App Alert Modal Banner */}
      {customAlert.visible && (
        <View style={[styles.alertBanner, customAlert.type === "error" ? styles.alertError : styles.alertSuccess]}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: 10 }}>
            {customAlert.type === "error" ? <AlertCircle size={20} color="#EF4444" /> : <CheckCircle size={20} color="#10B981" />}
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>{customAlert.title}</Text>
              <Text style={styles.alertMessage}>{customAlert.message}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={hideAlert} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.headerBox}>
          <View style={styles.badge}>
            <Briefcase size={13} color={BRAND_PURPLE} />
            <Text style={styles.badgeText}>Brainix Educator Onboarding</Text>
          </View>
          <Text style={styles.mainTitle}>Join as an Educator</Text>
          <Text style={styles.subTitle}>
            Verify your email or sign up instantly with Google to start accepting consultations.
          </Text>
        </View>

        {/* Google Signup Button */}
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleGoogleSignup}
          disabled={googleLoading}
          activeOpacity={0.8}
        >
          {googleLoading ? (
            <ActivityIndicator color="#0F172A" size="small" />
          ) : (
            <View style={styles.googleBtnContent}>
              <Text style={styles.googleIconText}>G</Text>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR REGISTER WITH EMAIL</Text>
          <View style={styles.line} />
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          
          {/* Email + Send OTP Action Row */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>OFFICIAL EMAIL ADDRESS</Text>
              {isOtpVerified && <Text style={styles.verifiedBadgeText}>✓ Verified</Text>}
            </View>

            <View style={styles.emailRow}>
              <View style={[styles.inputBox, { flex: 1, marginBottom: 0 }, isOtpVerified && styles.inputDisabled]}>
                <Mail size={16} color={isOtpVerified ? "#059669" : "#94A3B8"} />
                <TextInput
                  style={styles.input}
                  placeholder="teacher@brainix.ai"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isOtpVerified}
                />
              </View>

              {!isOtpVerified && (
                <TouchableOpacity
                  style={[styles.sendOtpBtn, (sendingOtp || timer > 0) && styles.btnDisabled]}
                  onPress={handleSendOtp}
                  disabled={sendingOtp || timer > 0}
                  activeOpacity={0.8}
                >
                  {sendingOtp ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.sendOtpBtnText}>
                      {timer > 0 ? `${timer}s` : isOtpSent ? "Resend" : "Send OTP"}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* OTP Verification Box */}
          {isOtpSent && !isOtpVerified && (
            <View style={styles.otpBoxContainer}>
              <Text style={styles.otpHeading}>ENTER 6-DIGIT VERIFICATION CODE</Text>
              <View style={styles.emailRow}>
                <View style={[styles.inputBox, { flex: 1, marginBottom: 0, backgroundColor: "#FFFFFF" }]}>
                  <KeyRound size={16} color={BRAND_PURPLE} />
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="123456"
                    placeholderTextColor="#94A3B8"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <TouchableOpacity
                  style={styles.verifyOtpBtn}
                  onPress={handleVerifyOtp}
                  disabled={verifyingOtp}
                  activeOpacity={0.8}
                >
                  {verifyingOtp ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.verifyOtpBtnText}>Verify OTP</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Remaining Fields */}
          <View style={[!isOtpVerified && { opacity: 0.45 }]}>
            
            {/* Full Name */}
            <Text style={styles.inputLabel}>FULL NAME / TITLE *</Text>
            <View style={styles.inputBox}>
              <User size={16} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="e.g. Dr. Mohammad Atif"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                editable={isOtpVerified}
              />
            </View>

            {/* Mobile Number */}
            <Text style={styles.inputLabel}>MOBILE NUMBER (FOR BOOKINGS) *</Text>
            <View style={styles.inputBox}>
              <Phone size={16} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210"
                placeholderTextColor="#94A3B8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={isOtpVerified}
              />
            </View>

            {/* Password */}
            <Text style={styles.inputLabel}>CREATE PASSWORD *</Text>
            <View style={styles.inputBox}>
              <Lock size={16} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="Minimum 6 characters"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={isOtpVerified}
              />
            </View>

            {/* Primary Subject */}
            <Text style={styles.inputLabel}>PRIMARY TEACHING SUBJECT *</Text>
            <View style={styles.inputBox}>
              <BookOpen size={16} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="e.g. Mathematics, Physics, Chemistry"
                placeholderTextColor="#94A3B8"
                value={subject}
                onChangeText={setSubject}
                editable={isOtpVerified}
              />
            </View>

            {/* Qualifications */}
            <Text style={styles.inputLabel}>ACADEMIC QUALIFICATIONS</Text>
            <View style={styles.inputBox}>
              <Award size={16} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="e.g. M.Sc, MCA, B.Ed"
                placeholderTextColor="#94A3B8"
                value={qualifications}
                onChangeText={setQualifications}
                editable={isOtpVerified}
              />
            </View>

            {/* Hourly Rate (₹) & Experience */}
            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>HOURLY FEE (₹) *</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.rupeeSymbol}>₹</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="499"
                    placeholderTextColor="#94A3B8"
                    value={hourlyRate}
                    onChangeText={setHourlyRate}
                    keyboardType="numeric"
                    editable={isOtpVerified}
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>EXP (YEARS)</Text>
                <View style={styles.inputBox}>
                  <Briefcase size={16} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="5"
                    placeholderTextColor="#94A3B8"
                    value={experience}
                    onChangeText={setExperience}
                    keyboardType="numeric"
                    editable={isOtpVerified}
                  />
                </View>
              </View>
            </View>

            {/* Teaching Mode Toggle */}
            <Text style={styles.inputLabel}>TEACHING MODE OFFERED</Text>
            <View style={styles.modeToggleRow}>
              <TouchableOpacity
                style={[styles.modeBtn, teachingMode === "online" && styles.modeBtnActive]}
                onPress={() => isOtpVerified && setTeachingMode("online")}
                disabled={!isOtpVerified}
              >
                <Text style={[styles.modeBtnText, teachingMode === "online" && styles.modeBtnTextActive]}>
                  Online Only
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeBtn, teachingMode === "home" && styles.modeBtnActive]}
                onPress={() => isOtpVerified && setTeachingMode("home")}
                disabled={!isOtpVerified}
              >
                <Text style={[styles.modeBtnText, teachingMode === "home" && styles.modeBtnTextActive]}>
                  Home Visits
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeBtn, teachingMode === "both" && styles.modeBtnActive]}
                onPress={() => isOtpVerified && setTeachingMode("both")}
                disabled={!isOtpVerified}
              >
                <Text style={[styles.modeBtnText, teachingMode === "both" && styles.modeBtnTextActive]}>
                  Both
                </Text>
              </TouchableOpacity>
            </View>

            {/* CTA Submit Button */}
            <TouchableOpacity
              style={[styles.registerBtn, (!isOtpVerified || registering) && styles.btnDisabled]}
              onPress={handleTeacherRegister}
              disabled={!isOtpVerified || registering}
              activeOpacity={0.88}
            >
              {registering ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.registerBtnText}>Complete Educator Registration</Text>
                  <ChevronRight size={18} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

          </View>

        </View>

        {/* Switch to Sign In */}
        <TouchableOpacity 
          style={styles.switchLink}
          onPress={() => setScreen("login")}
        >
          <Text style={styles.switchLinkText}>
            Already registered as an educator? <Text style={{ color: BRAND_PURPLE, fontWeight: "700" }}>Sign In</Text>
          </Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 99
  },
  alertSuccess: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0"
  },
  alertError: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5"
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2
  },
  alertMessage: {
    fontSize: 11.5,
    color: "#475569"
  },
  headerBox: {
    alignItems: "center",
    marginBottom: 16
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: BRAND_PURPLE_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BRAND_PURPLE_BORDER,
    marginBottom: 8
  },
  badgeText: {
    color: BRAND_PURPLE,
    fontSize: 11,
    fontWeight: "700"
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
    marginBottom: 4
  },
  subTitle: {
    fontSize: 12.5,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10
  },
  googleBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#64748B",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1
  },
  googleBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  googleIconText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#EA4335"
  },
  googleBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A"
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0"
  },
  orText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  inputGroup: {
    marginBottom: 12
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 4,
    marginLeft: 2
  },
  verifiedBadgeText: {
    color: "#059669",
    fontSize: 11.5,
    fontWeight: "800"
  },
  emailRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center"
  },
  sendOtpBtn: {
    backgroundColor: BRAND_PURPLE,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 85
  },
  sendOtpBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700"
  },
  otpBoxContainer: {
    backgroundColor: BRAND_PURPLE_LIGHT,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BRAND_PURPLE_BORDER
  },
  otpHeading: {
    fontSize: 10.5,
    fontWeight: "800",
    color: BRAND_PURPLE,
    letterSpacing: 0.6,
    marginBottom: 6
  },
  otpInput: {
    letterSpacing: 4,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center"
  },
  verifyOtpBtn: {
    backgroundColor: "#059669",
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 85
  },
  verifyOtpBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700"
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 12,
    gap: 8
  },
  rupeeSymbol: {
    fontSize: 16,
    fontWeight: "800",
    color: BRAND_PURPLE,
    marginLeft: 2
  },
  inputDisabled: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0"
  },
  input: {
    flex: 1,
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "600"
  },
  rowInputs: {
    flexDirection: "row",
    gap: 10
  },
  modeToggleRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 16
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    backgroundColor: "#F8FAFC"
  },
  modeBtnActive: {
    borderColor: BRAND_PURPLE,
    backgroundColor: BRAND_PURPLE_LIGHT
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B"
  },
  modeBtnTextActive: {
    color: BRAND_PURPLE,
    fontWeight: "700"
  },
  registerBtn: {
    backgroundColor: BRAND_PURPLE,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: BRAND_PURPLE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 4
  },
  btnDisabled: {
    opacity: 0.55
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  registerBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700"
  },
  switchLink: {
    alignItems: "center",
    marginTop: 16
  },
  switchLinkText: {
    fontSize: 12.5,
    color: "#64748B"
  }
});