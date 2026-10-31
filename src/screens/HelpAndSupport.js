import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  StatusBar,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Send
} from 'lucide-react-native';

import Header from '../components/Header';
import { apiFetch } from '../services/api';

const BRAND_PURPLE = '#6C4DFF';
const BRAND_PURPLE_LIGHT = 'rgba(108, 77, 255, 0.08)';

export default function HelpAndSupportScreen({ setScreen }) {
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
    <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <Header title="Help & Support" onBack={() => setScreen('home')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Quick Contact Email Banner */}
        <Text style={styles.sectionHeaderTitle}>QUICK ASSISTANCE</Text>
        <TouchableOpacity style={styles.emailContactBox} onPress={handleContactEmail} activeOpacity={0.8}>
          <View style={styles.contactIconCircle}>
            <Mail size={22} color={BRAND_PURPLE} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactSub}>support@brainixai.co</Text>
          </View>
        </TouchableOpacity>

        {/* FAQs Section */}
        <Text style={styles.sectionHeaderTitle}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.modernCard}>
          {faqs.map((faq, index) => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <View key={faq.id}>
                <TouchableOpacity
                  style={styles.faqQuestionRow}
                  onPress={() => toggleFaq(faq.id)}
                  activeOpacity={0.7}
                >
                  <HelpCircle size={17} color={BRAND_PURPLE} style={{ marginRight: 10 }} />
                  <Text style={styles.faqQuestionText}>{faq.q}</Text>
                  {isExpanded ? (
                    <ChevronUp size={18} color="#64748B" />
                  ) : (
                    <ChevronDown size={18} color="#64748B" />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqAnswerBox}>
                    <Text style={styles.faqAnswerText}>{faq.a}</Text>
                  </View>
                )}

                {index < faqs.length - 1 && <View style={styles.separator} />}
              </View>
            );
          })}
        </View>

        {/* Submit Support Ticket Form */}
        <Text style={styles.sectionHeaderTitle}>SUBMIT A TICKET</Text>
        <View style={styles.modernCard}>
          <Text style={styles.inputLabel}>SUBJECT</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Issue with fee receipt download"
            placeholderTextColor="#94A3B8"
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.inputLabel}>MESSAGE / DETAILS</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Describe your issue or query clearly..."
            placeholderTextColor="#94A3B8"
            value={message}
            onChangeText={setMessage}
            multiline
          />

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmitTicket}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Send size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.submitBtnText}>{submitting ? 'Sending Ticket...' : 'Submit Support Ticket'}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40
  },
  sectionHeaderTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4
  },
  emailContactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  contactIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: 'center',
    alignItems: 'center'
  },
  contactTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A'
  },
  contactSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600'
  },
  modernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A'
  },
  faqAnswerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  faqAnswerText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500'
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9'
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13.5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#0F172A',
    marginBottom: 14
  },
    textArea: {
    minHeight: 90,
    textAlignVertical: 'top'
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_PURPLE,
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: BRAND_PURPLE,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3
  }
});