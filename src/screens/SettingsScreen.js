import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BRAND_PURPLE = '#6C4DFF';

export default function SettingsScreen({ setScreen }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('profile')} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Ionicons name="construct-outline" size={40} color={BRAND_PURPLE} style={{ marginBottom: 12 }} />
          <Text style={styles.title}>Settings Under Maintenance</Text>
          <Text style={styles.subText}>App preferences and customization options will be available here soon.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 },
  header: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  content: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', width: '100%', maxWidth: 340, shadowColor: '#64748B', shadowOpacity: 0.04, shadowRadius: 10, elevation: 1 },
  title: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  subText: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18 }
});