import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, parseCurrencyInput } from '../../utils/currencyFormatter';

export const AddContributionModal = ({ visible, goal, onClose, onConfirmDeposit }) => {
  if (!goal) return null;

  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = () => {
    const parsed = parseCurrencyInput(amountText);
    if (parsed <= 0) {
      Alert.alert('Monto requerido', 'Por favor ingresa un monto válido a aportar.');
      return;
    }

    onConfirmDeposit({
      amount: parsed,
      note: note.trim() || 'Aporte a la meta',
    });

    setAmountText('');
    setNote('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Abonar a tu Meta 🚀</Text>
              <Text style={styles.subtitle}>{goal.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              Te faltan <Text style={styles.bold}>{formatCurrency(remaining)}</Text> para cumplir tu meta.
            </Text>
          </View>

          {/* Input de monto */}
          <Text style={styles.label}>¿Cuánto vas a ahorrar hoy?</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.currencyPrefix}>$</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              placeholder="50000"
              value={amountText}
              onChangeText={setAmountText}
            />
          </View>

          {/* Opciones rápidas de ahorro */}
          <View style={styles.quickAmounts}>
            {[10000, 25000, 50000, 100000].map((val) => (
              <TouchableOpacity
                key={val}
                style={styles.quickChip}
                onPress={() => setAmountText(val.toString())}
              >
                <Text style={styles.quickChipText}>+{formatCurrency(val)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nota motivacional */}
          <Text style={styles.label}>Nota o motivo (opcional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Ej. Ahorro de la semana, propina o bono"
            value={note}
            onChangeText={setNote}
          />

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>¡Sumar a mi Progreso!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  infoBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#065F46',
  },
  bold: {
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4B5563',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    paddingVertical: 10,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  noteInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
