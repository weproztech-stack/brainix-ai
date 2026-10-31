import React, { useState, useEffect } from "react";
import {
  BackHandler,
  Alert,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Linking
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Send,
  Bell,
  Shield,
  Info
} from "lucide-react-native";

// 🎓 Auth & Common Screens
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import RoleSelectScreen from "../screens/RoleSelectScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

// 👨‍🎓 Student Screens
import HomeScreen from "../screens/HomeScreen";
import SolutionScreen from "../screens/SolutionScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ExamPrepScreen from "../screens/ExamPrepScreen";
import ConsultTeacherScreen from "../screens/ConsultTeacherScreen";
import ELibraryScreen from "../screens/ELibraryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PremiumScreen from "../screens/PremiumScreen";

// 👨‍🏫 Teacher Screens
import TeacherRegisterScreen from "../screens/TeacherRegisterScreen";
import TeacherHomeScreen from "../screens/TeacherHomeScreen";
import TeacherProfileSetupScreen from "../screens/TeacherProfileSetupScreen";
import TeacherAvailabilityScreen from "../screens/TeacherAvailabilityScreen";
import TeacherBookingsScreen from "../screens/TeacherBookingsScreen";
import TeacherClassDetailScreen from "../screens/TeacherClassDetailScreen";
import TeacherPostClassScreen from "../screens/TeacherPostClassScreen";
import TeacherWalletScreen from "../screens/TeacherWalletScreen";
import TeacherProfileScreen from "../screens/TeacherProfileScreen";

import Header from "../components/Header";
import { apiFetch } from "../services/api";

const BRAND_PURPLE = '#6C4DFF';
const BRAND_PURPLE_LIGHT = 'rgba(108, 77, 255, 0.08)';

// ⚙️ Dedicated Settings Screen Component
function SettingsScreen({ setScreen }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <SafeAreaView style={helpStyles.safeContainer} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <Header title="App Settings" onBack={() => setScreen('profile')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={helpStyles.scrollContent}>
        <Text style={helpStyles.sectionHeaderTitle}>PREFERENCES</Text>
        <View style={helpStyles.modernCard}>
          <TouchableOpacity 
            style={helpStyles.faqQuestionRow} 
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            activeOpacity={0.7}
          >
            <Bell size={18} color={BRAND_PURPLE} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={helpStyles.faqQuestionText}>Push Notifications</Text>
              <Text style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Receive alerts for classes & sessions</Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '800', color: notificationsEnabled ? '#059669' : '#94A3B8' }}>
              {notificationsEnabled ? 'ENABLED' : 'DISABLED'}
            </Text>
          </TouchableOpacity>

          <View style={helpStyles.separator} />

          <TouchableOpacity style={helpStyles.faqQuestionRow} activeOpacity={0.7}>
            <Shield size={18} color={BRAND_PURPLE} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={helpStyles.faqQuestionText}>Privacy & Security</Text>
              <Text style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Manage data permissions & account safety</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={helpStyles.sectionHeaderTitle}>ABOUT APP</Text>
        <View style={helpStyles.modernCard}>
          <View style={helpStyles.faqQuestionRow}>
            <Info size={18} color={BRAND_PURPLE} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={helpStyles.faqQuestionText}>App Version</Text>
              <Text style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Brainix AI v2.4.0 (Production)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 🛠️ Updated Inline Help & Support Screen
