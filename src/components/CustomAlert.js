import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BRAND_PURPLE = '#6C4DFF';

export default function CustomAlert({ visible, title, message, type = 'success', onClose }) {
  const isSuccess = type === 'success';

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={[styles.iconCircle, { backgroundColor: isSuccess ? '#ECFDF5' : '#FEF2F2' }]}>
            <Ionicons 
              name={isSuccess ? "checkmark-circle" : "alert-circle"} 
              size={32} 
              color={isSuccess ? "#059669" : "#EF4444"} 
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Okay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
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
    elevation: 5
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8
  },
  message: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20
  },
  button: {
    width: '100%',
    backgroundColor: BRAND_PURPLE,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: BRAND_PURPLE,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  }
});