import React, { useState, useEffect } from 'react';
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
import { SocialDebtAdjustmentType } from '../../models/types';
import { formatCurrency, parseCurrencyInput } from '../../utils/currencyFormatter';

export const AdjustSocialDebtModal = ({ visible, item, onClose, onSave }) => {
  const { colors, isDark } = useTheme();

  const [adjustmentType, setAdjustmentType] = useState(SocialDebtAdjustmentType.INCREASE);
  const [amountText, setAmountText] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (visible) {
      setAdjustmentType(SocialDebtAdjustmentType.INCREASE);
      setAmountText('');
      setReason('');
    }
  }, [visible]);

  if (!item) return null;

  const currentTotal = item.totalAmount || 0;
  const currentPaid = item.paidAmount || 0;
  const currentRemaining = Math.max(0, currentTotal - currentPaid);

  const parsedAmount = parseCurrencyInput(amountText);

  // Proyección del nuevo saldo
  let projectedTotal = currentTotal;
  let projectedRemaining = currentRemaining;

  if (adjustmentType === SocialDebtAdjustmentType.INCREASE) {
    projectedTotal = currentTotal + parsedAmount;
    projectedRemaining = currentRemaining + parsedAmount;
  } else {
    projectedTotal = Math.max(currentPaid, currentTotal - parsedAmount);
    projectedRemaining = Math.max(0, currentRemaining - parsedAmount);
  }

  const handleSubmit = () => {
    if (parsedAmount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto de ajuste mayor a $0.');
      return;
    }

    if (!reason.trim()) {
      Alert.alert(
        'Falta motivo',
        'Ingresa una breve razón del ajuste (ej. "Préstamo adicional", "Descuento acordado").'
      );
      return;
    }

    onSave(item.id, {
      type: adjustmentType,
      amount: parsedAmount,
      reason: reason.trim(),
    });

    onClose();
  };

  const isIncrease = adjustmentType === SocialDebtAdjustmentType.INCREASE;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {/* Encabezado */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIconWrap,
                  {
                    backgroundColor: isIncrease
                      ? isDark
                        ? 'rgba(245, 158, 11, 0.2)'
                        : '#FEF3C7'
                      : isDark
                      ? 'rgba(52, 211, 153, 0.2)'
                      : '#D1FAE5',
                  },
                ]}
              >
                <Ionicons
                  name={isIncrease ? 'trending-up' : 'trending-down'}
                  size={22}
                  color={isIncrease ? '#F59E0B' : colors.success}
                />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Ajustar Saldo de Deuda
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  {item.personName} • {item.concept}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Pestañas de Aumento (+) o Disminución (-) */}
            <View style={[styles.tabContainer, { backgroundColor: colors.surfaceSubtle }]}>
              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  isIncrease && {
                    backgroundColor: colors.surface,
                    borderColor: '#F59E0B',
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => setAdjustmentType(SocialDebtAdjustmentType.INCREASE)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="add-circle"
                  size={16}
                  color={isIncrease ? '#F59E0B' : colors.textMuted}
                />
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: isIncrease ? (isDark ? '#FCD34D' : '#B45309') : colors.textMuted,
                      fontWeight: isIncrease ? '800' : '600',
                    },
                  ]}
                >
                  Aumentar (+)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  !isIncrease && {
                    backgroundColor: colors.surface,
                    borderColor: colors.success,
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => setAdjustmentType(SocialDebtAdjustmentType.DECREASE)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="remove-circle"
                  size={16}
                  color={!isIncrease ? colors.success : colors.textMuted}
                />
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: !isIncrease ? colors.success : colors.textMuted,
                      fontWeight: !isIncrease ? '800' : '600',
                    },
                  ]}
                >
                  Disminuir (-)
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.tabDescription, { color: colors.textMuted }]}>
              {isIncrease
                ? 'Sumar dinero a la deuda (ej. préstamo adicional, otro consumo en la salida, corrección).'
                : 'Rebajar o descontar saldo (ej. descuento pactado, perdón parcial, no consumió algo).'}
            </Text>

            {/* Input de Monto a Ajustar */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Monto a {isIncrease ? 'aumentar' : 'rebajar'}</Text>
            <View
              style={[
                styles.currencyWrap,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.prefix, { color: isIncrease ? '#F59E0B' : colors.success }]}>
                {isIncrease ? '+' : '-'} $
              </Text>
              <TextInput
                style={[styles.currencyInput, { color: colors.textPrimary }]}
                keyboardType="numeric"
                placeholder="5000"
                placeholderTextColor={colors.textMuted}
                value={amountText}
                onChangeText={setAmountText}
                autoFocus
              />
            </View>

            {/* Motivo o Justificación */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Motivo del ajuste</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder={
                isIncrease
                  ? 'Ej. Se sumó el postre, Uber de vuelta'
                  : 'Ej. Descuento acordado, no tomó cerveza'
              }
              placeholderTextColor={colors.textMuted}
              value={reason}
              onChangeText={setReason}
            />

            {/* Resumen del impacto en el saldo */}
            <View
              style={[
                styles.previewCard,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.previewTitle, { color: colors.textPrimary }]}>
                Resumen del Ajuste
              </Text>

              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: colors.textMuted }]}>
                  Saldo pendiente actual:
                </Text>
                <Text style={[styles.previewVal, { color: colors.textSecondary }]}>
                  {formatCurrency(currentRemaining)}
                </Text>
              </View>

              {parsedAmount > 0 && (
                <View style={styles.previewRow}>
                  <Text style={[styles.previewLabel, { color: colors.textMuted }]}>
                    Ajuste ({isIncrease ? 'Aumento' : 'Rebaja'}):
                  </Text>
                  <Text
                    style={[
                      styles.previewVal,
                      { color: isIncrease ? '#F59E0B' : colors.success, fontWeight: '700' },
                    ]}
                  >
                    {isIncrease ? '+' : '-'} {formatCurrency(parsedAmount)}
                  </Text>
                </View>
              )}

              <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />

              <View style={styles.previewRow}>
                <Text style={[styles.previewTotalLabel, { color: colors.textPrimary }]}>
                  Nuevo saldo pendiente:
                </Text>
                <Text
                  style={[
                    styles.previewTotalVal,
                    {
                      color:
                        projectedRemaining <= 0
                          ? colors.success
                          : isIncrease
                          ? colors.textPrimary
                          : colors.success,
                    },
                  ]}
                >
                  {projectedRemaining <= 0 ? '¡Saldado!' : formatCurrency(projectedRemaining)}
                </Text>
              </View>
            </View>

            {/* Botón de Confirmación */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                {
                  backgroundColor: isIncrease ? '#D97706' : colors.success,
                },
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Aplicar Ajuste al Saldo</Text>
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
    marginBottom: 14,
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
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    gap: 6,
    marginBottom: 6,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
  },
  tabDescription: {
    fontSize: 12,
    marginBottom: 12,
    paddingHorizontal: 4,
    lineHeight: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
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
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 16,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewLabel: {
    fontSize: 13,
  },
  previewVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  previewDivider: {
    height: 1,
    marginVertical: 8,
  },
  previewTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  previewTotalVal: {
    fontSize: 17,
    fontWeight: '800',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 20,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
