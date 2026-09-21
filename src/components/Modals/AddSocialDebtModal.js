import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SocialDebtType } from '../../models/types';
import { parseCurrencyInput } from '../../utils/currencyFormatter';

export const AddSocialDebtModal = ({ visible, onClose, onSave }) => {
  const [type, setType] = useState(SocialDebtType.THEY_OWE_ME);
  const [personName, setPersonName] = useState('');
  const [concept, setConcept] = useState('');
  const [amountText, setAmountText] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = () => {
    const amount = parseCurrencyInput(amountText);

    if (!personName.trim()) {
      Alert.alert('Falta información', 'Ingresa el nombre de la persona.');
      return;
    }
    if (!concept.trim()) {
      Alert.alert('Falta información', 'Indica el motivo o favor (ej. Compra en el súper).');
      return;
    }
    if (amount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa el monto del favor o préstamo.');
      return;
    }

    const newItem = {
      id: `soc_${Date.now()}`,
      personName: personName.trim(),
      type,
      concept: concept.trim(),
      totalAmount: amount,
      paidAmount: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      phone: phone.trim(),
      receiptUri: null,
    };

    onSave(newItem);

    // Reset
    setPersonName('');
    setConcept('');
    setAmountText('');
    setPhone('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Registrar Favor o Préstamo</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Selector de Tipo */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === SocialDebtType.THEY_OWE_ME && styles.typeTabActiveGreen,
                ]}
                onPress={() => setType(SocialDebtType.THEY_OWE_ME)}
              >
                <Ionicons
                  name="arrow-down-circle"
                  size={16}
                  color={type === SocialDebtType.THEY_OWE_ME ? '#FFFFFF' : '#10B981'}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    type === SocialDebtType.THEY_OWE_ME && styles.typeTabTextActive,
                  ]}
                >
                  Me Deben Dinero
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === SocialDebtType.I_OWE_THEM && styles.typeTabActiveRed,
                ]}
                onPress={() => setType(SocialDebtType.I_OWE_THEM)}
              >
                <Ionicons
                  name="arrow-up-circle"
                  size={16}
                  color={type === SocialDebtType.I_OWE_THEM ? '#FFFFFF' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    type === SocialDebtType.I_OWE_THEM && styles.typeTabTextActive,
                  ]}
                >
                  Yo Debo a Alguien
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>¿A quién?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Hermano, Carlos, Mamá, Pedro"
              value={personName}
              onChangeText={setPersonName}
            />

            <Text style={styles.label}>¿Por qué concepto?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Compra de supermercado, Almuerzo, Uber"
              value={concept}
              onChangeText={setConcept}
            />

            <Text style={styles.label}>Monto</Text>
            <View style={styles.currencyWrap}>
              <Text style={styles.prefix}>$</Text>
              <TextInput
                style={styles.currencyInput}
                keyboardType="numeric"
                placeholder="15000"
                value={amountText}
                onChangeText={setAmountText}
              />
            </View>

            <Text style={styles.label}>Teléfono celular (opcional para WhatsApp)</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="Ej. +56912345678"
              value={phone}
              onChangeText={setPhone}
            />

            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: type === SocialDebtType.THEY_OWE_ME ? '#10B981' : '#EF4444' },
              ]}
              onPress={handleSubmit}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Guardar Registro</Text>
            </TouchableOpacity>
          </ScrollView>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  closeBtn: {
    padding: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  typeTabActiveGreen: {
    backgroundColor: '#10B981',
  },
  typeTabActiveRed: {
    backgroundColor: '#EF4444',
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  typeTabTextActive: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  currencyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  prefix: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
    marginRight: 4,
  },
  currencyInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 20,
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
