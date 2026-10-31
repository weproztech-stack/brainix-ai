import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mail, Lock, User, BookOpen, Eye, EyeOff, Sparkles, CheckCircle, AlertCircle } from 'lucide-react-native';
import { apiFetch } from '../services/api';

const BRAND_PURPLE = '#6C4DFF';

export default function RegisterScreen({ setScreen, setUserRole }) {
  // Form States
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Flow & OTP States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [timer, setTimer] = useState(0);

  // Loading States
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [registering, setRegistering] = useState(false);

  // Professional Branded Popup Modal States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'success' });

  const showAlert = (title, message, type = 'success') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
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

  // 1. STEP 1: Send OTP to Email
  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      showAlert('Invalid Email', 'Please enter a valid email address to receive your OTP.', 'error');
      return;
    }

    setSendingOtp(true);
    try {
      const data = await apiFetch('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (data && data.success) {
        setIsOtpSent(true);
        setTimer(60); // 60s cooldown
        showAlert('OTP Sent 📬', 'A 6-digit verification code has been dispatched to your email.');
      } else {
        showAlert('Notice', data?.message || 'Failed to send OTP. Please check email.', 'error');
      }
    } catch (error) {
      showAlert('Network Error', 'Unable to connect to server. Please check internet connection.', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  // 2. STEP 2: Verify Entered OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.trim().length < 6) {
      showAlert('Invalid Code', 'Please enter the full 6-digit OTP code.', 'error');
      return;
    }

    setVerifyingOtp(true);
    try {
      const data = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      if (data && data.success) {
        setIsOtpVerified(true);
        showAlert('Verified! ✅', 'Email verified successfully. Complete your profile below.');
      } else {
        showAlert('Verification Failed', data?.message || 'Invalid or expired OTP code.', 'error');
      }
    } catch (error) {
      showAlert('Error', 'Could not verify code. Please try again.', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // 3. STEP 3: Final Account Creation
  const handleRegister = async () => {
    if (!isOtpVerified) {
      showAlert('Verify Email', 'Please verify your email via OTP before submitting.', 'error');
      return;
    }

    if (!name.trim() || !classGrade.trim() || !password) {
      showAlert('Missing Info', 'Please enter your name, class/grade, and choose a password.', 'error');
      return;
    }

    setRegistering(true);
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: 'student',
          grade: classGrade.trim(),
          password,
        }),
      });

      if (data && data.success) {
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        await AsyncStorage.setItem('userRole', 'student');
        if (setUserRole) setUserRole('student');

        showAlert('🎉 Welcome!', 'Your student account is now ready.');
        setScreen('home');
      } else {
        showAlert('Registration Failed', data?.message || 'Could not complete signup.', 'error');
      }
    } catch (error) {
      showAlert('Network Error', 'Server communication failure during signup.', 'error');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.brandBadge}>
              <Sparkles size={13} color="#6C4DFF" style={{ marginRight: 5 }} />
              <Text style={styles.brandBadgeText}>Brainix AI • Student</Text>
            </View>
            <Text style={styles.title}>Student Sign Up</Text>
            <Text style={styles.subtitle}>
              Verify your email and unlock AI homework solvers & mock tests.
            </Text>
          </View>

          {/* Form Fields Container */}
          <View style={styles.formContainer}>
            
            {/* Email + Send OTP Action Row */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Email Address</Text>
                {isOtpVerified && <Text style={styles.verifiedBadgeText}>✓ Verified</Text>}
              </View>

              <View style={styles.emailRow}>
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Mail size={17} color="#94A3B8" style={styles.leftIcon} />
                  <TextInput
                    style={[styles.inputWithIcon, isOtpVerified && styles.inputDisabled]}
                    placeholder="name@example.com"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
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
                        {timer > 0 ? `${timer}s` : isOtpSent ? 'Resend' : 'Send OTP'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* OTP Input Row */}
            {isOtpSent && !isOtpVerified && (
              <View style={styles.otpBoxContainer}>
                <Text style={styles.otpLabel}>ENTER 6-DIGIT OTP CODE</Text>
                <View style={styles.emailRow}>
                  <TextInput
                    style={[styles.inputBase, styles.otpInput]}
                    placeholder="123456"
                    placeholderTextColor="#94A3B8"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />

                  <TouchableOpacity
                    style={styles.verifyOtpBtn}
                    onPress={handleVerifyOtp}
                    disabled={verifyingOtp}
                    activeOpacity={0.8}
                  >
                    {verifyingOtp ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.verifyOtpBtnText}>Verify</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Remaining Fields (Active once Verified) */}
            <View style={[!isOtpVerified && { opacity: 0.45 }]}>
              
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <User size={17} color="#94A3B8" style={styles.leftIcon} />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="Enter your full name"
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={setName}
                    editable={isOtpVerified}
                  />
                </View>
              </View>

              {/* Class / Grade */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Class / Target Exam</Text>
                <View style={styles.inputWrapper}>
                  <BookOpen size={17} color="#94A3B8" style={styles.leftIcon} />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="e.g. Class 10 CBSE, 12th JEE, BCA, NEET"
                    placeholderTextColor="#94A3B8"
                    value={classGrade}
                    onChangeText={setClassGrade}
                    editable={isOtpVerified}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Create Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={17} color="#94A3B8" style={styles.leftIcon} />
                  <TextInput
                    style={[styles.inputWithIcon, { paddingRight: 45 }]}
                    placeholder="Create a strong password"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={isOtpVerified}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="#64748B" />
                    ) : (
                      <Eye size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Final Submit Button */}
              <TouchableOpacity
                style={[styles.registerBtn, (!isOtpVerified || registering) && styles.btnDisabled]}
                onPress={handleRegister}
                disabled={!isOtpVerified || registering}
                activeOpacity={0.88}
              >
                {registering ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.registerBtnText}>Create Student Account</Text>
                )}
              </TouchableOpacity>

            </View>
          </View>

          {/* Switch to Login */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already registered? </Text>
            <TouchableOpacity onPress={() => setScreen('login')} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Professional Branded Popup Modal */}
      <Modal transparent visible={alertVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.iconCircle, { backgroundColor: alertConfig.type === 'error' ? '#FEF2F2' : '#ECFDF5' }]}>
              {alertConfig.type === 'error' ? (
                <AlertCircle size={30} color="#EF4444" />
              ) : (
                <CheckCircle size={30} color="#059669" />
              )}
            </View>
            <Text style={styles.modalTitle}>{alertConfig.title}</Text>
            <Text style={styles.modalMessage}>{alertConfig.message}</Text>
            <TouchableOpacity 
              style={styles.modalBtn} 
              onPress={() => setAlertVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalBtnText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    justifyContent: 'center',
    paddingVertical: 28,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 77, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 77, 255, 0.22)',
    marginBottom: 12,
  },
  brandBadgeText: {
    color: '#6C4DFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: '#334155',
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  verifiedBadgeText: {
    color: '#059669',
    fontSize: 11.5,
    fontWeight: '800',
  },
  emailRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  sendOtpBtn: {
    backgroundColor: '#6C4DFF',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
  },
  sendOtpBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  otpBoxContainer: {
    backgroundColor: 'rgba(108, 77, 255, 0.05)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(108, 77, 255, 0.2)',
  },
  otpLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#6C4DFF',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  otpInput: {
    flex: 1,
    letterSpacing: 4,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 48,
  },
  verifyOtpBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 18,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  verifyOtpBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  leftIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  inputWithIcon: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingLeft: 42,
    paddingRight: 16,
    height: 48,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  registerBtn: {
    backgroundColor: '#6C4DFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#6C4DFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#64748B',
    fontSize: 13.5,
  },
  loginLink: {
    color: '#6C4DFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  // Modal Popup Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalBtn: {
    width: '100%',
    backgroundColor: BRAND_PURPLE,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: BRAND_PURPLE,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});