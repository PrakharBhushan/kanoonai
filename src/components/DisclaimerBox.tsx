import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { t } from '../i18n';

export default function DisclaimerBox() {
  return (
    <View style={styles.box}>
      <Ionicons name="warning" size={18} color={Colors.emergency} style={styles.icon} />
      <Text style={styles.text}>{t('emergency.disclaimer')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1.5, borderColor: Colors.emergency, borderRadius: 10,
    padding: 12, flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#fff5f5', marginVertical: 12,
  },
  icon: { marginRight: 8, marginTop: 1 },
  text: { flex: 1, color: Colors.emergency, fontSize: 12, lineHeight: 18 },
});
