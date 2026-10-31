import React, { useState } from 'react';
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
import { Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle, AlertCircle } from 'lucide-react-native';
import { apiFetch } from '../services/api';

const BRAND_PURPLE = '#6C4DFF';

export default function LoginScreen({ setScreen, setUserRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Professional Custom Alert States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'success' });

  const showAlert = (title, message, type = 'success') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showAlert('Missing Credentials', 'Please enter your email and password to continue.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (data && data.success && data.token) {
        const detectedRole = data.user?.role === 'teacher' ? 'teacher' : 'student';

        // Save token, user data, and role
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        await AsyncStorage.setItem('userRole', detectedRole);

        if (setUserRole) setUserRole(detectedRole);

        // Auto-route based on role
        if (detectedRole === 'teacher') {
          setScreen('teacher_home');
        } else {
          setScreen('home');
        }
      } else {
        showAlert('Authentication Failed', data?.message || 'Invalid email or password.', 'error');
      }
    } catch (error) {
      showAlert('Network Error', 'Unable to connect to the server. Please check your network.', 'error');
    } finally {
      setLoading(false);
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
          {/* Header Branding Section */}
          <View style={styles.headerContainer}>
            <View style={styles.brandBadge}>
              <Sparkles size={13} color="#6C4DFF" style={{ marginRight: 5 }} />
              <Text style={styles.brandBadgeText}>Brainix AI</Text>
            </View>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>
              Sign in to access your study dashboard or educator desk.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color="#94A3B8" style={styles.leftIcon} />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Field with Toggle */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity
                  onPress={() =>
                    showAlert(
                      'Reset Password',
                      'Password reset instructions have been sent to your email or contact support.'
                    )
                  }
                >
                  <Text style={styles.forgotLink}>Forgot?</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.passwordContainer}>
                <Lock size={18} color="#94A3B8" style={styles.leftIcon} />
                <TextInput
                  style={[styles.inputWithIcon, { paddingRight: 45 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#64748B" />
                  ) : (
                    <Eye size={18} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Switch to Registration */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => setScreen('role_select')} activeOpacity={0.7}>
              <Text style={styles.registerLink}>Create one</Text>
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
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 77, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 77, 255, 0.25)',
    marginBottom: 16,
  },
  brandBadgeText: {
    color: '#6C4DFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  forgotLink: {
    color: '#6C4DFF',
    fontSize: 12,
    fontWeight: '600',
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordContainer: {
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
    borderRadius: 14,
    paddingLeft: 42,
    paddingRight: 16,
    paddingVertical: 14,
    color: '#0F172A',
    fontSize: 15,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    padding: 6,
  },
  loginBtn: {
    backgroundColor: '#6C4DFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#6C4DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 36,
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
  },
  registerLink: {
    color: '#6C4DFF',
    fontSize: 14,
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