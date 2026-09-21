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
import { DebtCategory } from '../../models/types';
import { parseCurrencyInput } from '../../utils/currencyFormatter';

export const AddDebtModal = ({ visible, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(DebtCategory.PRESTAMO_BANCARIO);
  const [totalAmountText, setTotalAmountText] = useState('');
  const [totalInstallmentsText, setTotalInstallmentsText] = useState('12');
  const [monthlyAmountText, setMonthlyAmountText] = useState('');
  const [dueDayText, setDueDayText] = useState('5');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    const totalAmount = parseCurrencyInput(totalAmountText);
    const totalInstallments = parseInt(totalInstallmentsText, 10) || 1;
    const monthlyAmount = parseCurrencyInput(monthlyAmountText) || Math.round(totalAmount / totalInstallments);
    const dueDay = parseInt(dueDayText, 10) || 1;

    if (!name.trim()) {
      Alert.alert('Falta información', 'Por favor ingresa el nombre de la deuda.');
      return;
    }
    if (totalAmount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa el monto total de la deuda.');
      return;
    }

    const newDebt = {
      id: `debt_${Date.now()}`,
      name: name.trim(),
      category,
      totalAmount,
      remainingAmount: totalAmount,
      totalInstallments,
      paidInstallments: 0,
      monthlyAmount,
      monthlyDueDate: dueDay,
      notes: notes.trim(),
      paymentsHistory: [],
    };

    onSave(newDebt);

    // Reset
    setName('');
    setTotalAmountText('');
    setTotalInstallmentsText('12');
    setMonthlyAmountText('');
    setDueDayText('5');
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Nueva Deuda o Préstamo</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nombre de la deuda / Entidad</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Crédito Moto, Tarjeta Visa, Préstamo"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {Object.values(DebtCategory).map((cat) => (
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
                <Text style={styles.label}>Monto Total</Text>
                <View style={styles.currencyWrap}>
                  <Text style={styles.prefix}>$</Text>
                  <TextInput
                    style={styles.currencyInput}
                    keyboardType="numeric"
                    placeholder="2500000"
                    value={totalAmountText}
                    onChangeText={setTotalAmountText}
                  />
                </View>
              </View>

              <View style={{ width: 110 }}>
                <Text style={styles.label}>N° Cuotas</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="12"
                  value={totalInstallmentsText}
                  onChangeText={setTotalInstallmentsText}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Valor Cuota Mensual</Text>
                <View style={styles.currencyWrap}>
                  <Text style={styles.prefix}>$</Text>
                  <TextInput
                    style={styles.currencyInput}
                    keyboardType="numeric"
                    placeholder="Calculado auto"
                    value={monthlyAmountText}
                    onChangeText={setMonthlyAmountText}
                  />
                </View>
              </View>

              <View style={{ width: 110 }}>
                <Text style={styles.label}>Día de Pago</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Día (1-31)"
                  value={dueDayText}
                  onChangeText={setDueDayText}
                />
              </View>
            </View>

            <Text style={styles.label}>Notas adicionales (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Tasa fija, seguro de desgravamen incluido"
              value={notes}
              onChangeText={setNotes}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Guardar Deuda</Text>
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
    backgroundColor: '#6366F1',
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
  submitBtn: {
    backgroundColor: '#6366F1',
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
