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
import { useTheme } from '../../context/ThemeContext';
import { IncomeCategory } from '../../models/types';
import { parseCurrencyInput } from '../../utils/currencyFormatter';

const CATEGORY_ICONS = {
  [IncomeCategory.SUELDO]: 'cash-outline',
  [IncomeCategory.VENTA]: 'cart-outline',
  [IncomeCategory.FREELANCE]: 'laptop-outline',
  [IncomeCategory.INVERSION]: 'trending-up-outline',
  [IncomeCategory.REGALO]: 'gift-outline',
  [IncomeCategory.OTRO]: 'wallet-outline',
};

export const AddIncomeModal = ({ visible, onClose, onSave }) => {
  const { colors, isDark } = useTheme();

  const [title, setTitle] = useState('');
  const [amountText, setAmountText] = useState('');
  const [category, setCategory] = useState(IncomeCategory.FREELANCE);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    const amount = parseCurrencyInput(amountText);

    if (!title.trim()) {
      Alert.alert('Falta descripción', 'Indica el concepto o motivo del ingreso (ej. Venta ropa, Turno extra).');
      return;
    }
    if (amount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto mayor a $0.');
      return;
    }

    const newIncome = {
      id: `inc_${Date.now()}`,
      title: title.trim(),
      amount,
      category,
      date: date || new Date().toISOString().split('T')[0],
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onSave(newIncome);

    // Resetear formulario
    setTitle('');
    setAmountText('');
    setCategory(IncomeCategory.FREELANCE);
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconWrap, { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#D1FAE5' }]}>
                <Ionicons name="arrow-down-circle" size={22} color={colors.success} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Añadir Ingreso</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Dinero extra, ventas o cobros variables
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Monto principal */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Monto recibido</Text>
            <View
              style={[
                styles.currencyWrap,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.prefix, { color: colors.success }]}>$</Text>
              <TextInput
                style={[styles.currencyInput, { color: colors.textPrimary }]}
                keyboardType="numeric"
                placeholder="45000"
                placeholderTextColor={colors.textMuted}
                value={amountText}
                onChangeText={setAmountText}
                autoFocus
              />
            </View>

            {/* Concepto / Título */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>¿De qué es este dinero?</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Ej. Venta marketplace, Pololo diseño, Turno extra"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Categoría */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Categoría</Text>
            <View style={styles.categoriesWrap}>
              {Object.values(IncomeCategory).map((cat) => {
                const isSelected = category === cat;
                const iconName = CATEGORY_ICONS[cat] || 'cash-outline';
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(52, 211, 153, 0.25)'
                            : '#D1FAE5'
                          : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.success : colors.border,
                      },
                    ]}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={iconName}
                      size={14}
                      color={isSelected ? colors.success : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color: isSelected ? (isDark ? '#34D399' : '#065F46') : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Fecha */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Fecha de ingreso (AAAA-MM-DD)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="2026-09-22"
              placeholderTextColor={colors.textMuted}
              value={date}
              onChangeText={setDate}
            />

            {/* Notas opcionales */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Notas u observaciones (opcional)</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Detalles sobre el cliente, transferencia, etc."
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />

            {/* Botón de Guardar */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.success }]}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Añadir al Saldo Disponible</Text>
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
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currencyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  prefix: {
    fontSize: 22,
    fontWeight: '800',
    marginRight: 6,
  },
  currencyInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 22,
    fontWeight: '800',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 22,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
