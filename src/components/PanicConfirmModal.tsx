import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { t } from '../i18n';

interface Props {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PanicConfirmModal({ visible, onConfirm, onCancel }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Ionicons name="warning" size={48} color={Colors.emergency} style={styles.icon} />
          <Text style={styles.title}>{t('panic.confirmTitle')}</Text>
          <Text style={styles.warning}>{t('panic.confirmWarning')}</Text>
          <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
            <Text style={styles.confirmText}>{t('panic.confirmBtn')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>{t('panic.cancelBtn')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  icon: { marginBottom: 12 },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.emergency,
    textAlign: 'center',
    marginBottom: 12,
  },
  warning: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'left',
  },
  confirmBtn: {
    backgroundColor: Colors.emergency,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cancelBtn: {
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  cancelText: { color: '#1e293b', fontWeight: '600', fontSize: 16 },
});