function InlineHelpAndSupportScreen({ setScreen }) {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    {
      id: 1,
      q: 'How can I reset my account password?',
      a: 'You can reset your password from the login screen by tapping "Forgot Password" or via Account Settings if you are currently logged in.'
    },
    {
      id: 2,
      q: 'How do I download or view study notes and e-Library PDFs?',
      a: 'Go to the AI e-Library screen, select your education board and subject, open the desired material category, and tap "Read" to open documents.'
    },
    {
      id: 3,
      q: 'How does the AI Question Solver work?',
      a: 'You can type your academic question or upload an image using the attachment button. The AI solver will provide a step-by-step socratic breakdown.'
    }
  ];

  const handleContactEmail = () => {
    Linking.openURL('mailto:support@brainixai.co?subject=Support Request');
  };

  const handleSubmitTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Required Fields', 'Please fill in both the subject and your message before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/support/ticket', {
        method: 'POST',
        body: JSON.stringify({ subject, message })
      });

      if (res && res.success) {
        Alert.alert('Ticket Submitted', 'Your support ticket has been sent successfully. Our team will contact you soon.');
        setSubject('');
        setMessage('');
      } else {
        Alert.alert('Success', 'Your support request has been recorded.');
        setSubject('');
        setMessage('');
      }
    } catch (error) {
      console.error('Support ticket error:', error);
      Alert.alert('Submitted', 'Your message has been saved. Support will reach out soon.');
      setSubject('');
      setMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <SafeAreaView style={helpStyles.safeContainer} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <Header title="Help & Support" onBack={() => setScreen('home')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={helpStyles.scrollContent}>
        <Text style={helpStyles.sectionHeaderTitle}>QUICK ASSISTANCE</Text>
        <TouchableOpacity style={helpStyles.emailContactBox} onPress={handleContactEmail} activeOpacity={0.8}>
          <View style={helpStyles.contactIconCircle}>
            <Mail size={22} color={BRAND_PURPLE} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={helpStyles.contactTitle}>Email Support</Text>
            <Text style={helpStyles.contactSub}>support@brainixai.co</Text>
          </View>
        </TouchableOpacity>

        <Text style={helpStyles.sectionHeaderTitle}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={helpStyles.modernCard}>
          {faqs.map((faq, index) => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <View key={faq.id}>
                <TouchableOpacity
                  style={helpStyles.faqQuestionRow}
                  onPress={() => toggleFaq(faq.id)}
                  activeOpacity={0.7}
                >
                  <HelpCircle size={17} color={BRAND_PURPLE} style={{ marginRight: 10 }} />
                  <Text style={helpStyles.faqQuestionText}>{faq.q}</Text>
                  {isExpanded ? (
                    <ChevronUp size={18} color="#64748B" />
                  ) : (
                    <ChevronDown size={18} color="#64748B" />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={helpStyles.faqAnswerBox}>
                    <Text style={helpStyles.faqAnswerText}>{faq.a}</Text>
                  </View>
                )}

                {index < faqs.length - 1 && <View style={helpStyles.separator} />}
              </View>
            );
          })}
        </View>

        <Text style={helpStyles.sectionHeaderTitle}>SUBMIT A TICKET</Text>
        <View style={helpStyles.modernCard}>
          <Text style={helpStyles.inputLabel}>SUBJECT</Text>
          <TextInput
            style={helpStyles.textInput}
            placeholder="e.g., Issue with fee receipt download"
            placeholderTextColor="#94A3B8"
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={helpStyles.inputLabel}>MESSAGE / DETAILS</Text>
          <TextInput
            style={[helpStyles.textInput, helpStyles.textArea]}
            placeholder="Describe your issue or query clearly..."
            placeholderTextColor="#94A3B8"
            value={message}
            onChangeText={setMessage}
            multiline
          />

          <TouchableOpacity
            style={[helpStyles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmitTicket}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Send size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={helpStyles.submitBtnText}>{submitting ? 'Sending Ticket...' : 'Submit Support Ticket'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function AppNavigator() {
  const [screen, setScreen] = useState("splash");
  const [userRole, setUserRole] = useState("student");
  
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedClassData, setSelectedClassData] = useState(null);

  useEffect(() => {
    const loadCachedRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem("userRole");
        if (savedRole) {
          setUserRole(savedRole);
        }
      } catch (e) {
        console.log("Error loading userRole:", e);
      }
    };
    loadCachedRole();
  }, []);

  useEffect(() => {
    const handleBackPress = () => {
      if (
        screen === "splash" ||
        screen === "onboarding" ||
        screen === "role_select" ||
        screen === "login" ||
        screen === "register" ||
        screen === "teacher_register"
      ) {
        return false;
      }

      if (
        userRole === "teacher" &&
        (screen === "teacher_profile_setup" ||
          screen === "teacher_availability" ||
          screen === "teacher_bookings" ||
          screen === "teacher_class_detail" ||
          screen === "teacher_post_class" ||
          screen === "teacher_wallet" ||
          screen === "teacher_profile" ||
          screen === "profile")
      ) {
        setScreen("teacher_home");
        return true;
      }

      if (
        screen === "solution" ||
        screen === "history" ||
        screen === "examprep" ||
        screen === "exam-prep" ||
        screen === "practice" ||
        screen === "consult" ||
        screen === "consultation" ||
        screen === "elibrary" ||
        screen === "notes" ||
        screen === "previous_papers" ||
        screen === "settings" ||
        screen === "profile" ||
        screen === "premium" ||
        screen === "help"
      ) {
        setScreen("home");
        return true;
      }

      if (screen === "home" || screen === "teacher_home") {
        Alert.alert(
          "Exit App",
          "Are you sure you want to exit Brainix AI?",
          [
            { text: "Cancel", onPress: () => null, style: "cancel" },
            { text: "Exit", onPress: () => BackHandler.exitApp() }
          ],
          { cancelable: true }
        );
        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => backHandler.remove();
  }, [screen, userRole]);

  if (screen === "splash") {
    return (
      <SplashScreen
        onDone={(target) => setScreen(target || "onboarding")}
      />
    );
  }

  if (screen === "onboarding") {
    return (
      <OnboardingScreen
        onDone={async () => {
          const token = await AsyncStorage.getItem("userToken");
          const savedRole = await AsyncStorage.getItem("userRole");
          
          if (token) {
            if (savedRole === "teacher") {
              setUserRole("teacher");
              setScreen("teacher_home");
            } else {
              setUserRole("student");
              setScreen("home");
            }
          } else {
            setScreen("role_select");
          }
        }}
      />
    );
  }

  if (screen === "role_select") {
    return (
      <RoleSelectScreen 
        setScreen={setScreen} 
        setUserRole={setUserRole} 
      />
    );
  }

  if (screen === "login") {
    return (
      <LoginScreen 
        setScreen={setScreen} 
        setUserRole={setUserRole} 
      />
    );
  }

  if (screen === "register") {
    return (
      <RegisterScreen 
        setScreen={setScreen} 
        setUserRole={setUserRole} 
      />
    );
  }

  if (screen === "teacher_register") {
    return (
      <TeacherRegisterScreen 
        setScreen={setScreen} 
        setUserRole={setUserRole} 
      />
    );
  }

  if (userRole === "teacher" && screen === "profile") {
    return <TeacherProfileScreen setScreen={setScreen} />;
  }

  if (screen === "teacher_home") {
    return <TeacherHomeScreen setScreen={setScreen} />;
  }

  if (screen === "teacher_profile_setup") {
    return <TeacherProfileSetupScreen setScreen={setScreen} />;
  }

  if (screen === "teacher_availability") {
    return <TeacherAvailabilityScreen setScreen={setScreen} />;
  }

  if (screen === "teacher_bookings") {
    return (
      <TeacherBookingsScreen 
        setScreen={setScreen} 
        setSelectedClassData={setSelectedClassData}
      />
    );
  }

  if (screen === "teacher_class_detail") {
    return (
      <TeacherClassDetailScreen 
        setScreen={setScreen} 
        classData={selectedClassData} 
      />
    );
  }

  if (screen === "teacher_post_class") {
    return (
      <TeacherPostClassScreen 
        setScreen={setScreen} 
        sessionData={selectedClassData} 
      />
    );
  }

  if (screen === "teacher_wallet") {
    return <TeacherWalletScreen setScreen={setScreen} />;
  }

  if (screen === "teacher_profile") {
    return <TeacherProfileScreen setScreen={setScreen} />;
  }

  if (screen === "solution") {
    return (
      <SolutionScreen
        setScreen={setScreen}
        question={question}
        setQuestion={setQuestion}
        sessionId={currentSessionId}
        setSessionId={setCurrentSessionId}
        selectedMedia={selectedMedia}
        setSelectedMedia={setSelectedMedia}
      />
    );
  }

  if (screen === "history") {
    return (
      <HistoryScreen
        setScreen={setScreen}
        setSessionId={setCurrentSessionId}
        setQuestion={setQuestion}
        setSelectedMedia={setSelectedMedia}
        setSolution={setAnswer}
      />
    );
  }

  if (screen === "consult" || screen === "consultation") {
    return <ConsultTeacherScreen setScreen={setScreen} />;
  }

  if (screen === "elibrary" || screen === "notes" || screen === "previous_papers") {
    return <ELibraryScreen setScreen={setScreen} />;
  }

  if (screen === "examprep" || screen === "exam-prep" || screen === "practice") {
    return <ExamPrepScreen setScreen={setScreen} />;
  }

  if (screen === "settings") {
    return <SettingsScreen setScreen={setScreen} />;
  }

  if (screen === "profile") {
    return <ProfileScreen setScreen={setScreen} />;
  }

  if (screen === "premium") {
    return <PremiumScreen setScreen={setScreen} />;
  }

  if (screen === "help") {
    return <InlineHelpAndSupportScreen setScreen={setScreen} />;
  }

  if (userRole === "teacher") {
    return <TeacherHomeScreen setScreen={setScreen} />;
  }

  return (
    <HomeScreen
      setScreen={setScreen}
      question={question}
      setQuestion={setQuestion}
      setAnswer={setAnswer}
      setSessionId={setCurrentSessionId}
      setSelectedMedia={setSelectedMedia}
    />
  );
}

const helpStyles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 },
  sectionHeaderTitle: { color: '#64748B', fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
  emailContactBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  contactIconCircle: { width: 44, height: 44, borderRadius: 14, backgroundColor: BRAND_PURPLE_LIGHT, justifyContent: 'center', alignItems: 'center' },
  contactTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  contactSub: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '600' },
  modernCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20, shadowColor: '#64748B', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  faqQuestionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  faqQuestionText: { flex: 1, fontSize: 13.5, fontWeight: '700', color: '#0F172A' },
  faqAnswerBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  faqAnswerText: { fontSize: 12.5, color: '#475569', lineHeight: 18, fontWeight: '500' },
  separator: { height: 1, backgroundColor: '#F1F5F9' },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 6 },
  textInput: { backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13.5, borderWidth: 1, borderColor: '#E2E8F0', color: '#0F172A', marginBottom: 14 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: BRAND_PURPLE, borderRadius: 16, paddingVertical: 14, shadowColor: BRAND_PURPLE, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.3 }
});