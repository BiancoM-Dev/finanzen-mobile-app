import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BillCategory } from '../../models/types';
import { parseCurrencyInput } from '../../utils/currencyFormatter';

export const AddBillModal = ({ visible, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(BillCategory.LUZ);
  const [amountText, setAmountText] = useState('');
  const [dueDayText, setDueDayText] = useState('15');
  const [isSplit, setIsSplit] = useState(false);
  const [membersText, setMembersText] = useState('Yo, Hermano');

  const handleSubmit = () => {
    const amount = parseCurrencyInput(amountText);
    const dueDay = parseInt(dueDayText, 10) || 1;

    if (!name.trim()) {
      Alert.alert('Falta información', 'Ingresa el nombre del servicio o cuenta.');
      return;
    }
    if (amount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa el monto estimado del mes.');
      return;
    }

    let splitMembers = [];
    if (isSplit) {
      const names = membersText
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean);

      if (names.length > 0) {
        const splitAmount = Math.round(amount / names.length);
        splitMembers = names.map((memberName, idx) => ({
          id: `m_${Date.now()}_${idx}`,
          name: memberName,
          amount: splitAmount,
          isPaid: memberName.toLowerCase() === 'yo', // Si dice 'Yo', asumimos pagado inicialmente si desea
          paidDate: memberName.toLowerCase() === 'yo' ? new Date().toISOString().split('T')[0] : null,
          receiptUri: null,
        }));
      }
    }

    const newBill = {
      id: `bill_${Date.now()}`,
      name: name.trim(),
      category,
      estimatedAmount: amount,
      dueDay,
      isPaid: false,
      paidDate: null,
      receiptUri: null,
      isSplit,
      splitMembers,
    };

    onSave(newBill);

    // Reset
    setName('');
    setAmountText('');
    setDueDayText('15');
    setIsSplit(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Nueva Cuenta Obligatoria</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nombre de la cuenta / Empresa</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Luz Enel, Agua Potable, Internet Fibra"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Tipo de servicio</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {Object.values(BillCategory).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Monto Estimado</Text>
                <View style={styles.currencyWrap}>
                  <Text style={styles.prefix}>$</Text>
                  <TextInput
                    style={styles.currencyInput}
                    keyboardType="numeric"
                    placeholder="45000"
                    value={amountText}
                    onChangeText={setAmountText}
                  />
                </View>
              </View>

              <View style={{ width: 110 }}>
                <Text style={styles.label}>Día Vencimiento</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Día (1-31)"
                  value={dueDayText}
                  onChangeText={setDueDayText}
                />
              </View>
            </View>

            {/* Opción de dividir en la casa */}
            <View style={styles.splitToggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.splitToggleTitle}>Dividir entre los de la casa</Text>
                <Text style={styles.splitToggleSub}>
                  Divide el total y lleva control de quién te ha transferido su parte.
                </Text>
              </View>
              <Switch
                value={isSplit}
                onValueChange={setIsSplit}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={isSplit ? '#3B82F6' : '#F3F4F6'}
              />
            </View>

            {isSplit && (
              <View style={styles.splitInputContainer}>
                <Text style={styles.label}>Nombres de las personas (separados por coma)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Yo, Hermano, Papá"
                  value={membersText}
                  onChangeText={setMembersText}
                />
              </View>
            )}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Guardar Cuenta</Text>
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
  chipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#F59E0B',
  },
  chipText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
  splitToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  splitToggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  splitToggleSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    paddingRight: 8,
  },
  splitInputContainer: {
    marginTop: 6,
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  submitBtn: {
    backgroundColor: '#F59E0B',
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
